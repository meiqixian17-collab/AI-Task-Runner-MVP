# Verification

本文件记录 GitHub 发布前的本地验证结果。

## 2026-06-14

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

- `server/.env`、日志、`node_modules/`、`client/dist/`、`.tmp*/` 和 `video/out/` 均处于 ignored 状态。
- `git ls-files` 中没有真实 `.env`、日志、`node_modules/`、`dist/`、`.tmp*/` 或 `video/out/`。
- `server/.env.example` 是唯一被跟踪的 env 示例文件，只包含占位符。
