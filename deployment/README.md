# Deployment Guide - Angela Troy Real Estate Website

<div dir="rtl">

## מדריך פריסה לשרת Hetzner

מסמך זה מתאר את התהליך המלא לפריסת האתר על שרת Hetzner Cloud.

</div>

## 🚀 Quick Start

### Prerequisites
- Hetzner Cloud Server (CPX22 or higher)
- Ubuntu 24.04 LTS
- SSH key configured
- Domain name (optional for initial setup)

---

## 📋 Step-by-Step Deployment

### 1️⃣ Initial Server Setup

Connect to your server and run the setup script:

```bash
# Connect to server
ssh root@YOUR_SERVER_IP

# Download and run setup script
wget https://raw.githubusercontent.com/YOUR_REPO/deployment/setup-server.sh
chmod +x setup-server.sh
sudo ./setup-server.sh
```

Or upload the script manually:

```bash
# From your local machine
scp deployment/setup-server.sh root@YOUR_SERVER_IP:/root/
ssh root@YOUR_SERVER_IP
chmod +x setup-server.sh
sudo ./setup-server.sh
```

**The setup script will:**
- ✅ Update system packages
- ✅ Install Node.js 20.x
- ✅ Install PostgreSQL 16
- ✅ Install Redis
- ✅ Install Nginx
- ✅ Install PM2
- ✅ Configure firewall (UFW)
- ✅ Setup Fail2Ban
- ✅ Create database and user
- ✅ Optimize system settings

---

### 2️⃣ Deploy Your Application

```bash
# Clone your repository
cd /var/www
git clone https://github.com/YOUR_USERNAME/anjelaweb.git
cd anjelaweb

# Copy and edit environment file
cp .env.production.example .env
nano .env

# Update these values in .env:
# - NEXTAUTH_URL with your domain
# - SMTP settings (if using email)
# - R2/S3 settings (if using cloud storage)
# - Turnstile keys (if using anti-spam)

# Run deployment script
chmod +x deployment/deploy.sh
sudo deployment/deploy.sh
```

---

### 3️⃣ Configure Nginx

```bash
# Copy nginx configuration
cp deployment/nginx.conf /etc/nginx/sites-available/anjelaweb

# Edit the file and replace 'yourdomain.com' with your actual domain
nano /etc/nginx/sites-available/anjelaweb

# Create symlink
ln -s /etc/nginx/sites-available/anjelaweb /etc/nginx/sites-enabled/

# Test configuration
nginx -t

# If test passes, reload nginx
systemctl reload nginx
```

---

### 4️⃣ Setup SSL Certificate (Let's Encrypt)

```bash
# Install Certbot (if not already installed by setup script)
apt install -y certbot python3-certbot-nginx

# Get SSL certificate
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test auto-renewal
certbot renew --dry-run
```

---

## 🔄 Updating Your Application

To deploy updates:

```bash
cd /var/www/anjelaweb
sudo deployment/deploy.sh
```

Or manually:

```bash
cd /var/www/anjelaweb
git pull
npm ci
npx prisma migrate deploy
npm run build
pm2 restart anjelaweb
```

---

## 📊 Monitoring & Management

### PM2 Commands

```bash
# View status
pm2 status

# View logs
pm2 logs anjelaweb

# Monitor resources
pm2 monit

# Restart application
pm2 restart anjelaweb

# Stop application
pm2 stop anjelaweb

# View detailed info
pm2 info anjelaweb
```

### System Monitoring

```bash
# Check disk space
df -h

# Check memory usage
free -h

# Check CPU usage
top

# Check PostgreSQL status
systemctl status postgresql

# Check Nginx status
systemctl status nginx

# Check Redis status
systemctl status redis-server
```

### Database Management

```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Connect to your database
\c anjelaweb

# View tables
\dt

# Exit
\q

# Create database backup
sudo -u postgres pg_dump anjelaweb > backup_$(date +%Y%m%d).sql

# Restore database
sudo -u postgres psql anjelaweb < backup_20260218.sql
```

---

## 🔒 Security Best Practices

### 1. Change SSH Port (Optional but Recommended)

```bash
nano /etc/ssh/sshd_config
# Change: Port 22 to Port 2222 (or any other port)
systemctl restart sshd
ufw allow 2222/tcp
ufw delete allow 22/tcp
```

### 2. Setup Automatic Security Updates

```bash
apt install unattended-upgrades
dpkg-reconfigure --priority=low unattended-upgrades
```

### 3. Regular Backups

Create a backup script:

```bash
#!/bin/bash
# /root/backup.sh

BACKUP_DIR="/var/backups/anjelaweb"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
sudo -u postgres pg_dump anjelaweb | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Backup uploads
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /var/www/anjelaweb/public/uploads

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

Add to crontab:

```bash
crontab -e
# Add this line for daily backup at 2 AM:
0 2 * * * /root/backup.sh >> /var/log/backup.log 2>&1
```

---

## 🐛 Troubleshooting

### Application Not Starting

```bash
# Check PM2 logs
pm2 logs anjelaweb --lines 100

# Check if port 3000 is in use
netstat -tulpn | grep 3000

# Test database connection
cd /var/www/anjelaweb
node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.\$connect().then(() => console.log('DB OK')).catch(e => console.error(e))"
```

### High Memory Usage

```bash
# Check processes
pm2 monit

# Restart application
pm2 restart anjelaweb

# Check for memory leaks in logs
pm2 logs anjelaweb | grep -i "memory"
```

### Nginx Errors

```bash
# Check Nginx error log
tail -f /var/log/nginx/error.log

# Test configuration
nginx -t

# Check if application is running
curl http://localhost:3000
```

### Database Connection Issues

```bash
# Check PostgreSQL status
systemctl status postgresql

# Check PostgreSQL logs
tail -f /var/log/postgresql/postgresql-16-main.log

# Test connection
sudo -u postgres psql -c "SELECT version();"
```

---

## 📁 File Structure

```
anjelaweb/
├── deployment/
│   ├── nginx.conf           # Nginx configuration
│   ├── setup-server.sh      # Initial server setup script
│   ├── deploy.sh            # Deployment script
│   └── README.md            # This file
├── ecosystem.config.js      # PM2 configuration
├── .env.production.example  # Environment variables template
└── ...
```

---

## 🌐 Environment Variables

Required variables in `.env`:

```bash
# Database (Auto-generated by setup script)
DATABASE_URL="postgresql://user:pass@localhost:5432/anjelaweb"

# Auth (Auto-generated secret)
NEXTAUTH_SECRET="random-secret"
NEXTAUTH_URL="https://yourdomain.com"

# Redis (Local)
UPSTASH_REDIS_REST_URL="http://localhost:6379"

# Email (Optional)
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="noreply@yourdomain.com"
SMTP_PASSWORD="password"
SMTP_FROM="noreply@yourdomain.com"

# Storage (Optional - for R2/S3)
R2_ACCOUNT_ID="your-account-id"
R2_ACCESS_KEY_ID="your-access-key"
R2_SECRET_ACCESS_KEY="your-secret-key"
R2_BUCKET_NAME="bucket-name"
R2_PUBLIC_BASE_URL="https://your-domain.com"

# Turnstile (Optional - anti-spam)
NEXT_PUBLIC_TURNSTILE_SITE_KEY="site-key"
TURNSTILE_SECRET_KEY="secret-key"
```

---

## 📝 Notes

### Using Local Redis Instead of Upstash

The application is configured to work with both Upstash Redis and local Redis. For Hetzner deployment, local Redis is recommended:

1. The setup script installs Redis automatically
2. Set `UPSTASH_REDIS_REST_URL="http://localhost:6379"`
3. Leave `UPSTASH_REDIS_REST_TOKEN` empty for local Redis

### Database Hosted on Hetzner

The PostgreSQL database runs on the same server:
- Host: `localhost`
- Port: `5432`
- Database, user, and password are set during setup
- Connection string is automatically added to `.env`

### Performance Optimization

For CPX22 (4GB RAM):
- PostgreSQL is configured for 4GB RAM
- PM2 runs in cluster mode
- Nginx handles static files and caching
- Redis for session and rate limiting

---

## 🆘 Support

If you encounter issues:

1. Check application logs: `pm2 logs anjelaweb`
2. Check Nginx logs: `tail -f /var/log/nginx/error.log`
3. Check PostgreSQL logs: `tail -f /var/log/postgresql/*.log`
4. Check system resources: `htop` or `pm2 monit`

---

## ✅ Post-Deployment Checklist

- [ ] Server created on Hetzner (CPX22, x86, Ubuntu 24.04)
- [ ] Firewall configured (ports 22, 80, 443)
- [ ] SSH key uploaded to Hetzner
- [ ] setup-server.sh executed successfully
- [ ] Database created and verified
- [ ] Repository cloned to /var/www/anjelaweb
- [ ] .env file configured with correct values
- [ ] deploy.sh executed successfully
- [ ] Application responding on port 3000
- [ ] Nginx configured with domain name
- [ ] SSL certificate installed (Let's Encrypt)
- [ ] DNS records pointing to server IP
- [ ] HTTPS working correctly
- [ ] Test all major features of the website
- [ ] Backup script configured
- [ ] Monitoring setup (optional: UptimeRobot, etc.)

---

<div dir="rtl">

## 🎯 סיכום

השרת שלך עכשיו מוכן ומותקן עם:
- ✅ Node.js 20 + Next.js
- ✅ PostgreSQL (מאוחסנת על השרת)
- ✅ Redis (מקומי על השרת)
- ✅ Nginx (reverse proxy + SSL)
- ✅ PM2 (ניהול תהליכים)
- ✅ Firewall + Fail2Ban (אבטחה)

**זמן הטיפ:** גיבויים אוטומטיים חשובים! הגדר את הסקריפט למעלה.

</div>

---

**Good luck! 🚀**
