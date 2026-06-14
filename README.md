# AI Task Runner MVP

AI Task Runner 是一个面向个人任务启动与推进的本地 Web 应用。它不追求一次性生成完整计划，而是把用户当前任务拆成一个低阻力、可立刻执行的步骤，并在用户完成、卡住或信息不足时继续推进。

![AI Task Runner 当前步骤界面](public/portfolio/02-current-step.png)

Live Demo: https://your-vercel-app.vercel.app

Backend Health: https://your-backend-url.onrender.com/api/health

线上 Demo 的 AI Key 仅配置在后端部署平台环境变量中，不进入前端和 GitHub 仓库。

## 项目价值

很多 AI 工具会给用户一份完整计划，但真正卡住的地方通常是“现在到底先做哪一步”。这个项目把 AI 放进任务执行闭环里，重点处理三件事：

- 启动任务：把开放任务转成当前最小可执行动作。
- 持续推进：用户完成一步后，根据历史步骤生成自然衔接的下一步。
- 阻力恢复：用户卡住时，识别阻力类型并生成更低压力的 fallback step。

## 核心功能

- 任务列表：创建、进入、标记重要、删除任务。
- 当前步骤推进：输入任务后生成第一步，完成后继续生成下一步。
- StepCard：统一承载当前行动、执行状态、完成动作、卡点入口和恢复入口。
- 澄清流程：信息不足时先问一个关键问题，再继续生成具体步骤。
- 卡点恢复：处理太难、不想做、不确定、状态不适合等执行阻力。
- 完成判断：简单任务在完成 2 步或遇到重复步骤时进入完成确认。
- 本地持久化：使用 `localStorage` 保存任务列表和执行进度。

## 技术栈

- Frontend: React, Vite, localStorage
- Backend: Express
- AI Provider: DeepSeek API
- Tests: Node.js scripts, Vite build
- Demo assets: static screenshots

## 项目结构

```txt
ai-task-runner-mvp/
  client/          React + Vite frontend
  server/          Express API and AI provider services
  docs/            Showcase, architecture and quality materials
  public/          Static screenshots used by the app/docs
  scripts/         Capture and render helper scripts
```

更多架构说明见 [docs/architecture.md](docs/architecture.md)。

## 本地运行

安装依赖：

```bash
npm install
npm --prefix client install
npm --prefix server install
```

复制环境变量示例：

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

然后在 `server/.env` 填入真实 API key：

```env
DEEPSEEK_API_KEY=your_deepseek_api_key_here
DEEPSEEK_API_URL=https://api.deepseek.com/chat/completions
DEEPSEEK_MODEL=deepseek-chat
PORT=3001
CLIENT_ORIGIN=http://localhost:5173
```

本地 `client/.env` 可保持为空：

```env
VITE_API_BASE_URL=
```

空值表示前端继续请求相对路径 `/api/...`，由 Vite proxy 转发到本地后端。

启动开发环境：

```bash
npm run dev
```

访问地址：

```txt
Frontend: http://localhost:5173
Backend:  http://localhost:3001
```

## 验证

```bash
npm run build
npm run test:all
```

当前验证记录见 [docs/verification.md](docs/verification.md)。

## 在线部署

本项目按前后端分离部署：

- Frontend: Vercel
- Backend: Render 或 Railway
- AI Key: 只放在后端部署平台环境变量，不放入 Vercel、前端代码或 GitHub 仓库

Vercel 配置：

```txt
Build Command: npm --prefix client install && npm --prefix client run build
Output Directory: client/dist
Environment Variables:
  VITE_API_BASE_URL=https://your-backend-url.onrender.com
```

`VITE_API_BASE_URL` 只保存后端 URL。不要在 Vite 前端变量中配置 `DEEPSEEK_API_KEY`，因为 `VITE_*` 变量会被打包进前端资源。

Render 配置：

```txt
Root Directory: server
Build Command: npm install
Start Command: npm start
Environment Variables:
  DEEPSEEK_API_KEY=your_real_key
  DEEPSEEK_API_URL=https://api.deepseek.com/chat/completions
  DEEPSEEK_MODEL=deepseek-chat
  NODE_ENV=production
  CLIENT_ORIGIN=https://your-vercel-app.vercel.app
```

`PORT` 由 Render 自动注入；本地开发时默认使用 `3001`。

Railway 配置：

```txt
Build Command: npm --prefix server install
Start Command: npm --prefix server start
Healthcheck Path: /api/health
Environment Variables:
  DEEPSEEK_API_KEY=your_real_key
  DEEPSEEK_API_URL=https://api.deepseek.com/chat/completions
  DEEPSEEK_MODEL=deepseek-chat
  NODE_ENV=production
  CLIENT_ORIGIN=https://your-vercel-app.vercel.app
```

如果 Render 要求绑定银行卡，可以改用 Railway。仓库根目录的 `railway.json` 已固定后端构建、启动和健康检查命令，避免 Railway 在仓库根目录找不到 `start` 脚本。

## 展示材料

- 演示脚本：[docs/showcase-script.md](docs/showcase-script.md)
- 质量清单：[docs/quality-checklist.md](docs/quality-checklist.md)
- 截图素材：[public/portfolio/](public/portfolio/)

顶部 Live Demo 和 Backend Health 使用部署占位地址；完成 Vercel 和 Render 部署后替换为真实 URL。当前仓库保留本地 Demo、截图和演示脚本。

## GitHub 发布检查

- `server/.env`、`.env*`、日志、`node_modules/`、`dist/`、`.tmp*/`、`.tmp-screenshots/`、`.tmp-ui-audit/`、`docs/portfolio/`、`figma-import/`、`public/flow-demo*/`、`video/` 已通过 `.gitignore` 排除。
- `docs/portfolio/`、`figma-import/`、`video/` 不应进入 Git 跟踪列表；提交前可用 `git ls-files docs/portfolio figma-import video` 确认输出为空。
- `server/.env.example` 只包含占位符，可以提交。
- 提交前运行 `git status --short --ignored`，确认脏文件只出现在 ignored 列表中。
