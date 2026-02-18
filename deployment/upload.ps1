# Upload to Hetzner Server
# Run this from your local machine (PowerShell)

param(
    [Parameter(Mandatory=$true)]
    [string]$ServerIP,
    
    [Parameter(Mandatory=$false)]
    [string]$ServerUser = "root"
)

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Angela Troy Real Estate - Upload to Server" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

$LocalPath = $PSScriptRoot
$RemotePath = "/var/www/anjelaweb"

Write-Host "[1/4] Testing SSH connection..." -ForegroundColor Yellow
ssh ${ServerUser}@${ServerIP} "echo 'Connection successful'"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to connect to server!" -ForegroundColor Red
    exit 1
}

Write-Host "[2/4] Creating remote directory..." -ForegroundColor Yellow
ssh ${ServerUser}@${ServerIP} "mkdir -p $RemotePath"

Write-Host "[3/4] Uploading files (this may take a few minutes)..." -ForegroundColor Yellow
scp -r `
    "$LocalPath\*" `
    "${ServerUser}@${ServerIP}:${RemotePath}/"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Upload failed!" -ForegroundColor Red
    exit 1
}

Write-Host "[4/4] Setting permissions..." -ForegroundColor Yellow
ssh ${ServerUser}@${ServerIP} @"
    cd $RemotePath
    chmod +x deployment/*.sh
    chmod 600 .env 2>/dev/null || true
"@

Write-Host ""
Write-Host "=========================================" -ForegroundColor Green
Write-Host "Upload completed successfully!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. SSH to server: ssh ${ServerUser}@${ServerIP}" -ForegroundColor White
Write-Host "2. Edit .env file: nano /var/www/anjelaweb/.env" -ForegroundColor White
Write-Host "3. Run deployment: cd /var/www/anjelaweb && sudo deployment/deploy.sh" -ForegroundColor White
Write-Host ""
