#!/bin/bash

##############################################################################
# Deployment Script for Angela Troy Real Estate Website
# Run this script after setup-server.sh to deploy/update the application
##############################################################################

set -e  # Exit on error

APP_DIR="/var/www/AnjelaTroyaWeb"
APP_NAME="anjelaweb"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

print_info() {
    echo -e "${BLUE}[i]${NC} $1"
}

echo "========================================="
echo "Angela Troy Real Estate - Deployment"
echo "========================================="

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    print_error "Please run as root (use sudo)"
    exit 1
fi

# Check if app directory exists
if [ ! -d "$APP_DIR" ]; then
    print_error "Application directory not found: $APP_DIR"
    print_info "Please clone your repository first:"
    echo "  cd /var/www"
    echo "  git clone <your-repo-url> anjelaweb"
    exit 1
fi

cd $APP_DIR

# Check if .env exists
if [ ! -f "$APP_DIR/.env" ]; then
    print_error ".env file not found!"
    print_info "Please create .env file with your configuration"
    exit 1
fi

# Pull latest changes (if git repo)
if [ -d ".git" ]; then
    print_status "Pulling latest changes from git..."
    git pull
else
    print_warning "Not a git repository, skipping pull"
fi

# Install dependencies
print_status "Installing dependencies..."
npm ci --production=false

# Generate Prisma client
print_status "Generating Prisma client..."
npx prisma generate

# Run database migrations
print_status "Running database migrations..."
npx prisma migrate deploy

# Build the application
print_status "Building Next.js application..."
npm run build

# Stop PM2 process if running
print_status "Stopping current application..."
pm2 stop $APP_NAME || true
pm2 delete $APP_NAME || true

# Start with PM2
print_status "Starting application with PM2..."
pm2 start ecosystem.config.js

# Save PM2 process list
pm2 save

# Show status
print_status "Application deployed successfully!"
echo ""
pm2 status

# Show logs location
echo ""
print_info "Logs location:"
echo "  - PM2 logs: pm2 logs $APP_NAME"
echo "  - Error log: /var/log/pm2/${APP_NAME}-error.log"
echo "  - Output log: /var/log/pm2/${APP_NAME}-out.log"
echo ""

# Test if app is responding
print_status "Testing application..."
sleep 3
if curl -s http://localhost:3000 > /dev/null; then
    print_status "Application is responding on port 3000"
else
    print_error "Application is not responding on port 3000"
    echo "Check logs with: pm2 logs $APP_NAME"
fi

echo ""
echo "========================================="
print_status "Deployment completed!"
echo "========================================="
echo ""
print_info "Useful commands:"
echo "  pm2 status           - Check application status"
echo "  pm2 logs $APP_NAME   - View logs"
echo "  pm2 restart $APP_NAME - Restart application"
echo "  pm2 stop $APP_NAME   - Stop application"
echo "  pm2 monit            - Monitor resources"
echo ""
