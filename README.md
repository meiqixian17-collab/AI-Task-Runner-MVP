# AI Task Runner MVP

一个最小可运行的“AI 任务启动与推进系统”。

核心流程：

```txt
输入任务 -> AI 生成当前步骤 -> 开始执行 -> 完成当前步骤 -> AI 生成下一步 -> 循环推进
```

## 文件结构

```txt
ai-task-runner-mvp/
  package.json
  README.md
  client/
    package.json
    index.html
    vite.config.js
    src/
      main.jsx
      App.jsx
      App.css
      api.js
  server/
    package.json
    .env
    .env.example
    src/
      index.js
      routes/
        stepRoutes.js
      services/
        deepseekClient.js
        promptService.js
```

## 启动

先安装依赖：

```bash
npm install
npm --prefix client install
npm --prefix server install
```

然后填写 `server/.env`：

```env
DEEPSEEK_API_KEY=你的 DeepSeek API Key
```

最后在项目根目录启动：

```bash
npm run dev
```

前端地址：

```txt
http://localhost:5173
```

后端地址：

```txt
http://localhost:3001
```
