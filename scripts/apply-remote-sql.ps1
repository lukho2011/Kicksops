# Applies a SQL file to a remote Supabase project via the Management API.
# The access token is read from the SUPABASE_ACCESS_TOKEN environment variable
# so it is never written to disk.
#
# Usage:
#   $env:SUPABASE_ACCESS_TOKEN = "sbp_..."
#   powershell -ExecutionPolicy Bypass -File scripts/apply-remote-sql.ps1 -Ref <project-ref> -SqlPath <path>

param(
  [Parameter(Mandatory = $true)][string]$Ref,
  [Parameter(Mandatory = $true)][string]$SqlPath
)

$ErrorActionPreference = "Stop"

$token = $env:SUPABASE_ACCESS_TOKEN
if (-not $token) {
  Write-Output "FAIL  SUPABASE_ACCESS_TOKEN is not set"
  exit 1
}

$sql = Get-Content -Raw -Path $SqlPath
$body = @{ query = $sql } | ConvertTo-Json -Depth 3
$headers = @{
  "Authorization" = "Bearer $token"
  "Content-Type"  = "application/json"
}

Write-Output "Applying $SqlPath to project $Ref ..."

try {
  $response = Invoke-RestMethod -Method Post `
    -Uri "https://api.supabase.com/v1/projects/$Ref/database/query" `
    -Headers $headers `
    -Body $body
  Write-Output "OK"
  $response | ConvertTo-Json -Depth 5
} catch {
  Write-Output "FAIL"
  Write-Output $_.Exception.Message
  if ($_.ErrorDetails) { Write-Output $_.ErrorDetails.Message }
  exit 1
}
