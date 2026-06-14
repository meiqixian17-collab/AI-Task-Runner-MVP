# Verification

本文件记录 GitHub 发布前的本地验证结果。

## 2026-06-14

在线版准备：

- 前端支持 `VITE_API_BASE_URL`，本地未配置时仍请求相对路径 `/api/...`。
- 后端支持 `CLIENT_ORIGIN`；生产环境只允许显式配置的前端 origin，开发环境保留 `http://localhost:5173`。
- 新增 Vercel 和 Render 部署配置。
- 新增 `client/.env.example`，仅包含非敏感的 `VITE_API_BASE_URL`。
- 线上真实 URL、GitHub Actions 成功记录和端到端在线链路需要在平台部署完成后补充。

已运行：

```bash
npm run build
npm run test:all
$env:PORT='3999'; $env:CLIENT_ORIGIN='https://your-vercel-app.vercel.app'; node server/src/index.js
curl.exe -s http://127.0.0.1:3999/api/health
curl.exe -s -D - -o NUL -H 'Origin: https://your-vercel-app.vercel.app' http://127.0.0.1:3999/api/health
$env:NODE_ENV='production'; $env:CLIENT_ORIGIN='https://your-vercel-app.vercel.app'; $env:PORT='3999'; node server/src/index.js
curl.exe -s -D - -o NUL -H 'Origin: http://localhost:5173' http://127.0.0.1:3999/api/health
rg -n "DEEPSEEK_API_KEY|sk-[A-Za-z0-9]{20,}" client/dist client/src server README.md docs/verification.md server/.env.example client/.env.example
git ls-files docs/portfolio figma-import video
git diff --check
npm --prefix client run preview -- --host 127.0.0.1 --port 4173 --strictPort
Invoke-WebRequest http://127.0.0.1:4173/
```

结果：

- `npm run test:all` 通过。
- `http://127.0.0.1:3999/api/health` 返回 `{"ok":true,"message":"server is running"}`。
- `Origin: https://your-vercel-app.vercel.app` 返回 `Access-Control-Allow-Origin: https://your-vercel-app.vercel.app`。
- 生产环境下 `Origin: http://localhost:5173` 不返回 `Access-Control-Allow-Origin`。
- `client/dist` 中未检出 `DEEPSEEK_API_KEY` 或真实 key 形态；命中项仅为后端源码和文档占位说明。
- `git ls-files docs/portfolio figma-import video` 输出为空。
- `git diff --check` 通过。
- 构建预览 `http://127.0.0.1:4173/` 标题为 `AI Task Runner MVP`，页面包含任务入口相关文本，浏览器控制台无 error。
- 构建资源 `/assets/index-ZUfZrYk-.js` 和 `/assets/index-DEgCc_PR.css` 均返回 200。

已运行：

```bash
npm run build
npm run test:all
```

结果：

- `npm run build` 通过。
- `npm run test:all` 通过。
- Vite 输出了 CJS API deprecation warning，不影响构建结果。
- `npm run test:all` 覆盖 build、simple、immediate、duplicate、duplicate-retry、prompt、completion-model、completion、completion-checkpoint、quality 和 resistance。

本地运行检查：

```bash
$env:PORT='3002'; npm --prefix server run dev
npm --prefix client run dev -- --host 127.0.0.1 --port 5174 --strictPort
```

结果：

- `http://127.0.0.1:3002/api/health` 返回 `{"ok":true,"message":"server is running"}`。
- `http://127.0.0.1:5174/` 返回前端 HTML。
- 默认端口 `5173` 和 `3001` 当时已有本地进程占用，因此本次验证使用备用端口，未停止已有进程。

提交边界检查：

```bash
git status --short --ignored
git ls-files
```

结果：

- `server/.env`、日志、`node_modules/`、`client/dist/`、`.tmp*/`、`docs/portfolio/`、`figma-import/`、`public/flow-demo*/` 和 `video/` 均处于 ignored 状态。
- 发布到 GitHub 的干净历史中没有真实 `.env`、日志、`node_modules/`、`dist/`、`.tmp*/`、`docs/portfolio/`、`figma-import/`、`public/flow-demo*/` 或 `video/`。
- `server/.env.example` 是唯一被跟踪的 env 示例文件，只包含占位符。
