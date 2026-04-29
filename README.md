# AI Task Runner MVP

AI Task Runner 是一个面向个人任务启动与推进的 MVP。它不是一次性生成完整计划，而是把用户当前的任务拆成一个低阻力、可立刻执行的步骤，并在用户完成、卡住或信息不足时继续推进。

## 当前阶段

项目已经完成 MVP 主链路，正在进入质量打磨、测试补齐和展示准备阶段。

已完成的核心能力：

- 任务列表：创建、进入、标记重要、删除任务。
- 执行闭环：输入任务 -> 生成第一步 -> 开始执行 -> 完成当前步骤 -> 生成下一步。
- StepCard：统一承载当前行动、执行状态、完成动作、卡点入口和恢复入口。
- 澄清流程：当任务信息不足时，先收集必要上下文，再继续生成步骤。
- 卡点恢复：识别“太难 / 不想做 / 不确定 / 状态不适合”等阻力，并给出更低阻力的 fallback step。
- 本地持久化：通过 localStorage 保存任务列表和执行进度。
- AI 后端：Express + DeepSeek API，支持首步生成、下一步生成和阻力恢复。

## 技术栈

- Frontend: React + Vite
- Backend: Express
- AI Provider: DeepSeek
- Storage: localStorage

## 项目结构

```txt
ai-task-runner-mvp/
  client/
    src/
      App.jsx
      StepCard.jsx
      api.js
      resistancePipeline.mjs
      resistance/templateLibrary.mjs
    scripts/
      test-quality-gates.mjs
      test-resistance-pipeline.mjs
  server/
    src/
      index.js
      routes/stepRoutes.js
      services/deepseekClient.js
      services/promptService.js
  docs/
    project-history.md
    showcase-script.md
    quality-checklist.md
```

## 启动

安装依赖：

```bash
npm install
npm --prefix client install
npm --prefix server install
```

创建 `server/.env`：

```env
DEEPSEEK_API_KEY=your_deepseek_api_key_here
DEEPSEEK_API_URL=https://api.deepseek.com/chat/completions
DEEPSEEK_MODEL=deepseek-chat
PORT=3001
```

启动开发环境：

```bash
npm run dev
```

访问地址：

```txt
Frontend: http://localhost:5173
Backend:  http://localhost:3001
```

## 质量验证

```bash
npm run test:quality
npm run test:simple
npm run test:resistance
npm run build
```

也可以一次性运行：

```bash
npm run test:all
```

当前质量门禁覆盖：

- 情绪/社交压力场景必须生成安全草稿，而不是要求用户直接联系或发送。
- 认知模糊场景必须先缩小判断入口，而不是给抽象建议。
- 身体低能量场景必须暂停并保留恢复入口，而不是推动身体行动。
- 价值怀疑场景必须先做继续/暂停判断，而不是硬推原任务。
- 完美主义场景必须降低质量门槛，而不是继续优化。
- 不安全的 AI fallback step 会被 validator 拒绝。
- 简单任务在完成 2 步或遇到重复步骤时，会进入完成确认，而不是继续硬拆。

## 展示路线

推荐演示路径见 [docs/showcase-script.md](docs/showcase-script.md)。

质量检查清单见 [docs/quality-checklist.md](docs/quality-checklist.md)。
