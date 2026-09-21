/**
 * pm2 进程配置（模板）。
 *
 * 部署位置：/srv/brian-api/ecosystem.config.cjs
 * 敏感配置放在同目录的 .env（chmod 600，权限 root:root，不进仓库），
 * 由 api/lib/config.js 内置的加载器读取。
 *
 * 首次部署：
 *   pm2 start ecosystem.config.cjs && pm2 save
 * 更新代码后：
 *   pm2 reload brian-api
 */
module.exports = {
  apps: [
    {
      name: 'brian-api',
      script: 'server.js',
      cwd: '/srv/brian-api',
      // 单实例 fork 模式：SQLite 是单写入者，多实例会互相争锁。
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_restarts: 10,
      // 内存超限自动重启，避免小内存机器被拖垮
      max_memory_restart: '220M',
      watch: false,
      env: {
        NODE_ENV: 'production',
        HOST: '127.0.0.1',
        PORT: 3011,
        // 数据库与备份都放在发布目录之外，rsync --delete 不会碰到
        BRIAN_DATA_DIR: '/var/www/brian-data',
        BRIAN_BACKUP_DIR: '/var/www/brian-data/backups',
        BRIAN_ALLOWED_ORIGINS: 'https://brian.mplusm.site',
        BRIAN_COOKIE_SECURE: 'true',
        BRIAN_SESSION_TTL_DAYS: '30',
        BRIAN_OPEN_REGISTRATION: 'true',
        BRIAN_CONSENT_VERSION: '2026-09-1',
        // BRIAN_IP_SALT 与 BRIAN_RESEARCHER_* 放在 .env，不要写在这里
      },
      error_file: '/var/log/brian-api/error.log',
      out_file: '/var/log/brian-api/out.log',
      merge_logs: true,
      time: true,
    },
  ],
};
