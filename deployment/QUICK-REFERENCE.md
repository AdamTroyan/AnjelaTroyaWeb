# Hetzner Deployment - Quick Reference Card

## 🎯 Essential Commands

### Application Management

```bash
# Check status
pm2 status

# View logs (live)
pm2 logs anjelaweb

# View last 50 lines
pm2 logs anjelaweb --lines 50

# Restart application
pm2 restart anjelaweb

# Stop application
pm2 stop anjelaweb

# Start application
pm2 start anjelaweb

# Monitor resources
pm2 monit

# Save PM2 config
pm2 save
```

### Deployment

```bash
# Quick deploy/update
cd /var/www/anjelaweb && ./deployment/deploy.sh

# Manual deployment
cd /var/www/anjelaweb
git pull
npm ci
npx prisma migrate deploy
npm run build
pm2 restart anjelaweb
```

### Database

```bash
# Connect to PostgreSQL
sudo -u postgres psql -d anjelaweb

# Backup database
sudo -u postgres pg_dump anjelaweb | gzip > backup_$(date +%Y%m%d).sql.gz

# Restore database
./deployment/restore.sh /path/to/backup.sql.gz

# View database size
sudo -u postgres psql -d anjelaweb -c "SELECT pg_size_pretty(pg_database_size('anjelaweb'));"

# Automated backup
./deployment/backup.sh

# Setup daily backups (2 AM)
crontab -e
# Add: 0 2 * * * /var/www/anjelaweb/deployment/backup.sh >> /var/log/backup.log 2>&1
```

### Nginx

```bash
# Test configuration
nginx -t

# Reload configuration
systemctl reload nginx

# Restart Nginx
systemctl restart nginx

# View error log
tail -f /var/log/nginx/error.log

# View access log
tail -f /var/log/nginx/access.log
```

### SSL Certificate

```bash
# Install/renew SSL
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test auto-renewal
certbot renew --dry-run

# Force renewal
certbot renew --force-renewal

# Check certificate expiry
certbot certificates
```

### System Health

```bash
# Run health check
./deployment/health-check.sh

# Check disk space
df -h

# Check memory usage
free -h

# Check system load
htop
# or
top

# Check processes
ps aux | grep node

# Check open ports
netstat -tulpn
```

### Services

```bash
# PostgreSQL
systemctl status postgresql
systemctl restart postgresql

# Redis
systemctl status redis-server
systemctl restart redis-server
redis-cli ping

# Nginx
systemctl status nginx
systemctl restart nginx

# Check all services
systemctl list-units --type=service --state=running
```

### Firewall

```bash
# Check firewall status
ufw status

# Allow port
ufw allow 80/tcp

# Deny port
ufw deny 8080/tcp

# Delete rule
ufw delete allow 80/tcp

# Reload firewall
ufw reload
```

### Logs

```bash
# Application logs
pm2 logs anjelaweb

# Nginx access log
tail -f /var/log/nginx/access.log

# Nginx error log
tail -f /var/log/nginx/error.log

# PostgreSQL log
tail -f /var/log/postgresql/postgresql-16-main.log

# System log
journalctl -xe
journalctl -u nginx
journalctl -u postgresql
```

### Troubleshooting

```bash
# Check if app is responding
curl http://localhost:3000
curl https://yourdomain.com

# Check database connection
cd /var/www/anjelaweb
node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.\$connect().then(() => console.log('DB Connected')).catch(e => console.error('DB Error:', e))"

# Check environment variables
cat /var/www/anjelaweb/.env

# Check what's using port 3000
lsof -i :3000
# or
netstat -tlnp | grep 3000

# Kill process on port 3000
kill -9 $(lsof -t -i:3000)
```

### File Management

```bash
# Check uploads directory size
du -sh /var/www/anjelaweb/public/uploads

# Find large files
find /var/www/anjelaweb -type f -size +10M -ls

# Clean npm cache
npm cache clean --force

# Clean old logs
truncate -s 0 /var/log/nginx/access.log
truncate -s 0 /var/log/nginx/error.log
```

### Performance

```bash
# Node.js memory usage
pm2 monit

# Database active connections
sudo -u postgres psql -d anjelaweb -c "SELECT COUNT(*) FROM pg_stat_activity;"

# Database slow queries (if logging enabled)
sudo -u postgres psql -d anjelaweb -c "SELECT * FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"

# Network connections
ss -tuln

# I/O stats
iostat -x 1
```

### Updates

```bash
# Update system packages
apt update && apt upgrade -y

# Update Node.js packages
cd /var/www/anjelaweb
npm outdated
npm update

# Update PM2
npm install -g pm2@latest
pm2 update
```

---

## 🔥 Emergency Commands

### Application is down:

```bash
pm2 logs anjelaweb --lines 100  # Check logs
pm2 restart anjelaweb           # Restart app
```

### Out of disk space:

```bash
df -h                           # Check space
du -sh /var/www/anjelaweb/*     # Find large directories
find /var/backups -mtime +7 -delete  # Clean old backups
npm cache clean --force         # Clean npm cache
```

### High memory usage:

```bash
pm2 monit                       # Check memory usage
pm2 restart anjelaweb           # Restart to free memory
```

### Database issues:

```bash
systemctl status postgresql     # Check if running
systemctl restart postgresql    # Restart database
sudo -u postgres psql -c "SELECT version();"  # Test connection
```

### SSL expired:

```bash
certbot renew                   # Renew certificate
systemctl reload nginx          # Reload Nginx
```

---

## 📱 Daily Operations Checklist

- [ ] Check application status: `pm2 status`
- [ ] Check disk space: `df -h`
- [ ] Check logs for errors: `pm2 logs anjelaweb --lines 20`
- [ ] Verify backups exist: `ls -lh /var/backups/anjelaweb/`

---

## 🔗 Important Paths

```
Application:     /var/www/anjelaweb
Environment:     /var/www/anjelaweb/.env
PM2 Config:      /var/www/anjelaweb/ecosystem.config.js
Nginx Config:    /etc/nginx/sites-available/anjelaweb
SSL Certs:       /etc/letsencrypt/live/yourdomain.com/
Backups:         /var/backups/anjelaweb/
PM2 Logs:        /var/log/pm2/
Nginx Logs:      /var/log/nginx/
PostgreSQL:      /var/log/postgresql/
Uploads:         /var/www/anjelaweb/public/uploads/
```

---

**Save this file for quick reference! 📌**

Print it or keep it open in a terminal for easy access.
