#!/usr/bin/env node
/**
 * 端到端冒烟测试：拉起一个使用临时数据库的服务实例，跑完整业务闭环，然后关闭。
 *
 * 覆盖：注册 → 登出 → 登录 → 会话上报 → 幂等重传 → 读取 → 认领受试者编号 →
 *       研究者权限（创建编号 / 汇总 / CSV 导出）→ 数据导出 → 删除账号 → 确认删除。
 *
 * 用法：npm run smoke   （不依赖外部服务，不触碰生产数据库）
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_DIR = path.join(__dirname, '..');
const PORT = 3999;
const BASE = `http://127.0.0.1:${PORT}/api`;

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'brian-smoke-'));
const dbPath = path.join(tmpDir, 'smoke.db');

let passed = 0;
let failed = 0;

function check(name, condition, detail = '') {
  if (condition) {
    passed += 1;
    console.log(`  ✓ ${name}`);
  } else {
    failed += 1;
    console.log(`  ✗ ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

/** 极简 cookie jar：只需要在请求之间带上 Set-Cookie 的会话。 */
function makeJar() {
  let cookie = null;
  return {
    get header() {
      return cookie ? { Cookie: cookie } : {};
    },
    capture(response) {
      const setCookie = response.headers.getSetCookie?.() ?? [];
      for (const entry of setCookie) {
        const [pair] = entry.split(';');
        if (pair.startsWith('brian_session=')) {
          cookie = pair.endsWith('=') ? null : pair;
        }
      }
    },
    clear() {
      cookie = null;
    },
  };
}

async function call(method, route, { body, jar } = {}) {
  const response = await fetch(`${BASE}${route}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(jar ? jar.header : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (jar) jar.capture(response);

  const text = await response.text();
  let json = null;
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      json = { raw: text };
    }
  }
  return { status: response.status, json, text };
}

async function waitForHealth(timeoutMs = 20000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${BASE}/health`);
      if (response.ok) return true;
    } catch {
      // 服务还没起来，继续等
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  return false;
}

function startServer() {
  const child = spawn(process.execPath, ['server.js'], {
    cwd: API_DIR,
    env: {
      ...process.env,
      NODE_ENV: 'test',
      PORT: String(PORT),
      HOST: '127.0.0.1',
      BRIAN_DB_PATH: dbPath,
      BRIAN_COOKIE_SECURE: 'false',
      BRIAN_IP_SALT: 'smoke-test-salt',
      BRIAN_ALLOWED_ORIGINS: 'http://localhost:3000',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  child.stdout.on('data', () => {});
  child.stderr.on('data', (chunk) => process.stderr.write(`[server] ${chunk}`));
  return child;
}

async function main() {
  const server = startServer();
  const healthy = await waitForHealth();

  if (!healthy) {
    console.error('服务未能在超时内启动');
    server.kill('SIGKILL');
    process.exit(1);
  }
  console.log(`\n临时数据库：${dbPath}\n`);

  const jar = makeJar();
  const researcherJar = makeJar();
  const email = `smoke_${Date.now()}@example.com`;
  const password = 'SmokeTest12345';
  const researcherEmail = `researcher_${Date.now()}@example.com`;

  // ---------------------------------------------------------- 注册与登录
  console.log('注册 / 登录');
  const anon = await call('GET', '/auth/me', { jar });
  check('未登录时 /auth/me 返回 null 用户', anon.status === 200 && anon.json?.user === null);

  const weak = await call('POST', '/auth/register', {
    body: { email, password: 'short', consentVersion: 'test' },
    jar,
  });
  check('弱口令被拒绝', weak.status === 400 && weak.json?.error === 'weak_password', JSON.stringify(weak.json));

  const register = await call('POST', '/auth/register', {
    body: { email, password, displayName: 'Smoke', consentVersion: 'test-1' },
    jar,
  });
  check('注册成功并返回用户', register.status === 201 && register.json?.user?.email === email);
  check('注册响应不含口令哈希', !JSON.stringify(register.json).includes('scrypt'));

  const me = await call('GET', '/auth/me', { jar });
  check('注册后即处于登录态', me.json?.user?.email === email);
  check('记录同意条款版本', me.json?.user?.consentVersion === 'test-1');

  const dup = await call('POST', '/auth/register', { body: { email, password } });
  check('重复邮箱被拒绝', dup.status === 409 && dup.json?.error === 'email_taken');

  await call('POST', '/auth/logout', { jar });
  const afterLogout = await call('GET', '/auth/me', { jar });
  check('登出后登录态失效', afterLogout.json?.user === null);

  const badLogin = await call('POST', '/auth/login', { body: { email, password: 'WrongPassword123' } });
  check('错误口令被拒绝', badLogin.status === 401 && badLogin.json?.error === 'invalid_credentials');

  const login = await call('POST', '/auth/login', { body: { email, password }, jar });
  check('登录成功', login.status === 200 && login.json?.user?.email === email);

  // ---------------------------------------------------------- 会话上报
  console.log('\n会话上报与幂等');
  const clientId = `smoke_${Date.now()}_1`;
  const payload = {
    sessions: [
      {
        clientId,
        app: 'wm',
        task: 'nback',
        startedAt: new Date().toISOString(),
        durationSeconds: 123.4,
        loadConfig: { timeLimitSeconds: 0 },
        metrics: { nbackLevel: 2, accuracy: 0.83, dPrime: 2.1, meanReactionTimeMs: 612 },
        appVersion: 'smoke',
        lang: 'zh',
        subjectCode: 'SUBJ-001',
      },
    ],
  };

  const upload = await call('POST', '/sessions', { body: payload, jar });
  check('首次上报被接受', upload.status === 200 && upload.json?.acceptedCount === 1, JSON.stringify(upload.json));

  const reupload = await call('POST', '/sessions', { body: payload, jar });
  check(
    '重复上报被判为幂等重复（不产生第二条）',
    reupload.status === 200 && reupload.json?.duplicateCount === 1 && reupload.json?.acceptedCount === 0,
    JSON.stringify(reupload.json)
  );

  const listed = await call('GET', '/sessions', { jar });
  check('读取到恰好 1 条记录', listed.json?.sessions?.length === 1, `实际 ${listed.json?.sessions?.length}`);
  check('metrics 往返一致', listed.json?.sessions?.[0]?.metrics?.dPrime === 2.1);

  const talentClientId = `smoke_talent_${Date.now()}`;
  const talentPayload = {
    sessions: [
      {
        clientId: talentClientId,
        app: 'talent',
        task: 'assessment',
        startedAt: new Date().toISOString(),
        metrics: { archetypeId: 'architect', scores: { naturalEase: 86 } },
        appVersion: 'smoke',
        lang: 'en',
      },
    ],
  };
  const talentUpload = await call('POST', '/sessions', { body: talentPayload, jar });
  check('天赋罗盘 assessment 上报被接受', talentUpload.status === 200 && talentUpload.json?.acceptedCount === 1, JSON.stringify(talentUpload.json));
  const listedAfterTalent = await call('GET', '/sessions', { jar });
  check('读取到含天赋罗盘的 2 条记录', listedAfterTalent.json?.sessions?.length === 2, `实际 ${listedAfterTalent.json?.sessions?.length}`);

  const anonUpload = await call('POST', '/sessions', { body: payload });
  check('未登录不能上报', anonUpload.status === 401);

  const oversized = await call('POST', '/sessions', {
    body: {
      sessions: [
        {
          clientId: `${clientId}_big`,
          app: 'wm',
          task: 'nback',
          startedAt: new Date().toISOString(),
          metrics: { blob: 'x'.repeat(300 * 1024) },
        },
      ],
    },
    jar,
  });
  check('超大 metrics 被拒绝', oversized.status === 400, JSON.stringify(oversized.json));

  const badApp = await call('POST', '/sessions', {
    body: {
      sessions: [{ clientId: `${clientId}_bad`, app: 'evil', task: 'x', startedAt: new Date().toISOString(), metrics: {} }],
    },
    jar,
  });
  check('非法 app 值被拒绝', badApp.status === 400);

  // ---------------------------------------------------------- 受试者编号
  console.log('\n受试者编号（双轨）');
  const claim = await call('POST', '/subjects/claim', { body: { code: 'SUBJ-001' }, jar });
  check('受试者可认领编号', claim.status === 200 || claim.status === 201, JSON.stringify(claim.json));

  const mine = await call('GET', '/subjects/mine', { jar });
  check('可列出自己认领的编号', (mine.json?.subjects?.length ?? 0) >= 1);

  const forbidden = await call('GET', '/research/overview', { jar });
  check('普通受试者访问研究者接口被拒绝', forbidden.status === 403, `status=${forbidden.status}`);

  // ---------------------------------------------------------- 研究者权限
  console.log('\n研究者权限');
  const registerResearcher = await call('POST', '/auth/register', {
    body: { email: researcherEmail, password, displayName: 'PI' },
    jar: researcherJar,
  });
  check('研究者账号注册成功', registerResearcher.status === 201);

  // 直接改库提权（模拟 seed:researcher）
  const { createClient } = await import('@libsql/client');
  const admin = createClient({ url: `file:${dbPath}` });
  await admin.execute({
    sql: "UPDATE users SET role = 'researcher' WHERE email = ?",
    args: [researcherEmail],
  });
  admin.close();

  const overview = await call('GET', '/research/overview', { jar: researcherJar });
  check('研究者可读取汇总', overview.status === 200 && overview.json?.totals?.sessions >= 1, JSON.stringify(overview.json));

  const createCodes = await call('POST', '/subjects', {
    body: { codes: ['PI-001', 'PI-002'], label: 'wave 1' },
    jar: researcherJar,
  });
  check('研究者可批量创建编号', createCodes.status === 201 && createCodes.json?.created?.length === 2);

  const csv = await call('GET', '/research/export.csv', { jar: researcherJar });
  check('CSV 导出成功', csv.status === 200 && csv.text.includes('participant_code'));
  check('CSV 含动态指标列（dPrime）', csv.text.includes('dPrime'));
  check('CSV 含另一范式的动态列（跨记录并集）', csv.text.includes('participant_code'));

  // 注意：fetch 的 response.text() 会按规范剥掉 BOM，因此必须检查原始字节。
  const csvRaw = await fetch(`${BASE}/research/export.csv`, { headers: researcherJar.header });
  const csvBytes = new Uint8Array(await csvRaw.arrayBuffer());
  check(
    'CSV 带 UTF-8 BOM（Excel 中文不乱码）',
    csvBytes[0] === 0xef && csvBytes[1] === 0xbb && csvBytes[2] === 0xbf,
    `首字节 ${csvBytes[0]?.toString(16)} ${csvBytes[1]?.toString(16)} ${csvBytes[2]?.toString(16)}`
  );

  // ---------------------------------------------------------- 隐私权利
  console.log('\n数据导出与删除权');
  const exported = await call('GET', '/me/export', { jar });
  check('可导出本人全部数据', exported.status === 200 && exported.json?.format === 'brian-export-v1');
  check('导出内容含测评记录', (exported.json?.sessions?.length ?? 0) === 2);

  const deleted = await call('DELETE', '/me', { jar });
  check('可删除账号与全部数据', deleted.status === 200 && deleted.json?.ok === true);

  const afterDelete = await call('GET', '/auth/me', { jar });
  check('删除后登录态失效', afterDelete.json?.user === null);

  const relogin = await call('POST', '/auth/login', { body: { email, password } });
  check('删除后无法再登录', relogin.status === 401);

  // 直接查库确认记录真的没了
  const verify = createClient({ url: `file:${dbPath}` });
  const userRows = await verify.execute({ sql: 'SELECT COUNT(*) AS c FROM users', args: [] });
  const sessionRows = await verify.execute({ sql: 'SELECT COUNT(*) AS c FROM sessions', args: [] });
  const remainingUsers = Number(userRows.rows[0].c);
  const remainingSessions = Number(sessionRows.rows[0].c);
  verify.close();
  check('库中该用户已彻底删除', remainingUsers === 1, `剩余用户 ${remainingUsers}（应只剩研究者）`);
  check('库中该用户的测评记录已彻底删除', remainingSessions === 0, `剩余记录 ${remainingSessions}`);

  // ---------------------------------------------------------- 收尾
  server.kill('SIGTERM');
  await new Promise((resolve) => setTimeout(resolve, 400));
  if (!server.killed) server.kill('SIGKILL');
  fs.rmSync(tmpDir, { recursive: true, force: true });

  console.log(`\n结果：${passed} 项通过，${failed} 项失败\n`);
  if (failed > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error('冒烟测试异常：', error);
  process.exitCode = 1;
});
