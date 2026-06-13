$ErrorActionPreference = "Stop"
$env:LARK_CLI_NO_PROXY = "1"

$doc = "https://icnw9wt62rgi.feishu.cn/wiki/QxqiwwTS2irE6EkR7wmconetnGh?from=from_copylink"

function Replace-MarkdownBlock {
  param(
    [Parameter(Mandatory = $true)][string]$BlockId,
    [Parameter(Mandatory = $true)][string]$File
  )

  lark-cli docs +update --api-version v2 --doc $doc --command block_replace --block-id $BlockId --content "@$File" --doc-format markdown
}

Replace-MarkdownBlock -BlockId "doxcn0WQ4hltmOjf4qb1940YOgc" -File "docs\portfolio\repair-project-cycle.md"
Replace-MarkdownBlock -BlockId "doxcn23OJLPVhggFDLCjg82Q9Ld" -File "docs\portfolio\repair-section11-intro.md"
Replace-MarkdownBlock -BlockId "doxcnoVcqqbxMAbhxRbu3oZU4mc" -File "docs\portfolio\repair-fig1-proof.md"
Replace-MarkdownBlock -BlockId "doxcnpVCSqYXIE9v3VEeBYhyG7g" -File "docs\portfolio\repair-fig2-proof.md"
Replace-MarkdownBlock -BlockId "doxcncbWqStpHyeisItGl5A2TTb" -File "docs\portfolio\repair-fig3-proof.md"
Replace-MarkdownBlock -BlockId "doxcn7eOBWIX1JesrDOFm0XPLDb" -File "docs\portfolio\repair-fig4-proof.md"
Replace-MarkdownBlock -BlockId "doxcnzOOkzwnCGS0HNVr4I2TFOg" -File "docs\portfolio\repair-fig5-proof.md"
Replace-MarkdownBlock -BlockId "doxcncqYsdpdoubMVoZyufOq1fd" -File "docs\portfolio\repair-fig6-proof.md"
