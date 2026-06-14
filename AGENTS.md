# AGENTS.md

本文件适用于整个仓库。进入任务后先读本文件，再读相关目录下的源码、脚本和文档。

## 项目概况

- 这是 `AI Task Runner MVP`：面向个人任务启动、当前步骤推进、阻力恢复和任务完成判断的本地 Web 应用。
- 前端在 `client/`，使用 React + Vite，入口是 `client/src/main.jsx`。
- 后端在 `server/`，使用 Express，AI Provider 相关逻辑在 `server/src/services/`。
- Figma 导入脚本在 `figma-import/`。
- 展示、作品集、视频素材和生成脚本在 `docs/`、`public/`、`scripts/`、`video/`。

## 工作原则

- 编码前先说明假设、目标和验证方式。遇到多种合理解释时列出选项；如果缺少关键信息，先问清楚。
- 用能解决问题的最小改动。不要加入未要求的抽象、配置项、扩展能力或防御性分支。
- 只改和任务直接相关的文件。不要顺手重构、改格式、改文案或删除无关死代码。
- 保持现有风格：React 组件、状态更新、脚本结构和命名都优先沿用当前写法。
- 对用户或其他 agent 已经产生的未提交改动保持谨慎。不要回滚、覆盖或重排不属于本次任务的改动。

## 常用命令

在仓库根目录运行：

```bash
npm install
npm --prefix client install
npm --prefix server install
npm run dev
npm run build
npm run test:all
```

可按改动范围选择更小验证：

```bash
npm run test:simple
npm run test:immediate
npm run test:duplicate
npm run test:duplicate-retry
npm run test:completion-model
npm run test:completion
npm run test:completion-checkpoint
npm run test:quality
npm run test:resistance
npm run test:prompt
```

Remotion 相关命令：

```bash
npm run video:studio
npm run video:flow:v2:capture
npm run video:flow:v2:still
npm run video:flow:v2:render
```

## 验证标准

- 前端行为改动至少运行相关 `client/scripts/test-*.mjs` 测试；影响公共流程时运行 `npm run test:all`。
- UI 或路由改动需要运行 `npm run build`。如果涉及本地页面展示，启动 Vite 并用浏览器检查关键页面。
- 后端 prompt/API 改动至少运行 `npm run test:prompt`。
- 视频、截图或作品集素材改动需要确认生成脚本能跑通，且引用路径和输出目录一致。

## 提交边界

- 不要提交 `node_modules/`、`dist/`、`.env*`、日志文件、`.tmp*/` 浏览器 profile、`.tmp-screenshots/`、`.tmp-ui-audit/` 或 `video/out/`。
- `server/.env.example` 可以提交；真实密钥文件不能提交。
- `public/` 下被应用、视频或文档直接引用的静态素材可以提交。
- 提交前运行 `git status --short`，确认 staged 内容只包含源码、测试、文档、配置和必要静态素材。

## 成功标准

每个任务完成时应能说明：

1. 改了什么文件。
2. 为什么这些改动是必要的。
3. 跑了哪些验证，以及结果。
4. 哪些内容被明确排除在提交外。
