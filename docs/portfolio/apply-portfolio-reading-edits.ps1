$ErrorActionPreference = "Stop"
$env:LARK_CLI_NO_PROXY = "1"

$doc = "https://icnw9wt62rgi.feishu.cn/wiki/QxqiwwTS2irE6EkR7wmconetnGh?from=from_copylink"

function Update-Doc {
  param([Parameter(Mandatory = $true)][string[]]$Args)
  lark-cli docs +update --api-version v2 --doc $doc @Args
}

function Insert-After {
  param([string]$BlockId, [string]$File)
  Update-Doc -Args @("--command", "block_insert_after", "--block-id", $BlockId, "--content", "@$File", "--doc-format", "markdown")
}

function Replace-WithFile {
  param([string]$BlockId, [string]$File)
  Update-Doc -Args @("--command", "block_replace", "--block-id", $BlockId, "--content", "@$File", "--doc-format", "markdown")
}

function Delete-Blocks {
  param([string]$BlockIds)
  Update-Doc -Args @("--command", "block_delete", "--block-id", $BlockIds)
}

Insert-After -BlockId "doxcncW08Ev6Kn0vLiMtjNmgteZ" -File "docs\portfolio\quick-reading-guide.md"

Delete-Blocks -BlockIds "TRdHdA6eFofhHAx1bqzcUuAlnpe"

Insert-After -BlockId "TMW2dnRsOoDfeRxJIeqcA22Yn8g" -File "docs\portfolio\transition-06.md"
Insert-After -BlockId "ValMdff3GoBNztxas0FcV2stnec" -File "docs\portfolio\transition-07-stepcard.md"
Insert-After -BlockId "M5zJd9emFobvcFx1v3mcZT80ncg" -File "docs\portfolio\transition-07-clarify.md"
Insert-After -BlockId "X9b6dbmCwo3hMaxWMevcYHCVnPg" -File "docs\portfolio\transition-07-recovery.md"
Insert-After -BlockId "D35odP5GPo2y2ExArs3cqDoGnQe" -File "docs\portfolio\transition-08.md"
Insert-After -BlockId "doxcnRhfxWTuo65ZyTWYqT8645e" -File "docs\portfolio\transition-10.md"

Replace-WithFile -BlockId "doxcn4Wj70PBB59aTzKObAWX3d6" -File "docs\portfolio\user-evidence-summary-v3.md"

Delete-Blocks -BlockIds "doxcn8iwMdRwiVRjShp52JiQClc,doxcnazByXNFyq3IzhGrq6S8QNh,doxcnO43YDZ8DayaJ7RRlzObNKf,doxcnZXL8ZdE928w9WwTPlD9gED,doxcn9FkKmbkb6zNUVqiOeYwsxe,doxcnhPUIvJP3Q83VXWOGzvUGuf,G6KBdndiHoBKHpxXARvczraWnkg,doxcnudK8uNX8F6QCIy59Qt7bDg,doxcnjllY799lsC8yGvGWnBl6CN,doxcnpoTdLAvyI2XsaFEkQ34rab,doxcn0NZIfOXbfdmOcmUYlawctO,doxcn93dIhS2YkIRt7CtWTeA2md,doxcne1z6FGONK7glJ2tSvtbRpd,doxcnWedW3witeFmkCtS9FX7vJc,doxcnu9LbvfESYkf1kvcGoFt8re,doxcnaLwVWX9jZzgA8hl40Cw1Xe,doxcn4ShpaU6PP0zFQztjXU5Ybd,doxcnwjyZbCpYkLC4BW4WHwMOth,doxcnMDcd1C9PX6t0fPM8UmtpLd,doxcnPVHZbgsvntFioV6tBRnlWe,doxcnW8DUtckeKrSqqUlp9HOQxc,doxcny7ngEwUQQSGrCaxQDA46Yg,doxcnZUyro6vbNsRFMFXanp4bDb,doxcneyjySQV6ykIiVsabNBnyTg,doxcnSWMMnefYa3IPjDiLIBhvBf,doxcnpMStwDwA0NIjQhgGtN1YXd,doxcnU9QTp9birffyb4XvZesAmc,doxcnNB3zI9DRwJ3BG2oLaHctvd,doxcn26ypzrQaw4qoIQYVr46KEf,doxcnaFfBg1UOcciLwr9sAva0rh,doxcnR8N9huQVTOfqQoIMu0sOcc,doxcnRHKwPXqKCcnG0GurcfUgWg,doxcnFWnE9kFyzHPbqB0ozjpaTd,doxcn01Ehq9uZso7orqCF9qfo1g,doxcny1DViPHrqTYma5lEZthhSe,doxcnPWCpppPgiDh1Q393xybpCe,doxcnwzkCMQQ2AFV75SCugNzj5g,doxcnVAHNE745x3Eu3tnVpkoC1e,doxcnVSayXYwcBASGtbV5junzle,doxcn15mPzmYardsn3G9cjv3Aqh,doxcnroCHVHvIqsW05N2FB1pHof,doxcnHgalrvBLpCH4ttI85Oyzzc,doxcnEK98G1oU8Xz1dAGElWmNKc,doxcnVvUKdasUqSYRkewUpH5God,doxcnAtvxRaRZ4KtIOVGSqBJPU4,doxcn80jOpksYLmM3gqFuBuKruc,doxcnThRhisfqWXM3ZGjJGHae1c,JlRSdHppuovWi8xFX1CckfqJneh"
