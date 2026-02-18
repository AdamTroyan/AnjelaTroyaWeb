# Fix Script for Hetzner Deployment
# Run this on the server after uploading updated code

Write-Host "🚀 Fixing Hetzner Deployment..." -ForegroundColor Cyan

# 1. Upload the updated .env.production
Write-Host "`n📤 Uploading updated environment variables..." -ForegroundColor Yellow
scp .env.production root@46.225.183.47:/var/www/AnjelaTroyaWeb/.env

# 2. Upload the updated source files
Write-Host "`n📤 Uploading fixed auth code..." -ForegroundColor Yellow
scp src/lib/auth.ts root@46.225.183.47:/var/www/AnjelaTroyaWeb/src/lib/auth.ts
scp src/proxy.ts root@46.225.183.47:/var/www/AnjelaTroyaWeb/src/proxy.ts

# 3. Rebuild and restart on server
Write-Host "`n🔨 Rebuilding application on server..." -ForegroundColor Yellow
ssh root@46.225.183.47 @"
cd /var/www/AnjelaTroyaWeb
echo '📦 Installing dependencies...'
npm install
echo '🏗️  Building application...'
npm run build
echo '🔄 Restarting PM2...'
pm2 restart ecosystem.config.js
pm2 save
echo '✅ Done!'
pm2 logs --lines 20
"@

Write-Host "`n✅ Deployment fixed! Check the logs above." -ForegroundColor Green
Write-Host "🌐 Visit: http://46.225.183.47:3000" -ForegroundColor Cyan
