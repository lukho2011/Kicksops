# Diagnose Supabase connectivity using the values from .env.local
$ErrorActionPreference = "Continue"

$envFile = Join-Path $PSScriptRoot "..\.env.local"
$vars = @{}
Get-Content $envFile | ForEach-Object {
  $line = $_.Trim()
  if ($line -and -not $line.StartsWith("#")) {
    $parts = $line -split "=", 2
    if ($parts.Count -eq 2) { $vars[$parts[0].Trim()] = $parts[1].Trim() }
  }
}

$url = $vars["NEXT_PUBLIC_SUPABASE_URL"]
$key = $vars["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"]

if (-not $url -or -not $key) {
  Write-Output "MISSING ENV VALUES: url present=$([bool]$url) key present=$([bool]$key)"
  exit 1
}

Write-Output "Project URL: $url"
Write-Output "Key kind: $($key.Substring(0, [Math]::Min(6, $key.Length)))... (length $($key.Length))"

$headers = @("-H", "apikey: $key", "-H", "Authorization: Bearer $key")

function Test-Endpoint($name, $path) {
  $full = "$url$path"
  $raw = & curl.exe -s -m 20 -w "`nHTTP_STATUS:%{http_code}" @headers $full 2>&1
  $text = ($raw | Out-String).Trim()
  $status = if ($text -match "HTTP_STATUS:(\d+)") { $Matches[1] } else { "???" }
  $body = ($text -replace "HTTP_STATUS:\d+\s*$", "").Trim()
  if ($body.Length -gt 400) { $body = $body.Substring(0, 400) + " ...[truncated]" }
  Write-Output ""
  Write-Output "== $name -> HTTP $status"
  if ($body) { Write-Output $body }
}

Test-Endpoint "REST root (project reachable + key accepted)" "/rest/v1/"
Test-Endpoint "Auth health" "/auth/v1/health"
Test-Endpoint "Table: orgs" "/rest/v1/orgs?select=*&limit=2"
Test-Endpoint "Table: customers" "/rest/v1/customers?select=*&limit=2"
Test-Endpoint "Table: jobs" "/rest/v1/jobs?select=*&limit=2"
Test-Endpoint "Table: order_items" "/rest/v1/order_items?select=*&limit=2"
Test-Endpoint "Table: profiles" "/rest/v1/profiles?select=*&limit=2"
