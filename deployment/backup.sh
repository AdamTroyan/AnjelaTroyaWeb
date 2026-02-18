#!/bin/bash

##############################################################################
# Automatic Backup Script for Angela Troy Real Estate Website
# Place this in /root/backup-anjelaweb.sh
# Add to crontab: 0 2 * * * /root/backup-anjelaweb.sh >> /var/log/backup.log 2>&1
##############################################################################

set -e

# Configuration
APP_DIR="/var/www/AnjelaTroyaWeb"
BACKUP_DIR="/var/backups/anjelaweb"
DB_NAME="anjelaweb"
RETENTION_DAYS=7
DATE=$(date +%Y%m%d_%H%M%S)

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_info() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

print_info "Starting backup..."

# 1. Backup PostgreSQL Database
print_info "Backing up database..."
if sudo -u postgres pg_dump $DB_NAME | gzip > $BACKUP_DIR/db_$DATE.sql.gz; then
    print_status "Database backup completed: db_$DATE.sql.gz"
    DB_SIZE=$(du -h $BACKUP_DIR/db_$DATE.sql.gz | cut -f1)
    print_info "Database backup size: $DB_SIZE"
else
    print_error "Database backup failed!"
    exit 1
fi

# 2. Backup Uploads Directory
print_info "Backing up uploads..."
if [ -d "$APP_DIR/public/uploads" ]; then
    if tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz -C $APP_DIR/public uploads 2>/dev/null; then
        print_status "Uploads backup completed: uploads_$DATE.tar.gz"
        UPLOADS_SIZE=$(du -h $BACKUP_DIR/uploads_$DATE.tar.gz | cut -f1)
        print_info "Uploads backup size: $UPLOADS_SIZE"
    else
        print_error "Uploads backup failed!"
    fi
else
    print_info "No uploads directory found, skipping..."
fi

# 3. Backup .env file
print_info "Backing up environment configuration..."
if [ -f "$APP_DIR/.env" ]; then
    if cp $APP_DIR/.env $BACKUP_DIR/env_$DATE.backup; then
        chmod 600 $BACKUP_DIR/env_$DATE.backup
        print_status "Environment file backed up: env_$DATE.backup"
    else
        print_error "Environment file backup failed!"
    fi
else
    print_info "No .env file found, skipping..."
fi

# 4. Backup Nginx configuration
print_info "Backing up Nginx configuration..."
if [ -f "/etc/nginx/sites-available/anjelaweb" ]; then
    if cp /etc/nginx/sites-available/anjelaweb $BACKUP_DIR/nginx_$DATE.conf; then
        print_status "Nginx config backed up: nginx_$DATE.conf"
    fi
fi

# 5. Backup PM2 ecosystem file
print_info "Backing up PM2 configuration..."
if [ -f "$APP_DIR/ecosystem.config.js" ]; then
    if cp $APP_DIR/ecosystem.config.js $BACKUP_DIR/ecosystem_$DATE.js; then
        print_status "PM2 config backed up: ecosystem_$DATE.js"
    fi
fi

# 6. Clean up old backups
print_info "Cleaning up old backups (older than $RETENTION_DAYS days)..."
DELETED_COUNT=$(find $BACKUP_DIR -name "*.gz" -o -name "*.backup" -o -name "*.conf" -o -name "*.js" -mtime +$RETENTION_DAYS -delete -print | wc -l)
if [ $DELETED_COUNT -gt 0 ]; then
    print_status "Deleted $DELETED_COUNT old backup files"
else
    print_info "No old backups to delete"
fi

# 7. Calculate total backup size
TOTAL_SIZE=$(du -sh $BACKUP_DIR | cut -f1)
BACKUP_COUNT=$(ls -1 $BACKUP_DIR | wc -l)

# Summary
echo ""
echo "========================================="
print_status "Backup completed successfully!"
echo "========================================="
print_info "Backup directory: $BACKUP_DIR"
print_info "Total backups: $BACKUP_COUNT files"
print_info "Total size: $TOTAL_SIZE"
print_info "Retention: $RETENTION_DAYS days"
echo ""

# Optional: Upload to remote storage (uncomment if needed)
# print_info "Uploading to remote storage..."
# scp $BACKUP_DIR/db_$DATE.sql.gz user@backup-server:/backups/
# or use rclone, aws s3 cp, etc.

exit 0
