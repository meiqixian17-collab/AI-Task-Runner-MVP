# 项目迭代回顾

## 0. 文档说明

这份文档用于补充 Git 初始化前的项目演进记录，帮助后续整理作品集、恢复项目上下文，并为之后的功能迭代提供判断依据。

它不是 Git commit 历史，也不等同于真实开发时间线。文档内容基于当前代码结构、功能痕迹、README、文件命名以及项目讨论记录整理；无法从代码确认的部分会标注为“基于项目讨论记录”“推测”或“待确认”。

## 1. 项目当前定位

当前项目是一个面向个人任务启动与推进场景的 AI Task Runner MVP，主要服务于容易卡在“开始做什么”“下一步怎么推进”的用户。产品核心价值不是一次性生成完整计划，而是把用户输入的任务转化为当前最适合执行的一个具体步骤，并在用户完成后继续推进下一步。基于项目讨论记录，产品方向已经从“第一步生成器”逐渐转向“任务执行系统”：系统不只负责生成开头，而是围绕 StepCard、执行状态、步骤历史、补充信息和卡点恢复，帮助用户从任务启动走向任务完成。

## 2. 阶段一：任务输入与第一步生成

### 阶段目标

建立最小可用闭环：用户输入一个任务，系统调用 AI 生成当前应该执行的第一步，并在前端展示为可开始执行的动作。

### 已完成内容

- 前端使用 React + Vite，入口位于 `client/src/main.jsx`，核心页面逻辑集中在 `client/src/App.jsx`。
- 用户可以创建任务，并在任务执行页输入任务标题。
- `handleSubmitTask` 会校验任务输入，进入 loading 状态，并调用 `generateFirstStep`。
- 前端 API 封装位于 `client/src/api.js`，通过 `POST /api/generate-first-step` 提交任务。
- 后端路由位于 `server/src/routes/stepRoutes.js`，`/generate-first-step` 会校验 `task` 字段并调用 prompt + DeepSeek。
- prompt 逻辑位于 `server/src/services/promptService.js`，首步生成要求返回一个短、具体、可执行的单步动作。
- AI 返回内容经过 `normalizeAiStep` 处理后返回前端；如果 AI 认为任务已完成，可通过 `[TASK_DONE]` 标记进入 completed。
- 前端会把生成结果标准化为当前步骤，并在 StepCard 中展示。

### 关键价值

这一阶段验证了产品的最小价值：用户不用先拆完整计划，只需要交给系统一个任务，就能获得一个低阻力、能立刻开始的动作。

### 遗留问题

- README 中已有“输入任务 -> AI 生成当前步骤 -> 开始执行 -> 完成当前步骤 -> AI 生成下一步”的流程描述，但当前 README 显示存在编码异常，后续需要统一文件编码。
- 当前首步生成主要依赖 AI 文本返回，结构化程度有限；前端会再做标准化，但 AI 输出稳定性仍需要继续验证。
- 首步质量评估标准还没有文档化，例如“可执行”“低阻力”“不重复准备工作”的判断规则需要沉淀。

## 3. 阶段二：前后端联通与 AI 调用

### 阶段目标

把前端任务输入与后端 AI 能力接通，形成本地可运行、可调试的前后端架构。

### 已完成内容

- 根目录 `package.json` 提供 `npm run dev`，通过 `concurrently` 同时启动前端和后端。
- 前端项目在 `client/`，默认 Vite 端口为 `5173`。
- 后端项目在 `server/`，`server/src/index.js` 默认监听 `3001`，并提供 `GET /api/health` 健康检查。
- 后端使用 Express、CORS、dotenv，并将 `/api` 路由挂载到 `stepRoutes`。
- DeepSeek 调用封装在 `server/src/services/deepseekClient.js`。
- API Key 通过 `server/.env` 注入，`server/.env.example` 中声明了 `DEEPSEEK_API_KEY`、`DEEPSEEK_API_URL`、`DEEPSEEK_MODEL` 和 `PORT`。
- DeepSeek 默认模型为 `deepseek-chat`，默认接口为 `https://api.deepseek.com/chat/completions`。
- 前端请求封装设置了 12 秒超时；后端 DeepSeek 调用设置了默认 10 秒超时，并支持 `DEEPSEEK_TIMEOUT_MS` 环境变量覆盖。
- 请求失败、超时或 AI 返回异常时，前端会进入 fallback step，而不是让用户停在错误状态。

### 关键价值

这一阶段把产品从静态界面推进到真实 AI 调用闭环，并且初步处理了本地开发、环境变量、接口错误和超时问题。

### 遗留问题

- `client/src/api.js` 使用相对路径 `/api/...`；`client/vite.config.js` 已配置 Vite dev server 代理，将 `/api` 转发到 `http://localhost:3001`。
- 错误信息已能反馈到前端，但不同失败类型的用户提示还可以更细，例如 API Key 缺失、网络超时、模型返回空内容。
- `.env` 文件存在于本地项目中，后续 Git baseline 前需要确认是否已被忽略，避免提交真实密钥。

## 4. 阶段三：StepCard 与执行状态区

### 阶段目标

把 AI 生成的步骤从“展示结果”升级为“执行中的任务单元”，让用户可以开始、完成、卡住、暂停或退出当前步骤。

### 已完成内容

- `client/src/StepCard.jsx` 是当前步骤展示和执行交互的核心组件。
- 应用状态在 `client/src/App.jsx` 中通过 `APP_STATUS` 管理，包括 `idle`、`loading`、`ready`、`executing`、`paused`、`exited`、`completed`。
- `ready` 状态展示当前步骤，并提供“开始执行”动作。
- `executing` 状态展示“完成当前步骤”动作，并提供“我卡住了”的阻力入口。
- `paused` 状态支持基于 `reEntryPoint` 的恢复入口。
- `completed` 和 `exited` 状态有对应结果展示。
- `StepCard` 会根据生成来源展示 AI 或 fallback 标记。
- 当前任务旁边还有推进记录区域，展示已完成步骤数量和 `stepHistory` 时间线。

### 关键价值

StepCard 让产品体验从“AI 给一句建议”变成“围绕当前步骤推进任务”。它承接了当前行动、状态反馈、完成动作、卡点处理和恢复入口，是 MVP 之后继续打磨核心闭环的中心。

### 遗留问题

- 代码中存在 `errorMessage` 展示，但 `APP_STATUS` 没有单独的 `error` 状态；是否需要独立错误状态待确认。
- 退出流程目前更多表现为返回任务列表或状态上下文结束，是否需要严格区分“退出本次执行”和“暂停后可恢复”待确认。
- StepCard 文案和部分文件内容存在编码显示异常，需要后续统一修复，否则会影响作品集展示。

## 5. 阶段四：从单步生成到路径推进

### 阶段目标

解决“用户完成第一步后断掉”的问题，把产品从单步生成推进到 1-N 的连续任务路径。

### 已完成内容

- 当前任务模型中包含 `stepHistory`、`stepIndex`、`currentStep`、`sessionSummary` 等字段。
- 用户点击“完成当前步骤”后，`handleCompleteCurrentStep` 会把当前步骤加入 `stepHistory`，并进入 loading。
- 前端通过 `generateNextStep(task, stepHistory)` 请求后端生成下一步。
- 后端提供 `POST /api/generate-next-step`，要求传入原始任务和已完成步骤数组。
- `generateNextStepPrompt` 明确要求不要重复已完成步骤，只返回一个下一步动作。
- `shouldCompleteTask` 会根据当前步骤、阶段和部分任务类型规则判断是否自然完成，而不是无限生成下一步。
- 代码中存在 `normalizeCurrentStep`、`inferActionType`、`inferStepStage`、`inferRiskFlags` 等规则化处理，说明产品已经开始把 AI 输出转化为可控执行结构。
- 卡点恢复链路中存在 `resistancePipeline.mjs` 和 `templateLibrary.mjs`，用于把阻力诊断、恢复策略、fallback step 结合起来。

### 关键价值

这一阶段是产品定位变化的关键：原本只需要回答“第一步是什么”，现在要回答“完成之后如何继续，并且什么时候该结束”。系统开始从 AI 生成器转向任务推进器。

### 遗留问题

- 路径推进仍然部分依赖 AI 生成下一步，规则化路径与 AI 介入边界还需要继续明确。
- `stepHistory` 当前主要记录文本，后续是否需要记录结构化 step、完成时间、用户反馈、阻力类型等待确认。
- 任务完成判断已存在规则，但覆盖范围有限，复杂任务的完成边界仍需要验证。

## 6. 阶段五：ClarificationCard 设计

### 阶段目标

在执行前补足必要上下文，让系统能在“任务信息不足但仍可推进”的场景中先问关键问题，而不是直接生成低质量步骤。

### 已完成内容

- 当前代码中没有独立文件名为 `ClarificationCard` 的组件；澄清交互作为 StepCard 内部逻辑实现。
- `StepCard` 会识别 `currentStep.step_type === "clarification"`，并展示“信息补充”样式。
- 澄清交互出现在当前步骤展示区域内，并在普通“开始执行”按钮之前完成。
- 交互形式为输入框 + 右侧确认按钮。
- 澄清流程没有引入独立全局 `clarifying` 状态，而是依附于 `ready` 状态。
- `App.jsx` 中的 `maybeGenerateClarificationStep` 会根据任务类型和缺失字段生成 `step_type: "clarification"` 的步骤。
- 当前规则支持 logo 设计、消息撰写、简历、作品集等任务类型的上下文补充。
- 示例上，Logo 相关任务会被识别为需要补充品牌或店铺信息，符合“给自己的店铺设计一个 Logo 时先询问店铺名”的产品讨论方向。
- 用户提交补充信息后，答案会写入 `taskContext`，系统继续判断是否还缺信息；信息完整后再生成首步或下一步。

### 关键价值

ClarificationCard 的价值不是服务于“我卡住了”，而是在任务执行前收集当前步骤必要的信息，避免 AI 在缺少上下文时直接猜测。它让 StepCard 不只是动作展示区，也能成为任务推进过程中的上下文收集区。

### 遗留问题

- 当前 `ClarificationCard` 还不是独立组件文件，是否需要在后续拆分为可复用组件待确认。
- 澄清规则目前写在前端常量中，后续是否改为 AI 输出结构、规则引擎或后端统一判断待确认。
- 当前澄清字段覆盖有限，仍需要围绕核心作品集场景补充更多任务类型和测试用例。

## 7. 阶段六：UI / UX 打磨

### 阶段目标

在保持核心结构不变的前提下，让界面层级更清晰，突出当前 P0 行动，并让用户始终知道现在该做什么。

### 已完成内容

- 当前 UI 已经包含任务列表页、任务执行页、StepCard、任务输入区、推进记录区、阻力面板和确认弹层。
- idle 状态下，任务输入区是核心入口。
- 离开 idle 后，StepCard 和当前步骤成为主焦点。
- `client/src/App.css` 已经承担全局视觉样式、卡片层级、状态样式、任务列表和执行区布局。
- StepCard 使用状态文案、状态 pill、step index、AI/fallback 来源标记等元素帮助用户理解当前阶段。
- 任务列表支持长按打开操作菜单、标记重要、删除任务，并通过 localStorage 自动保存。

### 关键价值

UI 打磨不是单纯美化，而是服务于任务推进体验：让用户在每个状态都能明确看到当前动作、下一次点击、已完成进度和是否需要补充信息。

### 遗留问题

- 当前 UI 可用，但还需要高保真优化，包括字体、颜色、间距、卡片层级、移动端触控反馈和状态一致性。
- P0 层级需要进一步强化：idle 时突出输入，ready/executing 时突出 StepCard，历史记录和辅助信息应降低干扰。
- 视觉语言还需要围绕作品集场景统一，避免界面看起来像临时 demo。
- 文件中部分中文显示存在编码异常，必须在作品集展示前修复。

## 8. 已确定的关键产品决策

- 产品不再只是“生成第一步”，而是向“任务执行系统”演进。
- 当前不优先新增大量功能，而是打磨任务输入、当前步骤、执行、完成、下一步推进的核心闭环。
- StepCard 是当前体验核心。
- ClarificationCard 是 StepCard 内部通用能力；当前实现尚未拆成独立组件文件。
- `clarifying` 不作为独立全局状态，而依附于 `ready` 状态。
- 完成当前步骤后，应推进到下一步，而不是让用户断掉。
- AI 不是每一步都主导，路径推进应尽量规则化，必要时再由 AI 介入。
- UI/UX 改造不能改变现有核心结构。
- AI 生成失败时不应中断用户流程，应尽可能提供 fallback step。
- 卡点处理应围绕当前任务内部阻力，不扩展为长期心理分析。

## 9. 当前项目阶段判断

当前项目可以判断为：MVP 已完成，正在进入 MVP 2.0 / 核心闭环打磨阶段。重点已经从“能生成”变成“能持续推进任务”。

当前最高优先级问题是核心闭环质量：用户输入任务后，系统是否能稳定给出可执行步骤；用户完成后，是否能自然进入下一步；用户卡住或信息不足时，是否能通过澄清、fallback 或恢复入口继续推进。

它是 P0，因为这个项目的作品集价值不在于“接入了 AI”，而在于“AI 如何被设计成一个任务执行系统”。如果 StepCard、完成后推进、ClarificationCard、卡点恢复和 UI 层级不能形成稳定体验，产品就会退回普通生成器。

接下来最应该记录和验证：

- 首步生成质量：是否足够短、具体、低阻力。
- 下一步推进质量：是否避免重复、是否能自然结束。
- Clarification 触发质量：什么时候应该先问问题，什么时候应该直接生成步骤。
- 卡点恢复质量：用户说“太难”“不想做”“不确定”“状态不适合”时，系统是否给出更低阻力的当前步骤。
- UI 层级：不同状态下 P0 是否明确。
- 编码与文案：中文内容是否能稳定显示，是否适合放进作品集。

## 10. 后续 Git 记录建议

当前项目应先建立 baseline commit，用于记录现有 MVP 状态。之后每个功能、UI 调整、prompt 调整、文档调整都应单独提交，避免把产品决策、视觉修改和接口改动混在一起。

建议使用以下 commit message 类型：

- `feat:` 新增功能或用户可感知能力
- `fix:` 修复 bug、异常状态或错误处理
- `style:` UI 样式、视觉层级、间距、颜色等调整
- `refactor:` 不改变行为的结构优化
- `docs:` 文档更新
- `prompt:` prompt、AI 输出规则或模型调用策略调整
- `chore:` 构建、依赖、配置、脚本等维护工作

示例 commit message：

- `docs: add project iteration history`
- `chore: create baseline for ai task runner mvp`
- `feat: persist task list and execution progress`
- `feat: generate next step from completed step history`
- `feat: add clarification flow inside step card`
- `feat: add resistance recovery fallback pipeline`
- `fix: handle ai timeout with local fallback step`
- `fix: prevent repeated next step after completion`
- `style: improve step card hierarchy across task states`
- `style: emphasize task input in idle state`
- `prompt: tighten first-step generation constraints`
- `prompt: add recovery planning rules for resistance handling`
