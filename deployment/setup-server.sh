#!/bin/bash

##############################################################################
# Hetzner Server Setup Script for Angela Troy Real Estate Website
# This script sets up a fresh Ubuntu 24.04 server with all required dependencies
##############################################################################

set -e  # Exit on error

echo "========================================="
echo "Angela Troy Real Estate - Server Setup"
echo "========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    print_error "Please run as root (use sudo)"
    exit 1
fi

# Update system
print_status "Updating system packages..."
apt update && apt upgrade -y

# Install basic tools
print_status "Installing basic tools..."
apt install -y curl wget git build-essential ufw fail2ban

# Install Node.js 20.x
print_status "Installing Node.js 20.x..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node --version
npm --version

# Install PostgreSQL
print_status "Installing PostgreSQL..."
apt install -y postgresql postgresql-contrib
systemctl enable postgresql
systemctl start postgresql

# Install Redis
print_status "Installing Redis..."
apt install -y redis-server
systemctl enable redis-server
systemctl start redis-server

# Configure Redis for local access only
print_status "Configuring Redis..."
sed -i 's/^bind .*/bind 127.0.0.1/' /etc/redis/redis.conf
systemctl restart redis-server

# Install Nginx
print_status "Installing Nginx..."
apt install -y nginx
systemctl enable nginx

# Install PM2 globally
print_status "Installing PM2..."
npm install -g pm2

# Setup PM2 to start on boot
print_status "Configuring PM2 startup..."
env PATH=$PATH:/usr/bin pm2 startup systemd -u root --hp /root

# Create log directory for PM2
mkdir -p /var/log/pm2

# Configure Firewall (UFW)
print_status "Configuring firewall..."
ufw --force enable
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp comment 'SSH'
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'
print_status "Firewall configured"

# Configure Fail2Ban (basic SSH protection)
print_status "Configuring Fail2Ban..."
cat > /etc/fail2ban/jail.local <<EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = ssh
logpath = %(sshd_log)s
backend = %(sshd_backend)s
EOF
systemctl enable fail2ban
systemctl start fail2ban

# Create application directory
print_status "Creating application directory..."
mkdir -p /var/www/AnjelaTroyaWeb
mkdir -p /var/www/certbot

# Setup PostgreSQL database
print_status "Setting up PostgreSQL database..."
read -p "Enter database name [anjelaweb]: " DB_NAME
DB_NAME=${DB_NAME:-anjelaweb}

read -p "Enter database user [anjelauser]: " DB_USER
DB_USER=${DB_USER:-anjelauser}

read -sp "Enter database password: " DB_PASSWORD
echo

# Create PostgreSQL user and database
sudo -u postgres psql <<EOF
CREATE DATABASE ${DB_NAME};
CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASSWORD}';
GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};
\c ${DB_NAME}
GRANT ALL ON SCHEMA public TO ${DB_USER};
ALTER DATABASE ${DB_NAME} OWNER TO ${DB_USER};
EOF

print_status "PostgreSQL database created: ${DB_NAME}"

# Configure PostgreSQL for better performance
print_status "Optimizing PostgreSQL configuration..."
PG_CONF="/etc/postgresql/16/main/postgresql.conf"
if [ -f "$PG_CONF" ]; then
    # Backup original config
    cp $PG_CONF ${PG_CONF}.backup
    
    # Apply optimizations for 4GB RAM system
    cat >> $PG_CONF <<EOF

# Performance tuning for 4GB RAM
shared_buffers = 1GB
effective_cache_size = 3GB
maintenance_work_mem = 256MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 4MB
min_wal_size = 1GB
max_wal_size = 4GB
EOF

    systemctl restart postgresql
    print_status "PostgreSQL optimized"
fi

# Install Certbot for SSL
print_status "Installing Certbot for SSL certificates..."
apt install -y certbot python3-certbot-nginx

# System optimization
print_status "Applying system optimizations..."
cat >> /etc/sysctl.conf <<EOF

# Network optimizations
net.core.somaxconn = 1024
net.ipv4.tcp_max_syn_backlog = 2048
net.ipv4.ip_local_port_range = 10000 65535
net.ipv4.tcp_fin_timeout = 30
net.ipv4.tcp_keepalive_time = 600
EOF

sysctl -p

# Create .env template
print_status "Creating environment file template..."
cat > /var/www/AnjelaTroyaWeb/.env <<EOF
# Database Configuration
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@localhost:5432/${DB_NAME}?schema=public"

# NextAuth Configuration
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="https://yourdomain.com"

# Redis Configuration (Local)
UPSTASH_REDIS_REST_URL="http://localhost:6379"
UPSTASH_REDIS_REST_TOKEN=""

# Application Settings
NODE_ENV="production"
PORT=3000
EOF

chmod 600 /var/www/AnjelaTroyaWeb/.env

print_status "Environment file created at /var/www/AnjelaTroyaWeb/.env"
print_warning "Remember to edit this file with your actual domain and credentials!"

# Summary
echo ""
echo "========================================="
print_status "Server setup completed successfully!"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Clone your repository to /var/www/AnjelaTroyaWeb"
echo "2. Edit /var/www/AnjelaTroyaWeb/.env with your configuration"
echo "3. Run the deploy.sh script to build and start the application"
echo "4. Configure Nginx with your domain"
echo "5. Setup SSL with: certbot --nginx -d yourdomain.com"
echo ""
echo "Database credentials:"
echo "  Database: ${DB_NAME}"
echo "  User: ${DB_USER}"
echo "  Password: ${DB_PASSWORD}"
echo "  Connection: localhost:5432"
echo ""
print_warning "Save these credentials securely!"
echo ""
