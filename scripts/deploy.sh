#!/bin/bash

set -Eeuo pipefail

export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

BLUE_SERVICE="zamra-backend-blue"
GREEN_SERVICE="zamra-backend-green"

BLUE_PORT=5000
GREEN_PORT=5001

NGINX_CONF="/etc/nginx/sites-available/default"
NGINX_BACKUP="${NGINX_CONF}.bak"

STARTUP_WAIT=10

echo "================================="
echo "🚀 Zamra Backend Blue-Green Deploy"
echo "================================="

# --------------------------------------------------
# 1. Check required files/tools
# --------------------------------------------------

if [ ! -f "$NGINX_CONF" ]; then
    echo "❌ Nginx config not found: $NGINX_CONF"
    exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
    echo "❌ Docker is not installed or not available."
    exit 1
fi

if ! command -v nginx >/dev/null 2>&1; then
    echo "❌ Nginx is not installed or not available."
    exit 1
fi

# --------------------------------------------------
# 2. Detect currently active container
# --------------------------------------------------

echo "🔍 Checking current running deployment..."

BLUE_RUNNING=false
GREEN_RUNNING=false

if sudo docker ps --format "{{.Names}}" | grep -Fxq "$BLUE_SERVICE"; then
    BLUE_RUNNING=true
fi

if sudo docker ps --format "{{.Names}}" | grep -Fxq "$GREEN_SERVICE"; then
    GREEN_RUNNING=true
fi

if [ "$BLUE_RUNNING" = true ] && [ "$GREEN_RUNNING" = true ]; then
    echo "⚠️ Both blue and green containers are running."
    echo "🔎 Checking Nginx active port..."

    CURRENT_PORT=""

    if grep -Eq "proxy_pass[[:space:]]+http://127\.0\.0\.1:${BLUE_PORT}" "$NGINX_CONF"; then
        CURRENT_PORT="$BLUE_PORT"
    elif grep -Eq "proxy_pass[[:space:]]+http://localhost:${BLUE_PORT}" "$NGINX_CONF"; then
        CURRENT_PORT="$BLUE_PORT"
    elif grep -Eq "proxy_pass[[:space:]]+http://127\.0\.0\.1:${GREEN_PORT}" "$NGINX_CONF"; then
        CURRENT_PORT="$GREEN_PORT"
    elif grep -Eq "proxy_pass[[:space:]]+http://localhost:${GREEN_PORT}" "$NGINX_CONF"; then
        CURRENT_PORT="$GREEN_PORT"
    fi

    if [ "$CURRENT_PORT" = "$BLUE_PORT" ]; then
        TARGET_SERVICE="$GREEN_SERVICE"
        OLD_SERVICE="$BLUE_SERVICE"
        NEW_PORT="$GREEN_PORT"
        OLD_PORT="$BLUE_PORT"
    elif [ "$CURRENT_PORT" = "$GREEN_PORT" ]; then
        TARGET_SERVICE="$BLUE_SERVICE"
        OLD_SERVICE="$GREEN_SERVICE"
        NEW_PORT="$BLUE_PORT"
        OLD_PORT="$GREEN_PORT"
    else
        echo "❌ Could not determine active Nginx backend."
        echo "Current proxy_pass entries:"
        sudo grep -n "proxy_pass" "$NGINX_CONF" || true
        exit 1
    fi

elif [ "$BLUE_RUNNING" = true ]; then
    TARGET_SERVICE="$GREEN_SERVICE"
    OLD_SERVICE="$BLUE_SERVICE"
    NEW_PORT="$GREEN_PORT"
    OLD_PORT="$BLUE_PORT"

elif [ "$GREEN_RUNNING" = true ]; then
    TARGET_SERVICE="$BLUE_SERVICE"
    OLD_SERVICE="$GREEN_SERVICE"
    NEW_PORT="$BLUE_PORT"
    OLD_PORT="$GREEN_PORT"

else
    echo "❌ Neither blue nor green container is currently running."
    echo "Cannot safely determine active deployment."
    exit 1
fi

echo "================================="
echo "🚀 Deployment Information"
echo "Active Old Service : $OLD_SERVICE"
echo "Old Port           : $OLD_PORT"
echo "Deploying Target   : $TARGET_SERVICE"
echo "New Port           : $NEW_PORT"
echo "================================="

# --------------------------------------------------
# 3. Build target service
# --------------------------------------------------

echo "📦 Building Docker image..."

sudo docker compose build "$TARGET_SERVICE"

# --------------------------------------------------
# 4. Start target service
# --------------------------------------------------

echo "▶️ Starting $TARGET_SERVICE..."

sudo docker compose up -d "$TARGET_SERVICE"

# --------------------------------------------------
# 5. Wait for application startup
# --------------------------------------------------

echo "⏳ Waiting ${STARTUP_WAIT}s for application startup..."

sleep "$STARTUP_WAIT"

# --------------------------------------------------
# 6. Verify target container is running
# --------------------------------------------------

echo "🔍 Checking target container..."

if ! sudo docker ps --format "{{.Names}}" | grep -Fxq "$TARGET_SERVICE"; then
    echo "❌ Target container failed to start:"
    echo "$TARGET_SERVICE"

    echo "📋 Container logs:"
    sudo docker logs --tail 100 "$TARGET_SERVICE" || true

    exit 1
fi

echo "✅ Target container is running."

# --------------------------------------------------
# 7. Verify target port is listening
# --------------------------------------------------

echo "🔌 Checking port $NEW_PORT..."

if command -v curl >/dev/null 2>&1; then
    if ! curl -fsS --max-time 5 "http://127.0.0.1:${NEW_PORT}" >/dev/null 2>&1; then
        echo "⚠️ Application did not respond on port $NEW_PORT."
        echo "📋 Container logs:"
        sudo docker logs --tail 100 "$TARGET_SERVICE" || true

        echo "⚠️ Continuing because the application may not expose / on this port."
    else
        echo "✅ Application responded on port $NEW_PORT."
    fi
fi

# --------------------------------------------------
# 8. Backup Nginx configuration
# --------------------------------------------------

echo "💾 Backing up Nginx configuration..."

sudo cp "$NGINX_CONF" "$NGINX_BACKUP"

echo "Backup created:"
echo "$NGINX_BACKUP"

# --------------------------------------------------
# 9. Update Nginx proxy_pass
# --------------------------------------------------

echo "🔄 Updating Nginx Configuration..."

sudo sed -i -E \
  "s#(proxy_pass[[:space:]]+http://)(127\.0\.0\.1|localhost):[0-9]+#\1127.0.0.1:${NEW_PORT}#g" \
  "$NGINX_CONF"

# --------------------------------------------------
# 10. Verify Nginx configuration was updated
# --------------------------------------------------

if grep -Eq \
  "proxy_pass[[:space:]]+http://127\.0\.0\.1:${NEW_PORT}" \
  "$NGINX_CONF"; then

    echo "✅ Nginx proxy updated to port $NEW_PORT"

else

    echo "❌ Failed to update Nginx proxy port."

    echo "🔎 Current proxy_pass configuration:"
    sudo grep -n "proxy_pass" "$NGINX_CONF" || true

    echo "♻️ Restoring previous Nginx configuration..."

    sudo cp "$NGINX_BACKUP" "$NGINX_CONF"

    exit 1
fi

# --------------------------------------------------
# 11. Test Nginx configuration
# --------------------------------------------------

echo "🧪 Testing Nginx configuration..."

if ! sudo nginx -t; then

    echo "❌ Nginx configuration test failed."

    echo "♻️ Restoring previous configuration..."

    sudo cp "$NGINX_BACKUP" "$NGINX_CONF"

    echo "🧪 Testing restored configuration..."

    sudo nginx -t || true

    exit 1
fi

echo "✅ Nginx configuration is valid."

# --------------------------------------------------
# 12. Reload Nginx
# --------------------------------------------------

echo "♻️ Reloading Nginx..."

if ! sudo systemctl reload nginx; then

    echo "❌ Failed to reload Nginx."

    echo "♻️ Restoring previous configuration..."

    sudo cp "$NGINX_BACKUP" "$NGINX_CONF"

    sudo nginx -t
    sudo systemctl reload nginx || true

    exit 1
fi

echo "✅ Nginx successfully switched to port $NEW_PORT."

# --------------------------------------------------
# 13. Verify Nginx is active
# --------------------------------------------------

echo "🔍 Verifying Nginx..."

if ! sudo systemctl is-active --quiet nginx; then
    echo "❌ Nginx is not active."

    echo "♻️ Restoring previous configuration..."

    sudo cp "$NGINX_BACKUP" "$NGINX_CONF"
    sudo nginx -t
    sudo systemctl reload nginx || true

    exit 1
fi

echo "✅ Nginx is active."

# --------------------------------------------------
# 14. Stop old container
# --------------------------------------------------

echo "🧹 Stopping old container..."

sudo docker compose stop "$OLD_SERVICE" || true

echo "✅ Old service stopped: $OLD_SERVICE"

# --------------------------------------------------
# 15. Remove old container
# --------------------------------------------------

echo "🗑️ Removing old container..."

sudo docker compose rm -f "$OLD_SERVICE" || true

# --------------------------------------------------
# 16. Cleanup Docker resources
# --------------------------------------------------

echo "🧹 Cleaning unused Docker resources..."

sudo docker image prune -f || true
sudo docker builder prune -af || true

# Do NOT use:
# docker system prune -af --volumes
#
# because that can remove unused volumes and potentially
# destroy persistent application data.

# --------------------------------------------------
# 17. Final verification
# --------------------------------------------------

echo "================================="
echo "🔎 Final Deployment Status"
echo "================================="

sudo docker ps --format "table {{.Names}}\t{{.Ports}}\t{{.Status}}"

echo ""
echo "Active Nginx proxy:"
sudo grep -n "proxy_pass" "$NGINX_CONF" || true

echo ""
echo "================================="
echo "✅ Zero Downtime Deployment Complete"
echo "================================="
echo "Active Service : $TARGET_SERVICE"
echo "Active Port    : $NEW_PORT"
echo "================================="

exit 0