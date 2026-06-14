# Architecture

这份文档面向代码评审和实习作品集展示，说明 AI Task Runner MVP 的主要模块和数据流。

## 模块边界

```txt
User
  |
  v
client/src/App.jsx
  |-- localStorage task state
  |-- StepCard.jsx
  |-- resistancePipeline.mjs
  |
  v
client/src/api.js
  |
  v
server/src/routes/stepRoutes.js
  |
  |-- server/src/services/promptService.js
  |-- server/src/services/deepseekClient.js
  |
  v
DeepSeek API
```

## Frontend

`client/src/App.jsx` 是主界面和状态编排入口。它负责管理任务列表、当前任务、当前步骤、步骤历史、澄清回答、执行状态和卡点恢复状态。

`client/src/StepCard.jsx` 是核心交互单元。它把一个步骤呈现成明确的当前行动，并提供开始执行、完成当前步骤和进入卡点恢复的操作入口。

`client/src/api.js` 封装前端到后端的请求，包括：

- `generateFirstStep`
- `generateNextStep`
- `diagnoseResistance`
- `planResistanceRecovery`
- `generateResistanceFallbackStep`
- `resolveResistanceWithAi`

`client/src/resistancePipeline.mjs` 提供本地阻力识别和 fallback 生成逻辑，用于质量门禁和前端恢复流程。

## Backend

`server/src/index.js` 创建 Express 服务，并把 `/api` 请求交给 `server/src/routes/stepRoutes.js`。

`server/src/routes/stepRoutes.js` 是后端核心路由层，负责：

- 校验请求参数。
- 调用 prompt service 生成提示词。
- 调用 DeepSeek。
- 解析和归一化 AI 返回结果。
- 在 AI 输出不符合 Step 边界时做降级处理。

`server/src/services/promptService.js` 集中维护首步生成、下一步生成、阻力诊断、恢复规划和 fallback step 生成的提示词规则。

`server/src/services/deepseekClient.js` 负责读取环境变量、调用 DeepSeek Chat Completions API、处理超时和错误响应。

## Core Flow

1. 用户输入任务。
2. 前端调用 `/api/generate-first-step`。
3. 后端生成结构化 Step。
4. 前端用 StepCard 展示当前步骤。
5. 用户完成当前步骤后，前端把 `stepHistory` 传给 `/api/generate-next-step`。
6. 后端根据原任务和历史步骤生成下一步，直到任务完成或需要澄清。

## Resistance Recovery Flow

1. 用户在当前步骤上选择“我卡住了”并输入原因。
2. 前端构造当前任务、当前步骤、步骤历史和用户表达。
3. 系统诊断阻力来源，例如 `unclear_output`、`perfectionism`、`physical_low_energy`、`value_uncertainty`。
4. 系统生成降低阻力的恢复策略。
5. 系统输出一个新的 fallback step，要求保持原任务目标，但降低当前执行压力。

## Quality Boundaries

项目的质量边界集中在“不要退化成普通计划生成器”：

- 当前步骤必须具体、可观察、低阻力。
- 澄清步骤只能问一个关键问题。
- 下一步不能重复已经完成的步骤。
- 社交压力场景不能直接要求发送或联系。
- 身体低能量场景不能强推站起、出门或运动。
- 价值怀疑场景要先做继续/暂停判断。

这些边界由 `client/scripts/test-*.mjs` 和 `server/scripts/test-prompt-service.mjs` 覆盖。
