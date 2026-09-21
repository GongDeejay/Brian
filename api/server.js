/**
 * Brian 认知神经科学平台 · 数据服务
 *
 * 部署：pm2 常驻，监听 127.0.0.1:3011，由 nginx 以 /api/ 反向代理。
 * 数据库位于发布目录之外（见 lib/config.js），避免 rsync --delete 清空数据。
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';

import { config } from './lib/config.js';
import { closeDb, migrate, scalar } from './db/index.js';
import { attachUser } from './lib/auth.js';
import { authRouter } from './routes/auth.js';
import { sessionsRouter } from './routes/sessions.js';
import { subjectsRouter } from './routes/subjects.js';
import { privacyRouter } from './routes/privacy.js';
import { researchRouter } from './routes/research.js';
import { ERROR_CODES } from './lib/validate.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// 位于 nginx 之后，需要信任代理头才能拿到真实客户端 IP（用于限流与审计哈希）。
app.set('trust proxy', true);
app.disable('x-powered-by');

// ------------------------------------------------------------------ 安全头
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  // API 响应不应被任何中间层缓存
  res.setHeader('Cache-Control', 'no-store');
  next();
});

// ------------------------------------------------------------------ CORS
// 生产环境前端与 API 同源，本不需要 CORS；这里仅为本地开发放行白名单来源。
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && config.allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  return next();
});

// ------------------------------------------------------------------ 请求体
app.use(express.json({ limit: '1mb' }));

// 每个请求尽力解析登录态（匿名也放行）
app.use(attachUser);

// ------------------------------------------------------------------ 路由
app.get('/api/health', async (_req, res) => {
  try {
    await scalar('SELECT 1 AS ok');
    res.json({ ok: true, service: 'brian-api', time: new Date().toISOString() });
  } catch (error) {
    res.status(503).json({ ok: false, error: error?.message || 'db unavailable' });
  }
});

app.use('/api/auth', authRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/subjects', subjectsRouter);
app.use('/api/me', privacyRouter);
app.use('/api/research', researchRouter);

app.use('/api', (_req, res) => {
  res.status(404).json({ error: ERROR_CODES.notFound });
});

// ------------------------------------------------------------------ 错误处理
// eslint-disable-next-line no-unused-vars
app.use((error, _req, res, _next) => {
  if (error?.type === 'entity.too.large') {
    return res.status(413).json({ error: ERROR_CODES.invalidRequest });
  }
  if (error instanceof SyntaxError && 'body' in error) {
    return res.status(400).json({ error: ERROR_CODES.invalidRequest });
  }
  console.error('[server] 未处理错误:', error);
  return res.status(500).json({ error: ERROR_CODES.serverError });
});

// ------------------------------------------------------------------ 启动
async function start() {
  const count = await migrate(path.join(__dirname, 'db', 'schema.sql'));
  console.log(`[brian-api] 数据库就绪: ${config.dbPath}（${count.tables} 张表 / ${count.indexes} 个索引）`);
  console.log(`[brian-api] 同意条款版本: ${config.consentVersion}`);
  console.log(`[brian-api] 开放注册: ${config.openRegistration}`);

  const server = app.listen(config.port, config.host, () => {
    console.log(`[brian-api] 监听 http://${config.host}:${config.port}`);
  });

  const shutdown = (signal) => {
    console.log(`[brian-api] 收到 ${signal}，正在关闭…`);
    server.close(async () => {
      await closeDb();
      process.exit(0);
    });
    // 兜底：5 秒内没关完就强制退出，避免 pm2 reload 卡住
    setTimeout(() => process.exit(0), 5000).unref();
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

start().catch((error) => {
  console.error('[brian-api] 启动失败:', error);
  process.exit(1);
});
