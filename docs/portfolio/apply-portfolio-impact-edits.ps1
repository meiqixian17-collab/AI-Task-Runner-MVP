$ErrorActionPreference = "Stop"
$env:LARK_CLI_NO_PROXY = "1"

$doc = "https://icnw9wt62rgi.feishu.cn/wiki/QxqiwwTS2irE6EkR7wmconetnGh?from=from_copylink"

function Update-Doc {
  param(
    [Parameter(Mandatory = $true)][string[]]$Args
  )

  lark-cli docs +update --api-version v2 --doc $doc @Args
}

Update-Doc -Args @(
  "--command", "block_insert_after",
  "--block-id", "OF35dElp7oXAa0xs61McvgJhnKq",
  "--content", "@docs\portfolio\portfolio-summary-block.md",
  "--doc-format", "markdown"
)

Update-Doc -Args @(
  "--command", "block_replace",
  "--block-id", "X5KjdudMsoaxtuxyYB3ccpjpnWc",
  "--content", "<p>项目周期：2026.05，个人项目，MVP 阶段</p>"
)

Update-Doc -Args @(
  "--command", "block_replace",
  "--block-id", "PORZdHLfXoxU9nxaDeQcozegnEg",
  "--content", "@docs\portfolio\portfolio-overview-v2.md",
  "--doc-format", "markdown"
)

Update-Doc -Args @(
  "--command", "block_delete",
  "--block-id", "Nsw1dypLmocX2Hx1SoEcRsktniH,SDuYdLZ9QoDOvUxYkkacYiLnnDh"
)

Update-Doc -Args @(
  "--command", "block_replace",
  "--block-id", "BYvhdHPNjoPZAdxV2g4cWCA7nVf",
  "--content", "<p>我的设计挑战不是“如何让 AI 给出更多建议”，而是：</p>"
)

Update-Doc -Args @(
  "--command", "block_replace",
  "--block-id", "JAd5dz1yHo7hqBxdyypclxJCndd",
  "--content", "@docs\portfolio\portfolio-validation-v2.md",
  "--doc-format", "markdown"
)

Update-Doc -Args @(
  "--command", "block_delete",
  "--block-id", "NCyGd8BQmo2KNWxsbNrcJbEjnKc,GUoadxiLpoFarjxJArecFoz5nD3,QhbRdi1P8ogo5JxxYz4cZN96n2c,G81AdWyO8oxZ0RxSA6FcVVnNn0g,Dg1WdurIOoQOYZx549ncfSmnn1c,NvsadaU3CoJ8S2xtr4ycN0Xbnfe,JmIgdblMXouKRSxzMozcf3glnVd,U2qidoIwZoKEEdxoMODcejKhnsd,VY4rdtgBJonTiNx0Vp7c9G8ZnDc,PUrldiqstoB9FqxeYZwcA106nhf,OuWGdDWSIoLSuGxHSK5chdCfnVg,TA62dYfwsoLgmpxr4PQcFAxwneg,QPbFdFzH8ozlIcx4epOcwgp3nqh,IWO3dxZaooDDaRxAG65cVGOgnbd,NEC1d9cPeoSfL8xeg4scW0AjnmB,Pw0fdumATo8GbbxS6gicKOA3nqh"
)

Update-Doc -Args @(
  "--command", "block_replace",
  "--block-id", "doxcntZwsKeta0GRSub0gt71ylb",
  "--content", "<p>这一节只保留最能证明设计决策的展示材料：关键界面、核心流程、完整任务案例、个人贡献与用户证据。每张图都对应一个设计判断，而不是单纯展示页面长什么样。</p>"
)

Update-Doc -Args @(
  "--command", "block_replace",
  "--block-id", "doxcn7EQjx9074wvfozy50i0dfh",
  "--content", "<p>这张图证明我的入口设计选择：先让用户描述一个真实卡住的任务，而不是要求用户先拆完整计划。它把第一步判断交给系统，降低用户从空白状态进入行动的成本。</p>"
)

Update-Doc -Args @(
  "--command", "block_replace",
  "--block-id", "doxcnFeimC1sIZnFXafVI5SGNCb",
  "--content", "<p>StepCard 的核心作用是减少判断成本：用户不需要面对完整计划，而是始终围绕一个可执行的当前动作。它把 AI 输出从聊天建议变成任务状态，明确当前步骤、执行状态和下一步操作。</p>"
)

Update-Doc -Args @(
  "--command", "block_replace",
  "--block-id", "doxcn0PeQutQ0JimuPmaRls5qMg",
  "--content", "<p>执行态证明我把“建议”设计成了可推进的流程节点。用户点击开始后，界面只保留完成与卡点恢复两个关键出口，避免在执行中重新被选择压力打断。</p>"
)

Update-Doc -Args @(
  "--command", "block_replace",
  "--block-id", "doxcnL7wLpSG0bvYuakh21lWH8g",
  "--content", "<p>这张图证明卡点恢复不是附加功能，而是核心闭环的一部分。我的决策是先识别阻力类型，再把原步骤降到更低门槛，而不是继续催促用户完成。</p>"
)

Update-Doc -Args @(
  "--command", "block_delete",
  "--block-id", "doxcn50RN8CBxXrj1ebz1eOrPhc"
)

Update-Doc -Args @(
  "--command", "block_replace",
  "--block-id", "doxcnb30Q5lwdVpXQnSKSWPIcAl",
  "--content", "<p>这张图证明澄清问题的边界：AI 只在缺少当前步骤必要上下文时提问。我的决策不是做完整表单，而是用最小问题避免系统在信息不足时乱猜。</p>"
)

Update-Doc -Args @(
  "--command", "block_delete",
  "--block-id", "doxcnMJuUObChwGhzSf8bcoYQPb"
)

Update-Doc -Args @(
  "--command", "block_replace",
  "--block-id", "doxcnW3UA2l3ceI6MAjKWp8CTEf",
  "--content", "<p>这张流程图证明产品不是一次性 AI 回答，而是一个有状态的任务推进闭环：主线负责当前一步、执行、记录和下一步，旁路只处理信息不足和执行卡住。它把我的设计重点从“生成更多内容”转向“持续降低行动阻力”。</p>"
)

Update-Doc -Args @(
  "--command", "block_delete",
  "--block-id", "doxcnabwtICKzXGFmsVntARDANd,doxcnCdbrierk4HtJWZyqLojBFg,doxcncF3HAp2s9FKKphGpKwK0ie,doxcnBTA4eGNXqx7XsJg4nXboxe,doxcnNm2gZ7P0lxIzQZ1stDj4If"
)

Update-Doc -Args @(
  "--command", "block_replace",
  "--block-id", "doxcn4KMXFOACz58ULsuyAfbpmg",
  "--content", "@docs\portfolio\portfolio-demo-case-v2.md",
  "--doc-format", "markdown"
)

Update-Doc -Args @(
  "--command", "block_delete",
  "--block-id", "doxcnyWuGOyO1XJY2VyqQXQPsTh,doxcnsuS2gCooDQBqaO5GdKygBe,doxcnE70tFr0QqcE2dpo0BU4Kqd,doxcnNCxwz7DWN39722y8oXwcbh,doxcneiWceL4eH45GUDJy3DMJZc,doxcnM5yLMq0OJJFrti1ydgTd8d,doxcnGohUWeMjSYeQobB59FUwDe,doxcnn1TBJ6x6gPC8duy0DfPMbb,doxcnXWPyCNuKqqZsLBZfAHKFme,doxcnOnANWbISKwXH2kvRUKr9dh,doxcnsHzjVFj1jNu5gCgIJlcpml,doxcnKjoBu6O13XklYfCWKzgOif,doxcnMwBbRnuX6upL5aTCQsbuJH,doxcnA1Cl2XR75eUvJef0QNqHfh,doxcnlZC1sDrDbOk5lD0asEFfN2,doxcnCcIpUH4VlBxZblKdbXHSFc,doxcnzM9IBsNwagepjbgYspkXNc,doxcnzzxIYkSCmPmUsSn3oiX8ve,doxcnoPjfUV1Yb9875WODAEOu3f"
)

Update-Doc -Args @(
  "--command", "block_replace",
  "--block-id", "doxcnQVnGCesbO9lhbvBMLnkC5g",
  "--content", "@docs\portfolio\portfolio-contribution-v2.md",
  "--doc-format", "markdown"
)

Update-Doc -Args @(
  "--command", "block_delete",
  "--block-id", "doxcnliICaS6G6aWTffY8yoasee,doxcn4SqduZPRtNEZsJWGSLkYNb,doxcnraHdUOPEfWcnZG8fxfflkh,doxcnwWQjWzyxKfaAeqbXCj7RNb,doxcno9UjfJmE6CqOtFXp18ujJe,doxcnO1ANeaYIESpQKL0zkf4WKc,doxcnp7kGA2VQHTqE70fR1NGEmb,doxcnjfKbDISZN7vhzgbGu6tBHd,doxcn7l5GFn1kIHwfODxzwJ1s7b,doxcnGPYkXjbJzsrvooAIngEy6e,doxcnh9teCsDuv6Gx8grOXKg7Te,doxcnjDA1xB1S7irkuJDiu1gDbe,doxcnlMNuys4FuN0belBDJn6fUQ,doxcnQqsZFV4gN3BN6qI9w40wkg,doxcnWU7Ed3Knk54U9NZVyWDwBb,doxcnfkdjYHshjLzPhdKteetqHh,doxcnDInbESgC6Zb4NtqC13DKAh"
)
