#!/bin/bash

##############################################################################
# System Health Check for Angela Troy Real Estate Website
# Run this script to check if everything is working correctly
##############################################################################

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_pass() {
    echo -e "${GREEN}✓${NC} $1"
}

print_fail() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}!${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_section() {
    echo ""
    echo "========================================="
    echo "$1"
    echo "========================================="
}

ERRORS=0
WARNINGS=0

print_section "Angela Troy Real Estate - System Health Check"

# 1. Check System Resources
print_section "1. System Resources"

# Check disk space
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -lt 80 ]; then
    print_pass "Disk usage: ${DISK_USAGE}%"
else
    print_warning "Disk usage high: ${DISK_USAGE}%"
    WARNINGS=$((WARNINGS+1))
fi

# Check memory
MEMORY_USAGE=$(free | awk 'NR==2 {printf "%.0f", $3*100/$2}')
print_info "Memory usage: ${MEMORY_USAGE}%"

# Check CPU load
LOAD_AVG=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | sed 's/,//')
print_info "Load average: $LOAD_AVG"

# 2. Check Services
print_section "2. Core Services"

# Check PostgreSQL
if systemctl is-active --quiet postgresql; then
    print_pass "PostgreSQL is running"
    # Check if we can connect
    if sudo -u postgres psql -c "SELECT version();" > /dev/null 2>&1; then
        print_pass "PostgreSQL is accepting connections"
    else
        print_fail "PostgreSQL is not accepting connections"
        ERRORS=$((ERRORS+1))
    fi
else
    print_fail "PostgreSQL is not running"
    ERRORS=$((ERRORS+1))
fi

# Check Redis
if systemctl is-active --quiet redis-server; then
    print_pass "Redis is running"
    # Test Redis connection
    if redis-cli ping > /dev/null 2>&1; then
        print_pass "Redis is responding"
    else
        print_fail "Redis is not responding"
        ERRORS=$((ERRORS+1))
    fi
else
    print_fail "Redis is not running"
    ERRORS=$((ERRORS+1))
fi

# Check Nginx
if systemctl is-active --quiet nginx; then
    print_pass "Nginx is running"
    # Test Nginx config
    if nginx -t > /dev/null 2>&1; then
        print_pass "Nginx configuration is valid"
    else
        print_warning "Nginx configuration has errors"
        WARNINGS=$((WARNINGS+1))
    fi
else
    print_fail "Nginx is not running"
    ERRORS=$((ERRORS+1))
fi

# Check Firewall
if ufw status | grep -q "Status: active"; then
    print_pass "Firewall (UFW) is active"
else
    print_warning "Firewall (UFW) is not active"
    WARNINGS=$((WARNINGS+1))
fi

# 3. Check Application
print_section "3. Application Status"

# Check if PM2 is running the app
if pm2 list | grep -q "anjelaweb"; then
    APP_STATUS=$(pm2 jlist | grep -o '"status":"[^"]*"' | head -1 | cut -d'"' -f4)
    if [ "$APP_STATUS" = "online" ]; then
        print_pass "Application is running (PM2)"
        
        # Check uptime
        UPTIME=$(pm2 jlist | grep -o '"pm_uptime":[^,]*' | head -1 | cut -d':' -f2)
        if [ ! -z "$UPTIME" ]; then
            UPTIME_HUMAN=$(date -d @$((UPTIME/1000)) -u +%H:%M:%S 2>/dev/null || echo "unknown")
            print_info "Uptime: $UPTIME_HUMAN"
        fi
        
        # Check memory usage
        MEM=$(pm2 jlist | grep -o '"memory":[^,]*' | head -1 | cut -d':' -f2)
        if [ ! -z "$MEM" ]; then
            MEM_MB=$((MEM/1024/1024))
            print_info "App memory usage: ${MEM_MB}MB"
        fi
    else
        print_fail "Application status: $APP_STATUS"
        ERRORS=$((ERRORS+1))
    fi
else
    print_fail "Application is not running"
    ERRORS=$((ERRORS+1))
fi

# Check if app responds on port 3000
if curl -s http://localhost:3000 > /dev/null; then
    print_pass "Application responding on port 3000"
else
    print_fail "Application not responding on port 3000"
    ERRORS=$((ERRORS+1))
fi

# 4. Check Database
print_section "4. Database Health"

if [ -f "/var/www/anjelaweb/.env" ]; then
    DB_NAME=$(grep DATABASE_URL /var/www/anjelaweb/.env | grep -o 'postgresql://[^/]*/.*/[^?]*' | cut -d'/' -f4 | cut -d'?' -f1)
    
    if [ ! -z "$DB_NAME" ]; then
        # Check if database exists
        if sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
            print_pass "Database exists: $DB_NAME"
            
            # Count tables
            TABLE_COUNT=$(sudo -u postgres psql -d $DB_NAME -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | xargs)
            if [ ! -z "$TABLE_COUNT" ] && [ $TABLE_COUNT -gt 0 ]; then
                print_pass "Database has $TABLE_COUNT tables"
            else
                print_warning "Database has no tables"
                WARNINGS=$((WARNINGS+1))
            fi
            
            # Check database size
            DB_SIZE=$(sudo -u postgres psql -d $DB_NAME -t -c "SELECT pg_size_pretty(pg_database_size('$DB_NAME'));" 2>/dev/null | xargs)
            if [ ! -z "$DB_SIZE" ]; then
                print_info "Database size: $DB_SIZE"
            fi
        else
            print_fail "Database does not exist: $DB_NAME"
            ERRORS=$((ERRORS+1))
        fi
    fi
else
    print_warning ".env file not found"
    WARNINGS=$((WARNINGS+1))
fi

# 5. Check Network
print_section "5. Network & Connectivity"

# Check if ports are open
if netstat -tlnp 2>/dev/null | grep -q ":80 "; then
    print_pass "Port 80 (HTTP) is open"
else
    print_warning "Port 80 (HTTP) is not listening"
    WARNINGS=$((WARNINGS+1))
fi

if netstat -tlnp 2>/dev/null | grep -q ":443 "; then
    print_pass "Port 443 (HTTPS) is open"
else
    print_warning "Port 443 (HTTPS) is not listening"
    WARNINGS=$((WARNINGS+1))
fi

# Check SSL certificate
if [ -d "/etc/letsencrypt/live" ]; then
    CERT_COUNT=$(ls -1 /etc/letsencrypt/live 2>/dev/null | wc -l)
    if [ $CERT_COUNT -gt 0 ]; then
        print_pass "SSL certificate installed"
        # Check expiration
        DOMAIN=$(ls -1 /etc/letsencrypt/live 2>/dev/null | head -1)
        if [ ! -z "$DOMAIN" ] && [ -f "/etc/letsencrypt/live/$DOMAIN/cert.pem" ]; then
            EXPIRY=$(openssl x509 -enddate -noout -in /etc/letsencrypt/live/$DOMAIN/cert.pem | cut -d= -f2)
            print_info "SSL expires: $EXPIRY"
        fi
    else
        print_warning "No SSL certificate found"
        WARNINGS=$((WARNINGS+1))
    fi
else
    print_warning "Let's Encrypt not configured"
    WARNINGS=$((WARNINGS+1))
fi

# 6. Check Logs
print_section "6. Recent Errors in Logs"

# Check PM2 error log
if [ -f "/var/log/pm2/anjelaweb-error.log" ]; then
    ERROR_COUNT=$(grep -c "Error" /var/log/pm2/anjelaweb-error.log 2>/dev/null || echo 0)
    if [ $ERROR_COUNT -eq 0 ]; then
        print_pass "No recent errors in PM2 logs"
    else
        print_warning "Found $ERROR_COUNT errors in PM2 logs"
        WARNINGS=$((WARNINGS+1))
    fi
fi

# Check Nginx error log
NGINX_ERRORS=$(grep -c "error" /var/log/nginx/error.log 2>/dev/null || echo 0)
if [ $NGINX_ERRORS -eq 0 ]; then
    print_pass "No recent errors in Nginx logs"
else
    print_info "Found $NGINX_ERRORS entries in Nginx error log"
fi

# 7. Security Checks
print_section "7. Security"

# Check Fail2Ban
if systemctl is-active --quiet fail2ban; then
    print_pass "Fail2Ban is active"
else
    print_warning "Fail2Ban is not running"
    WARNINGS=$((WARNINGS+1))
fi

# Check SSH configuration
if grep -q "^PermitRootLogin no" /etc/ssh/sshd_config 2>/dev/null; then
    print_pass "Root login via SSH is disabled"
else
    print_warning "Root login via SSH is enabled (consider disabling)"
    WARNINGS=$((WARNINGS+1))
fi

# Check .env permissions
if [ -f "/var/www/anjelaweb/.env" ]; then
    ENV_PERMS=$(stat -c "%a" /var/www/anjelaweb/.env)
    if [ "$ENV_PERMS" = "600" ] || [ "$ENV_PERMS" = "400" ]; then
        print_pass ".env file permissions are secure ($ENV_PERMS)"
    else
        print_warning ".env file permissions are too open ($ENV_PERMS)"
        WARNINGS=$((WARNINGS+1))
    fi
fi

# Summary
print_section "Summary"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed!${NC}"
    echo "Your system is healthy and running well."
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ System is operational with $WARNINGS warning(s)${NC}"
    echo "Consider addressing the warnings above."
else
    echo -e "${RED}✗ Found $ERRORS error(s) and $WARNINGS warning(s)${NC}"
    echo "Please address the errors above."
fi

echo ""
print_info "For detailed logs, use:"
echo "  - Application: pm2 logs anjelaweb"
echo "  - Nginx: tail -f /var/log/nginx/error.log"
echo "  - PostgreSQL: tail -f /var/log/postgresql/*.log"
echo ""

exit $ERRORS
