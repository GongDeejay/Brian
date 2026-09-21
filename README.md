# Brian 认知神经科学实验平台

在浏览器中直接运行的认知任务、潜能评估与脑科学导图平台，部署为静态站点：
**<https://brian.mplusm.site>**

| 路径 | 平台 | 内容 |
| --- | --- | --- |
| `/` | 站点入口页 | 各平台的导航与使用须知 |
| `/neuro/` | **NeuroClassify 分类与模式识别** | WCST、ID/ED 定势转移、WPT 概率分类、原型畸变迁移、Gabor RB/II |
| `/wm/` | **工作记忆训练与评估平台** | N-back、OSPAN 复杂运算跨度、视觉变化检测（Cowan's K）、五维认知画像 |
| `/talent/` | **优势潜能罗盘 (TalentCompass)** | 隐性优势测评、盖洛普 SIGN 模型、精力审计、360° 镜像视窗、纳瓦尔特定知识与 12 核心原型画像 |
| `/plasticity/` | **《神经可塑性》互动思维导图** | 大脑重塑机制导图、突触放电模拟、BDNF/髓鞘实践协议追踪 |

## ⚠️ 使用须知

本平台用于**教学演示、自我训练与科普体验**。任务范式参考公开文献实现，但**尚未经过标准化常模校验**，
结果**不构成任何医学诊断或临床结论**；也不应被当作经过验证的科研测量工具。
如有认知健康方面的疑虑，请咨询专业医疗机构。

所有数据仅保存在**用户本机浏览器**（localStorage）中，不会上传到服务器，也没有账号体系。

## 目录结构

```
.
├── index.html          # 站点入口页（纯静态，无构建步骤）
├── wm/                 # 工作记忆训练与评估平台
│   ├── src/
│   ├── public/
│   └── vite.config.ts  # base: '/wm/'
├── neuro/              # NeuroClassify 分类与模式识别平台
│   ├── src/
│   └── vite.config.ts  # base: '/neuro/'
├── talent/             # 优势潜能罗盘测评平台
│   ├── src/
│   └── vite.config.ts  # base: '/talent/'
├── plasticity/         # 《神经可塑性》互动思维导图
│   ├── src/
│   └── vite.config.ts  # base: '/plasticity/'
├── deploy/             # 部署资产（nginx 配置、DNS 脚本、说明）
└── .github/workflows/  # push 即自动构建并发布
```

## 本地开发

需要 **Node.js ≥ 20**（CI 使用 Node 20）。各平台相互独立，各自安装依赖：

```bash
# 工作记忆平台 → http://localhost:3000
cd wm && npm install && npm run dev

# NeuroClassify → http://localhost:3001
cd neuro && npm install && npm run dev

# 优势潜能罗盘 → http://localhost:3002
cd talent && npm install && npm run dev

# 《神经可塑性》互动思维导图 → http://localhost:3003
cd plasticity && npm install && npm run dev
```

四个平台都**不需要任何环境变量或 API Key**，构建与运行完全在前端完成。
（仓库中的 `.env.example` 是 AI Studio 脚手架的遗留物，代码从不读取它。）

## 构建

```bash
cd wm         && npm ci && npm run build   # 产物 wm/dist/
cd neuro      && npm ci && npm run build   # 产物 neuro/dist/
cd talent     && npm ci && npm run build   # 产物 talent/dist/
cd plasticity && npm ci && npm run build   # 产物 plasticity/dist/
```

产物的资源路径已经按子路径写好（`/wm/`、`/neuro/`、`/talent/`、`/plasticity/`）。**如果要部署到别的路径，
必须同步修改对应 `vite.config.ts` 里的 `base`**，否则页面会白屏。

## 测试

```bash
# 后端：30+ 项端到端断言（注册/登录/上报幂等/权限隔离/导出/删除权）
cd api && npm run smoke

# 布局回归：真实浏览器检查页面级横向溢出
# （英文文案更长，一旦把文档撑得比视口宽，居中内容就会整体偏左）
cd e2e && npm ci
node serve.mjs ../site 8099 &          # 或指向已构建的站点目录
node overflow-check.mjs http://127.0.0.1:8099
```

两者都在 CI 中于部署前执行：`npm run smoke` 与 `overflow-check.mjs`
（4 种宽度 × 2 种语言 × 各子应用页面组合）。

## 部署

推送到 `main` 分支后，GitHub Actions 会自动构建各前端平台、组装站点并通过 rsync 发布到服务器。
完整的一次性搭建步骤（DNS、nginx、HTTPS、GitHub Secrets）见 [`deploy/SETUP.md`](deploy/SETUP.md)。

## 已知限制

- 部分范式为**简化实现**，用于教学与体验，不等同于标准化施测流程（例如 OSPAN 的 set 数量少于标准版）。
- 数据仅存于浏览器本地：**清除浏览器数据即丢失**，换设备不同步。请使用各任务结果页的导出功能自行备份。
- 尚未实现标准化常模，因此报告中不提供「与人群比较」的百分位结论。

## 许可

未声明许可证时默认保留所有权利。如需开源，请补充 `LICENSE`。
