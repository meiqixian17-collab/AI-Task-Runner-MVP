$ErrorActionPreference = "Stop"
$env:LARK_CLI_NO_PROXY = "1"

$doc = "https://icnw9wt62rgi.feishu.cn/wiki/QxqiwwTS2irE6EkR7wmconetnGh?from=from_copylink"

function Update-Doc {
  param([Parameter(Mandatory = $true)][string[]]$Args)
  lark-cli docs +update --api-version v2 --doc $doc @Args
}

function Replace-WithFile {
  param([string]$BlockId, [string]$File)
  Update-Doc -Args @("--command", "block_replace", "--block-id", $BlockId, "--content", "@$File", "--doc-format", "markdown")
}

function Delete-Blocks {
  param([string]$BlockIds)
  Update-Doc -Args @("--command", "block_delete", "--block-id", $BlockIds)
}

Replace-WithFile -BlockId "doxcncW08Ev6Kn0vLiMtjNmgteZ" -File "docs\portfolio\product-role-summary-line.md"
Replace-WithFile -BlockId "PVEtdR2Tko6AJSxOr1CcQsvgnKh" -File "docs\portfolio\product-portfolio-tagline.md"
Replace-WithFile -BlockId "MjXedhDWyoRqgIxs2L6c8yMRnTc" -File "docs\portfolio\product-role-line.md"
Replace-WithFile -BlockId "UI4Wd0V1Cob9qdx6ZCicXjQlnje" -File "docs\portfolio\prototype-form-line.md"
Replace-WithFile -BlockId "doxcnhlxdpIAIwK3UHN2a5CEkHe" -File "docs\portfolio\overview-role-product.md"

Replace-WithFile -BlockId "Kgs3dBuoNoOIbSxSpQbcBAs5nve" -File "docs\portfolio\prototype-validation-section.md"
Delete-Blocks -BlockIds "X09ydyaYOobOHAxZyyYchtCSn7c,InOIdQXWZoHp7jxN70ncoQVinBc,DXgudV8kFof2iNxa6H4cssZpnTf,KyqkdTCHbo3KPSxvsOecCEnpn0b,AI1YdSh7XogjcsxWvjZcWR3Pnah,R7O0dOwP8ovurGxMbxEcNUpUncf,HPHPdd4sforea6x0VHocTqGlnve"

Replace-WithFile -BlockId "doxcnCmKfB2CTkflesRa5KFcr2f" -File "docs\portfolio\validation-boundary-item.md"
Replace-WithFile -BlockId "doxcneY8r8BLNsnL22x1AX9Sp5c" -File "docs\portfolio\contribution-product-line.md"
Replace-WithFile -BlockId "doxcnOHD3GNFpn8dqQYRzjuQ7Eg" -File "docs\portfolio\project-boundary-product-line.md"
