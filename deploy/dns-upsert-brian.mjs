#!/usr/bin/env node
/**
 * 幂等地创建/更新 DNSPod 解析记录：brian.mplusm.site -> A -> 43.133.145.77
 *
 * 不依赖任何 npm 包：腾讯云 API 的 TC3-HMAC-SHA256 签名在这里直接实现，
 * 只需要 Node 18+（使用内置 crypto 与全局 fetch）。
 *
 * 用法：
 *   export TENCENTCLOUD_SECRET_ID="..."
 *   export TENCENTCLOUD_SECRET_KEY="..."
 *   node deploy/dns-upsert-brian.mjs
 *
 * 可选环境变量：
 *   DNS_DOMAIN     默认 mplusm.site
 *   DNS_SUB        默认 brian
 *   DNS_TARGET_IP  默认 43.133.145.77
 *   DNS_RECORD_LINE 默认 "默认"
 *   DNS_TTL        默认 600
 *   DRY_RUN=1      只查询现状，不写入
 *
 * ⚠️ 密钥只从环境变量读取，绝不写入仓库。执行完请 unset 或关闭终端。
 */
import { createHash, createHmac } from 'node:crypto';

const HOST = 'dnspod.tencentcloudapi.com';
const SERVICE = 'dnspod';
const VERSION = '2021-03-23';
const ALGORITHM = 'TC3-HMAC-SHA256';

const SECRET_ID = process.env.TENCENTCLOUD_SECRET_ID;
const SECRET_KEY = process.env.TENCENTCLOUD_SECRET_KEY;

const domain = process.env.DNS_DOMAIN || 'mplusm.site';
const subdomain = process.env.DNS_SUB || 'brian';
const targetIp = process.env.DNS_TARGET_IP || '43.133.145.77';
const recordLine = process.env.DNS_RECORD_LINE || '默认';
const ttl = Number(process.env.DNS_TTL || 600);
const dryRun = process.env.DRY_RUN === '1';

const fullHost = `${subdomain}.${domain}`;

// ---------------------------------------------------------------- TC3 签名

const sha256Hex = (input) => createHash('sha256').update(input, 'utf8').digest('hex');
const hmac = (key, input) => createHmac('sha256', key).update(input, 'utf8').digest();

function buildAuthorization(payload, action, timestamp) {
  const date = new Date(timestamp * 1000).toISOString().slice(0, 10);

  // 只签名这三个 header，顺序必须按字典序，并按规范小写 + 去首尾空格。
  const canonicalHeaders =
    'content-type:application/json; charset=utf-8\n' + `host:${HOST}\n` + `x-tc-action:${action.toLowerCase()}\n`;
  const signedHeaders = 'content-type;host;x-tc-action';

  const canonicalRequest = [
    'POST',
    '/',
    '', // 无 query string（DNSPod 全部参数走 JSON body）
    canonicalHeaders,
    signedHeaders,
    sha256Hex(payload),
  ].join('\n');

  const stringToSign = [ALGORITHM, timestamp, `${date}/${SERVICE}/tc3_request`, sha256Hex(canonicalRequest)].join('\n');

  const secretDate = hmac(`TC3${SECRET_KEY}`, date);
  const secretService = hmac(secretDate, SERVICE);
  const secretSigning = hmac(secretService, 'tc3_request');
  const signature = createHmac('sha256', secretSigning).update(stringToSign, 'utf8').digest('hex');

  return (
    `${ALGORITHM} Credential=${SECRET_ID}/${date}/${SERVICE}/tc3_request, ` +
    `SignedHeaders=${signedHeaders}, Signature=${signature}`
  );
}

async function callApi(action, params = {}) {
  const payload = JSON.stringify(params);
  const timestamp = Math.floor(Date.now() / 1000);

  const response = await fetch(`https://${HOST}/`, {
    method: 'POST',
    headers: {
      Authorization: buildAuthorization(payload, action, timestamp),
      'Content-Type': 'application/json; charset=utf-8',
      Host: HOST,
      'X-TC-Action': action,
      'X-TC-Timestamp': String(timestamp),
      'X-TC-Version': VERSION,
    },
    body: payload,
  });

  const text = await response.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`${action} 返回了非 JSON 响应 (HTTP ${response.status})：${text.slice(0, 300)}`);
  }

  const body = json.Response;
  if (!body) throw new Error(`${action} 响应缺少 Response 字段：${text.slice(0, 300)}`);
  if (body.Error) {
    // “记录列表为空”不是失败：它恰恰表示“该子域还没有记录”，应继续走创建分支。
    if (body.Error.Code === 'ResourceNotFound.NoDataOfRecord') {
      return { RecordList: [] };
    }
    throw new Error(`${action} 失败：${body.Error.Code} - ${body.Error.Message}`);
  }
  return body;
}

// ---------------------------------------------------------------- 主流程

async function main() {
  if (!SECRET_ID || !SECRET_KEY) {
    console.error('缺少 TENCENTCLOUD_SECRET_ID / TENCENTCLOUD_SECRET_KEY 环境变量。');
    console.error('示例：');
    console.error('  export TENCENTCLOUD_SECRET_ID="AKID..."');
    console.error('  export TENCENTCLOUD_SECRET_KEY="..."');
    console.error('  node deploy/dns-upsert-brian.mjs');
    process.exit(1);
  }

  console.log(`目标：${fullHost}  A  ${targetIp}  (线路 ${recordLine}, TTL ${ttl})`);
  console.log('查询现有解析记录…');

  const listed = await callApi('DescribeRecordList', {
    Domain: domain,
    Subdomain: subdomain,
    RecordType: 'A',
    Limit: 100,
  });

  const records = listed.RecordList || [];
  const existing = records.find((r) => r.Name === subdomain && r.Type === 'A');

  if (existing) {
    if (existing.Value === targetIp) {
      console.log(`✓ 已存在且指向正确，无需修改（RecordId=${existing.RecordId}）。`);
      return;
    }
    console.log(`已存在记录 ${existing.Name} -> ${existing.Value}（RecordId=${existing.RecordId}），将更新为 ${targetIp}。`);
    if (dryRun) {
      console.log('[DRY_RUN] 跳过写入。');
      return;
    }
    const updated = await callApi('ModifyRecord', {
      Domain: domain,
      RecordId: existing.RecordId,
      SubDomain: subdomain,
      RecordType: 'A',
      RecordLine: recordLine,
      Value: targetIp,
      TTL: ttl,
    });
    console.log(`✓ 更新成功，RecordId=${updated.RecordId}`);
    return;
  }

  console.log('未找到现有 A 记录，将新建。');
  if (dryRun) {
    console.log('[DRY_RUN] 跳过写入。');
    return;
  }
  const created = await callApi('CreateRecord', {
    Domain: domain,
    SubDomain: subdomain,
    RecordType: 'A',
    RecordLine: recordLine,
    Value: targetIp,
    TTL: ttl,
  });
  console.log(`✓ 创建成功，RecordId=${created.RecordId}`);
}

main().catch((error) => {
  console.error('\n执行失败：', error.message);
  console.error('\n常见原因：');
  console.error('  - SecretId / SecretKey 不正确或已禁用');
  console.error('  - 该密钥所属账号没有 mplusm.site 的 DNSPod 权限（域名不在该账号下）');
  console.error('  - 服务器时间偏差超过 5 分钟会导致签名失效');
  process.exitCode = 1;
});
