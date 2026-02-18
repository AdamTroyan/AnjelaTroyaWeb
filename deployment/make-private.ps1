# Private Site Deployment
# Converts the site to require login for all pages

Write-Host "🔒 Making site private - login required..." -ForegroundColor Cyan

# Push to GitHub
Write-Host "`n📤 Pushing to GitHub..." -ForegroundColor Yellow
git add src/middleware.ts src/app/login/page.tsx src/app/login/LoginForm.tsx
git commit -m "Add authentication middleware - require login for all pages"
git push

# Deploy to server
Write-Host "`n🚀 Deploying to server..." -ForegroundColor Yellow
ssh root@46.225.183.47 @"
cd /var/www/AnjelaTroyaWeb
echo '📥 Pulling latest code...'
git stash
git pull
echo '🏗️  Building application...'
npm run build
echo '🔄 Restarting PM2...'
pm2 restart ecosystem.config.js
pm2 save
echo '✅ Done!'
pm2 logs --lines 20
"@

Write-Host "`n✅ Site is now private!" -ForegroundColor Green
Write-Host "🔒 Users must login to access any page" -ForegroundColor Green
Write-Host "🌐 Visit: http://46.225.183.47:3000" -ForegroundColor Cyan
