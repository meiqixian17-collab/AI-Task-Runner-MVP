# Verification

本文件记录 GitHub 简历展示入口刷新后的本地验证结果。

## 2026-06-22

本次验证范围：

- README 首屏、项目说明、运行方式和展示资产引用。
- `public/portfolio/` 中 5 张关键流程图和 1 张 README 产品海报。
- Case Study 跳转入口。
- 构建、测试和提交边界。

已运行：

```bash
npm run portfolio:capture
npm run readme:cover
git diff --check
npm run build
npm run test:all
```

结果：

- `npm run portfolio:capture` 通过，重新生成 5 张当前 UI 流程图：
  - `public/portfolio/01-task-entry.png`
  - `public/portfolio/02-current-step.png`
  - `public/portfolio/03-stepcard-executing.png`
  - `public/portfolio/04-clarification.png`
  - `public/portfolio/05-resistance-recovery.png`
- `npm run readme:cover` 通过，生成 `public/portfolio/ai-task-runner-cover.png`。
- 已人工查看 README 产品海报和关键流程图，确认不是空白图，文字可读，首图不是单纯界面截图。
- `git diff --check` 通过；仅出现 Windows 换行提示，不影响 diff 检查。
- `npm run build` 通过。
- `npm run test:all` 通过，覆盖 build、simple、immediate、duplicate、duplicate-retry、prompt、completion-model、completion、completion-checkpoint、quality 和 resistance。
- Vite 输出 CJS API deprecation warning，不影响构建结果。

发布边界：

- 当前 README 不引用现有 MP4 或 `video/out/` 产物。
- 当前 README 不放线上 Demo 地址；后续只有在真实部署 URL 重新验证后再补充。
- `server/.env`、`.env*`、日志、`node_modules/`、`dist/`、`.tmp*/` 和 `video/out/` 不应提交。
- `public/portfolio/` 只保留本次 README 和 Case Study 需要的 6 个展示资产。
