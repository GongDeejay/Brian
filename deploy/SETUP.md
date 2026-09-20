# 部署搭建指南 — brian.mplusm.site

一次性搭建步骤。完成后，每次 `git push` 到 `main` 都会自动构建并发布。

- **域名**：`brian.mplusm.site`
- **服务器**：腾讯云 `43.133.145.77`（OpenCloudOS 9.4 / nginx 1.28 / certbot 2.8）
- **站点根目录**：`/var/www/brian.mplusm.site`
- **站点结构**：`/`（入口页）、`/wm/`、`/neuro/`

---

## 1. DNS 解析

在 DNSPod 为 `mplusm.site` 添加一条 A 记录：

| 主机记录 | 记录类型 | 线路 | 记录值 | TTL |
| --- | --- | --- | --- | --- |
| `brian` | A | 默认 | `43.133.145.77` | 600 |

### 方式 A：控制台手动添加（推荐）

腾讯云控制台 → DNSPod → `mplusm.site` → 添加记录，按上表填写。

### 方式 B：脚本自动添加

仓库里的 `deploy/dns-upsert-brian.mjs` 是幂等的（已存在则更新，不存在则创建），
且不依赖任何 npm 包：

```bash
# 密钥仅从环境变量读取，不会写入仓库
export TENCENTCLOUD_SECRET_ID="AKID..."
export TENCENTCLOUD_SECRET_KEY="..."

# 先干跑，只查看现状不写入
DRY_RUN=1 node deploy/dns-upsert-brian.mjs

# 确认无误后正式执行
node deploy/dns-upsert-brian.mjs

# 用完立即清理
unset TENCENTCLOUD_SECRET_ID TENCENTCLOUD_SECRET_KEY
```

验证解析是否生效：

```bash
dig +short brian.mplusm.site @8.8.8.8
# 期望输出 43.133.145.77
```

> DNS 未生效前**不要**申请证书，Let's Encrypt 的 HTTP-01 校验会失败。

---

## 2. 服务器准备

```bash
ssh root@43.133.145.77

# 站点根目录（nginx worker 以 www 用户运行，需要可读可进入）
mkdir -p /var/www/brian.mplusm.site /var/www/certbot
chmod 755 /var/www/brian.mplusm.site /var/www/certbot

# 日志目录已存在，确认一下即可
ls -ld /www/wwwlogs
```

---

## 3. 下发 nginx 配置（两阶段）

仓库里准备了**两份**配置：

| 文件 | 用途 |
| --- | --- |
| `deploy/nginx/brian.mplusm.site.conf.bootstrap` | **首次申请证书前**使用（仅 80 端口，不引用还不存在的证书） |
| `deploy/nginx/brian.mplusm.site.conf` | **证书签发后**使用的正式配置（80 跳转 + 443 HTTPS） |

### 3.1 先装引导配置

```bash
# 在本机执行
scp deploy/nginx/brian.mplusm.site.conf.bootstrap \
    root@43.133.145.77:/www/server/panel/vhost/nginx/brian.mplusm.site.conf

# 在服务器上校验并加载
ssh root@43.133.145.77 'nginx -t && nginx -s reload'
```

此时 `http://brian.mplusm.site/` 应能访问（还没有内容，404 属正常），
且 `/.well-known/acme-challenge/` 已指向 `/var/www/certbot` —— 这是 certbot 校验所需的路径。

---

## 4. 申请 HTTPS 证书

```bash
ssh root@43.133.145.77

certbot certonly --webroot -w /var/www/certbot \
  -d brian.mplusm.site \
  --agree-tos --no-eff-email \
  -m 你的邮箱@example.com
```

成功后把正式配置覆盖上去（即第 3 步的第二阶段）：

```bash
# 在本机执行
scp deploy/nginx/brian.mplusm.site.conf \
    root@43.133.145.77:/www/server/panel/vhost/nginx/brian.mplusm.site.conf

ssh root@43.133.145.77 'nginx -t && nginx -s reload'
```

自动续期：服务器上已有 `0 3 * * * certbot renew --quiet --post-hook "..."` 的 cron，
新证书会被自动续期，无需额外配置。

验证：

```bash
curl -sI https://brian.mplusm.site/ | head -3
# 期望 HTTP/2（此时站点还没有内容，可能 404；第 6 步部署后应为 200）
```

---

## 5. 配置 GitHub Secrets

在 GitHub 仓库 → **Settings → Secrets and variables → Actions** 添加三个 Secret：

| Secret 名称 | 值 | 说明 |
| --- | --- | --- |
| `SERVER_HOST` | `43.133.145.77` | 服务器地址 |
| `SERVER_USER` | `root` | 部署用户 |
| `SERVER_SSH_KEY` | 私钥全文 | 见下方生成方法 |

生成一对**专用部署密钥**（不要复用个人密钥）：

```bash
# 本地执行
ssh-keygen -t ed25519 -C "github-actions-brian" -f ~/.ssh/brian_deploy -N ""

# 把公钥装到服务器（需要一次性输入密码，或复用你已有的 root 访问方式）
ssh-copy-id -i ~/.ssh/brian_deploy.pub root@43.133.145.77

# 验证可以免密登录
ssh -i ~/.ssh/brian_deploy root@43.133.145.77 'echo OK'

# 把私钥内容粘贴到 GitHub 的 SERVER_SSH_KEY
cat ~/.ssh/brian_deploy
```

> 该密钥只用于把构建产物同步到 `/var/www/brian.mplusm.site`。
> 若要进一步收紧权限，可以把它限制为只能执行 `rsync --server` 命令（`command=` 前置），
> 做法参见 `authorized_keys` 的 `command=` / `restrict` 选项。

---

## 6. 首次发布

```bash
git push origin main
```

GitHub Actions 会依次：安装依赖 → 构建两个平台 → 组装站点 → rsync 到服务器 → 自检状态码。

在仓库 **Actions** 标签页可以看到进度。成功后访问：

- <https://brian.mplusm.site/> — 入口页
- <https://brian.mplusm.site/wm/> — 工作记忆训练与评估平台
- <https://brian.mplusm.site/neuro/> — NeuroClassify 分类与模式识别

---

## 7. 日常维护

### 只发一个平台

两个平台在同一个仓库里，任何一次 push 都会重建两者。如果只想改一个，
直接在对应目录下开发即可——CI 会重新构建两个，但只有变化的部分会真正改变。

### 回滚

```bash
# 看发布历史
git log --oneline -10
# 回滚到上一个可用提交并重新发布
git revert <commit> && git push origin main
```

服务器上会保留 `BUILD_INFO.json`，记录线上版本对应的 commit 与 Actions run。

### 排查 404 / 白屏

| 现象 | 可能原因 |
| --- | --- |
| `https://brian.mplusm.site/` 404 | 还没部署过，或 `/var/www/brian.mplusm.site/index.html` 不存在 |
| `/wm/` 打开白屏、控制台在 `/assets/...` 上报 404 | `wm/vite.config.ts` 的 `base` 不是 `/wm/` |
| 证书报错 | DNS 未生效就申请了证书；重新执行第 1、4 步 |
| Actions 里 rsync 失败 | `SERVER_SSH_KEY` 私钥不对，或公钥没装到服务器 |
| 修改配置后不生效 | 忘了 `nginx -s reload`，或浏览器缓存了旧的 index.html |

### 本地预览「线上最终形态」

```bash
cd wm && npm run build && cd ../neuro && npm run build && cd ..
rm -rf /tmp/brian-site && mkdir -p /tmp/brian-site/wm /tmp/brian-site/neuro
cp index.html /tmp/brian-site/
cp -R wm/dist/. /tmp/brian-site/wm/
cp -R neuro/dist/. /tmp/brian-site/neuro/
python3 -m http.server 8080 --directory /tmp/brian-site
# 打开 http://localhost:8080/
```
