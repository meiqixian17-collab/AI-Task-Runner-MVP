param(
  [Parameter(Mandatory = $true)]
  [string]$Doc
)

$ErrorActionPreference = "Stop"
$env:LARK_CLI_NO_PROXY = "1"

Write-Host "Appending supplement markdown..."
lark-cli docs +update `
  --api-version v2 `
  --doc $Doc `
  --command append `
  --content '@docs\portfolio\ai-task-runner-supplement-materials.md' `
  --doc-format markdown

$images = @(
  @{
    File = "docs\portfolio\assets\01-task-entry.png"
    Anchor = "12.1 首屏核心界面截图"
    Caption = "图 1 任务入口页：用户先输入一个想推进的任务，而不是先拆完整计划。"
  },
  @{
    File = "docs\portfolio\assets\02-current-step.png"
    Anchor = "12.2 当前一步：StepCard 核心界面"
    Caption = "图 2 StepCard 当前一步：AI 建议被转化为一个可执行的任务状态。"
  },
  @{
    File = "docs\portfolio\assets\03-stepcard-executing.png"
    Anchor = "12.3 执行状态：从建议进入行动"
    Caption = "图 3 执行状态：界面聚焦当前步骤，并保留完成与卡点恢复入口。"
  },
  @{
    File = "docs\portfolio\assets\04-resistance-recovery.png"
    Anchor = "12.4 卡点恢复：用户做不下去时降低阻力"
    Caption = "图 4 卡点恢复：用户做不下去时，系统先识别阻力并降低门槛。"
  },
  @{
    File = "docs\portfolio\assets\05-clarification.png"
    Anchor = "12.5 信息澄清：上下文不足时先问必要问题"
    Caption = "图 5 信息澄清：上下文不足时，系统先问必要问题，而不是替用户猜。"
  },
  @{
    File = "docs\portfolio\assets\06-task-flow.png"
    Anchor = "12.6 任务推进流程图"
    Caption = "图 6 核心任务推进流程：主流程围绕当前一步推进，旁路处理信息不足和执行卡住。"
  }
)

foreach ($image in $images) {
  Write-Host "Inserting $($image.File)..."
  lark-cli docs +media-insert `
    --doc $Doc `
    --file $image.File `
    --type image `
    --selection-with-ellipsis $image.Anchor `
    --caption $image.Caption `
    --width 900 `
    --align center
}

Write-Host "Done."
