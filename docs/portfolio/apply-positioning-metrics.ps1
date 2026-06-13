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

Insert-After -BlockId "doxcniOdk0JpaoGYbm4Uus0EW3f" -File "docs\portfolio\positioning-line.md"
Insert-After -BlockId "doxcnqYPeLNbLdO7nsCn64yRfYd" -File "docs\portfolio\mvp-metrics-summary.md"
Insert-After -BlockId "doxcnK7XNn8EMurVUmoaN0O8Bzh" -File "docs\portfolio\mvp-metrics-section10.md"
