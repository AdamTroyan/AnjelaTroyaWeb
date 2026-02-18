#!/bin/bash

# Fix database connection timeout on Hetzner server
# Run this on the server: bash fix-env.sh

echo "Fixing .env.production on server..."

# Backup current .env.production
cp .env.production .env.production.backup.$(date +%Y%m%d_%H%M%S)

# Remove channel_binding=require from DATABASE_URL
sed -i 's/channel_binding=require&//g' .env.production

# Update SMTP settings - change port to 587 and secure to false
sed -i 's/SMTP_PORT=465/SMTP_PORT=587/' .env.production
sed -i 's/SMTP_SECURE=true/SMTP_SECURE=false/' .env.production

echo "✅ .env.production updated"
echo ""
echo "Changes made:"
echo "1. Removed channel_binding=require (causes timeout)"
echo "2. Changed SMTP_PORT from 465 to 587"
echo "3. Changed SMTP_SECURE from true to false (uses STARTTLS)"
echo ""
echo "Now deploying..."

# Deploy
git pull
npm run build
pm2 restart all

echo ""
echo "✅ Deployment complete!"
echo "Check logs: pm2 logs --lines 20"
