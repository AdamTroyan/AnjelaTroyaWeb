#!/bin/bash

##############################################################################
# Database Restore Script for Angela Troy Real Estate Website
# Usage: ./restore.sh backup_file.sql.gz
##############################################################################

set -e

DB_NAME="anjelaweb"
BACKUP_FILE=$1

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

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

# Check if backup file is provided
if [ -z "$BACKUP_FILE" ]; then
    print_error "Usage: $0 <backup_file.sql.gz>"
    echo ""
    echo "Available backups:"
    ls -lh /var/backups/anjelaweb/db_*.sql.gz 2>/dev/null || echo "No backups found"
    exit 1
fi

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    print_error "Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "========================================="
echo "Angela Troy Real Estate - DB Restore"
echo "========================================="
echo ""
print_warning "This will REPLACE the current database!"
print_warning "Database: $DB_NAME"
print_warning "Backup file: $BACKUP_FILE"
echo ""
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    print_error "Restore cancelled"
    exit 1
fi

# Stop the application
print_status "Stopping application..."
pm2 stop anjelaweb || true

# Create a safety backup of current database
SAFETY_BACKUP="/tmp/safety_backup_$(date +%Y%m%d_%H%M%S).sql.gz"
print_status "Creating safety backup of current database..."
sudo -u postgres pg_dump $DB_NAME | gzip > $SAFETY_BACKUP
print_status "Safety backup created: $SAFETY_BACKUP"

# Drop and recreate database
print_status "Dropping current database..."
sudo -u postgres psql <<EOF
DROP DATABASE IF EXISTS ${DB_NAME};
CREATE DATABASE ${DB_NAME};
EOF

# Restore from backup
print_status "Restoring database from backup..."
if gunzip -c $BACKUP_FILE | sudo -u postgres psql $DB_NAME > /dev/null 2>&1; then
    print_status "Database restored successfully!"
else
    print_error "Restore failed!"
    print_warning "Restoring from safety backup..."
    gunzip -c $SAFETY_BACKUP | sudo -u postgres psql $DB_NAME
    print_status "Safety backup restored"
    exit 1
fi

# Grant permissions
print_status "Setting permissions..."
DB_USER=$(grep DATABASE_URL /var/www/anjelaweb/.env | cut -d'/' -f3 | cut -d':' -f1)
sudo -u postgres psql $DB_NAME <<EOF
GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};
GRANT ALL ON SCHEMA public TO ${DB_USER};
EOF

# Start the application
print_status "Starting application..."
pm2 start anjelaweb

# Cleanup safety backup after 1 hour (in background)
(sleep 3600 && rm -f $SAFETY_BACKUP) &

echo ""
echo "========================================="
print_status "Restore completed successfully!"
echo "========================================="
print_status "Safety backup kept for 1 hour: $SAFETY_BACKUP"
echo ""
print_status "Application status:"
pm2 status anjelaweb
echo ""
