#!/bin/bash

set -Eeuo pipefail

export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

# ============================================================
# Zamra Backend Blue-Green Deployment
# ============================================================

BLUE_SERVICE="zamra-backend-blue"
GREEN_SERVICE="zamra-backend-green"

BLUE_PORT=5000
GREEN_PORT=5001

CONTAINER_PORT=3001

STARTUP_WAIT=5
HEALTH_RETRIES=15
HEALTH_RETRY_DELAY=2

# ============================================================
# Helper functions
# ============================================================

container_running() {
    sudo docker ps --format '{{.Names}}' | grep -Fxq "$1"
}

container_exists() {
    sudo docker ps -a --format '{{.Names}}' | grep -Fxq "$1"
}

show_proxy_pass() {
    echo ""
    echo "🔎 Current Nginx proxy_pass entries:"
    sudo nginx -T 2>&1 | grep -nE 'proxy_pass|5000|5001' || true
}

restore_nginx() {
    local backup_file="$1"
    local nginx_file="$2"

    echo ""
    echo "♻️ Restoring previous Nginx configuration..."

    if [ -f "$backup_file" ]; then
        sudo cp "$backup_file" "$nginx_file"
        sudo nginx -t || true
        sudo systemctl daemon-reload || true
        sudo systemctl reload nginx || true
        echo "✅ Previous Nginx configuration restored."
    else
        echo "⚠️ Nginx backup file not found:"
        echo "$backup_file"
    fi
}

# ============================================================
# Start
# ============================================================

echo "================================="
echo "🚀 Zamra Backend Blue-Green Deploy"
echo "================================="

# ============================================================
# 1. Requirements
# ============================================================

echo ""
echo "🔍 Checking deployment requirements..."

if ! command -v docker >/dev/null 2>&1; then
    echo "❌ Docker is not installed."
    exit 1
fi

if ! command -v nginx >/dev/null 2>&1; then
    echo "❌ Nginx is not installed."
    exit 1
fi

if ! command -v curl >/dev/null 2>&1; then
    echo "❌ curl is not installed."
    exit 1
fi

if ! command -v timeout >/dev/null 2>&1; then
    echo "❌ timeout command is not available."
    exit 1
fi

if ! sudo docker compose version >/dev/null 2>&1; then
    echo "❌ Docker Compose is not available."
    exit 1
fi

echo "✅ Docker OK."
echo "✅ Docker Compose OK."
echo "✅ Nginx OK."
echo "✅ curl OK."

# ============================================================
# 2. Find active Nginx configuration
# ============================================================

echo ""
echo "🔎 Detecting active Nginx configuration..."

NGINX_CONF=""

while IFS= read -r file; do
    if sudo grep -Eq \
        'proxy_pass[[:space:]]+http://(127\.0\.0\.1|localhost):(5000|5001)' \
        "$file" 2>/dev/null; then

        NGINX_CONF="$file"
        break
    fi
done < <(
    find \
        /etc/nginx/sites-enabled \
        /etc/nginx/conf.d \
        /etc/nginx/sites-available \
        -type f \
        2>/dev/null | sort -u
)

if [ -z "$NGINX_CONF" ]; then
    echo "❌ Could not find Nginx config containing proxy_pass."

    show_proxy_pass

    exit 1
fi

echo "✅ Active Nginx config:"
echo "$NGINX_CONF"

NGINX_BACKUP="${NGINX_CONF}.bak"

# ============================================================
# 3. Check current containers
# ============================================================

echo ""
echo "🔍 Checking current running deployment..."

BLUE_RUNNING=false
GREEN_RUNNING=false

if container_running "$BLUE_SERVICE"; then
    BLUE_RUNNING=true
fi

if container_running "$GREEN_SERVICE"; then
    GREEN_RUNNING=true
fi

echo "Blue running  : $BLUE_RUNNING"
echo "Green running : $GREEN_RUNNING"

# ============================================================
# 4. Determine active deployment
# ============================================================

if [ "$BLUE_RUNNING" = true ] && [ "$GREEN_RUNNING" = true ]; then

    echo ""
    echo "⚠️ Both blue and green containers are running."
    echo "🔎 Detecting active Nginx backend..."

    CURRENT_PORT=""

    if sudo grep -Eq \
        "proxy_pass[[:space:]]+http://127\.0\.0\.1:${BLUE_PORT}([;/[:space:]]|$)" \
        "$NGINX_CONF"; then

        CURRENT_PORT="$BLUE_PORT"

    elif sudo grep -Eq \
        "proxy_pass[[:space:]]+http://127\.0\.0\.1:${GREEN_PORT}([;/[:space:]]|$)" \
        "$NGINX_CONF"; then

        CURRENT_PORT="$GREEN_PORT"

    elif sudo grep -Eq \
        "proxy_pass[[:space:]]+http://localhost:${BLUE_PORT}([;/[:space:]]|$)" \
        "$NGINX_CONF"; then

        CURRENT_PORT="$BLUE_PORT"

    elif sudo grep -Eq \
        "proxy_pass[[:space:]]+http://localhost:${GREEN_PORT}([;/[:space:]]|$)" \
        "$NGINX_CONF"; then

        CURRENT_PORT="$GREEN_PORT"
    fi

    if [ "$CURRENT_PORT" = "$BLUE_PORT" ]; then

        OLD_SERVICE="$BLUE_SERVICE"
        OLD_PORT="$BLUE_PORT"

        TARGET_SERVICE="$GREEN_SERVICE"
        NEW_PORT="$GREEN_PORT"

    elif [ "$CURRENT_PORT" = "$GREEN_PORT" ]; then

        OLD_SERVICE="$GREEN_SERVICE"
        OLD_PORT="$GREEN_PORT"

        TARGET_SERVICE="$BLUE_SERVICE"
        NEW_PORT="$BLUE_PORT"

    else

        echo ""
        echo "❌ Could not determine active Nginx backend."

        show_proxy_pass

        echo ""
        echo "🛑 Deployment stopped for safety."

        exit 1
    fi

elif [ "$BLUE_RUNNING" = true ]; then

    OLD_SERVICE="$BLUE_SERVICE"
    OLD_PORT="$BLUE_PORT"

    TARGET_SERVICE="$GREEN_SERVICE"
    NEW_PORT="$GREEN_PORT"

elif [ "$GREEN_RUNNING" = true ]; then

    OLD_SERVICE="$GREEN_SERVICE"
    OLD_PORT="$GREEN_PORT"

    TARGET_SERVICE="$BLUE_SERVICE"
    NEW_PORT="$BLUE_PORT"

else

    echo ""
    echo "❌ Neither blue nor green container is running."
    echo "Cannot safely determine active deployment."

    exit 1
fi

# ============================================================
# 5. Deployment information
# ============================================================

echo ""
echo "================================="
echo "🚀 Deployment Information"
echo "================================="
echo "Nginx Config       : $NGINX_CONF"
echo "Active Service     : $OLD_SERVICE"
echo "Active Port        : $OLD_PORT"
echo "Target Service     : $TARGET_SERVICE"
echo "Target Host Port   : $NEW_PORT"
echo "Container Port     : $CONTAINER_PORT"
echo "================================="

# ============================================================
# 6. Build target
# ============================================================

echo ""
echo "📦 Building target service..."
echo "$TARGET_SERVICE"

sudo docker compose build "$TARGET_SERVICE"

echo "✅ Docker image built successfully."

# ============================================================
# 7. Start target
# ============================================================

echo ""
echo "▶️ Starting target service..."
echo "$TARGET_SERVICE"

sudo docker compose up -d "$TARGET_SERVICE"

echo "✅ Target container started."

# ============================================================
# 8. Wait for startup
# ============================================================

echo ""
echo "⏳ Waiting ${STARTUP_WAIT}s for application startup..."

sleep "$STARTUP_WAIT"

# ============================================================
# 9. Verify target container
# ============================================================

echo ""
echo "🔍 Checking target container..."

if ! container_running "$TARGET_SERVICE"; then

    echo "❌ Target container is not running."

    echo ""
    echo "📋 Container status:"
    sudo docker ps -a \
        --filter "name=${TARGET_SERVICE}" \
        --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'

    echo ""
    echo "📋 Container logs:"
    sudo docker logs --tail 100 "$TARGET_SERVICE" || true

    exit 1
fi

echo "✅ Target container is running."

# ============================================================
# 10. Verify target port
# ============================================================

echo ""
echo "🔌 Checking target port..."
echo "127.0.0.1:${NEW_PORT}"

TARGET_READY=false

for ((i=1; i<=HEALTH_RETRIES; i++)); do

    echo "Attempt ${i}/${HEALTH_RETRIES}..."

    if timeout 3 bash -c \
        "</dev/tcp/127.0.0.1/${NEW_PORT}" \
        2>/dev/null; then

        TARGET_READY=true
        break
    fi

    if [ "$i" -lt "$HEALTH_RETRIES" ]; then
        sleep "$HEALTH_RETRY_DELAY"
    fi
done

if [ "$TARGET_READY" != true ]; then

    echo ""
    echo "❌ Target port ${NEW_PORT} is not reachable."

    echo ""
    echo "📋 Docker port mapping:"
    sudo docker ps \
        --filter "name=${TARGET_SERVICE}" \
        --format 'table {{.Names}}\t{{.Ports}}\t{{.Status}}'

    echo ""
    echo "📋 Container logs:"
    sudo docker logs --tail 100 "$TARGET_SERVICE" || true

    echo ""
    echo "🛑 Nginx has NOT been changed."

    exit 1
fi

echo "✅ Target port ${NEW_PORT} is reachable."

# ============================================================
# 11. Optional HTTP check
# ============================================================

echo ""
echo "🌐 Checking target HTTP response..."

HTTP_STATUS="$(
    curl \
        --silent \
        --output /dev/null \
        --write-out '%{http_code}' \
        --max-time 5 \
        "http://127.0.0.1:${NEW_PORT}/" \
        || true
)"

if [[ "$HTTP_STATUS" =~ ^[0-9]{3}$ ]]; then
    echo "✅ Backend returned HTTP status: $HTTP_STATUS"
    echo "ℹ️ Any HTTP status is accepted here because / may legitimately return 404/401."
else
    echo "⚠️ No HTTP response received."
    echo "Port connectivity is still confirmed."
fi

# ============================================================
# 12. Backup Nginx
# ============================================================

echo ""
echo "💾 Backing up Nginx configuration..."

sudo cp "$NGINX_CONF" "$NGINX_BACKUP"

echo "✅ Backup created:"
echo "$NGINX_BACKUP"

# ============================================================
# 13. Switch Nginx
# ============================================================

echo ""
echo "🔄 Switching Nginx backend..."
echo "${OLD_PORT} → ${NEW_PORT}"

sudo sed -i -E \
    "s#(proxy_pass[[:space:]]+http://)(127\.0\.0\.1|localhost):(5000|5001)#\1127.0.0.1:${NEW_PORT}#g" \
    "$NGINX_CONF"

# ============================================================
# 14. Verify Nginx points to target
# ============================================================

echo ""
echo "🔎 Verifying Nginx target..."

if ! sudo grep -Eq \
    "proxy_pass[[:space:]]+http://127\.0\.0\.1:${NEW_PORT}([;/[:space:]]|$)" \
    "$NGINX_CONF"; then

    echo "❌ Nginx was not updated correctly."

    show_proxy_pass

    restore_nginx "$NGINX_BACKUP" "$NGINX_CONF"

    exit 1
fi

echo "✅ Nginx points to ${NEW_PORT}."

# ============================================================
# 15. Test Nginx configuration
# ============================================================

echo ""
echo "🧪 Testing Nginx configuration..."

if ! sudo nginx -t; then

    echo "❌ Nginx configuration test failed."

    restore_nginx "$NGINX_BACKUP" "$NGINX_CONF"

    exit 1
fi

echo "✅ Nginx configuration is valid."

# ============================================================
# 16. Reload systemd + Nginx
# ============================================================

echo ""
echo "♻️ Reloading Nginx..."

sudo systemctl daemon-reload

if ! sudo systemctl reload nginx; then

    echo "❌ Nginx reload failed."

    restore_nginx "$NGINX_BACKUP" "$NGINX_CONF"

    exit 1
fi

echo "✅ Nginx reloaded successfully."

# ============================================================
# 17. Verify Nginx service
# ============================================================

echo ""
echo "🔍 Checking Nginx service..."

if ! sudo systemctl is-active --quiet nginx; then

    echo "❌ Nginx is not active."

    restore_nginx "$NGINX_BACKUP" "$NGINX_CONF"

    exit 1
fi

echo "✅ Nginx is active."

# ============================================================
# 18. Verify active Nginx config
# ============================================================

echo ""
echo "🌐 Verifying active Nginx routing..."

ACTIVE_PORT=""

if sudo nginx -T 2>&1 | grep -Eq \
    "proxy_pass[[:space:]]+http://127\.0\.0\.1:${NEW_PORT}([;/[:space:]]|$)"; then

    ACTIVE_PORT="$NEW_PORT"

elif sudo nginx -T 2>&1 | grep -Eq \
    "proxy_pass[[:space:]]+http://localhost:${NEW_PORT}([;/[:space:]]|$)"; then

    ACTIVE_PORT="$NEW_PORT"
fi

if [ "$ACTIVE_PORT" != "$NEW_PORT" ]; then

    echo "❌ Active Nginx configuration is not pointing to ${NEW_PORT}."

    show_proxy_pass

    restore_nginx "$NGINX_BACKUP" "$NGINX_CONF"

    exit 1
fi

echo "✅ Active Nginx is routing to ${NEW_PORT}."

# ============================================================
# 19. Verify Nginx endpoint WITHOUT --fail
# ============================================================

echo ""
echo "🌐 Verifying Nginx HTTP traffic..."

NGINX_STATUS="$(
    curl \
        --silent \
        --output /dev/null \
        --write-out '%{http_code}' \
        --max-time 10 \
        http://127.0.0.1/ \
        || true
)"

if [[ "$NGINX_STATUS" =~ ^[0-9]{3}$ ]]; then

    echo "✅ Nginx responded with HTTP status: $NGINX_STATUS"

else

    echo "❌ Nginx did not return an HTTP response."

    echo ""
    echo "🔎 Active proxy:"
    sudo nginx -T 2>&1 | grep -nE 'proxy_pass|5000|5001' || true

    echo ""
    echo "♻️ Restoring previous Nginx configuration..."

    restore_nginx "$NGINX_BACKUP" "$NGINX_CONF"

    exit 1
fi

# ============================================================
# 20. New deployment confirmed
# ============================================================

echo ""
echo "================================="
echo "✅ New deployment verified"
echo "================================="
echo "Target Service : $TARGET_SERVICE"
echo "Target Port    : $NEW_PORT"
echo "Nginx Status   : $NGINX_STATUS"
echo "================================="

# ============================================================
# 21. Stop old container
# ============================================================

echo ""
echo "🧹 Stopping old service..."
echo "$OLD_SERVICE"

sudo docker compose stop "$OLD_SERVICE" || true

echo "✅ Old service stopped."

# ============================================================
# 22. Remove old container
# ============================================================

echo ""
echo "🗑️ Removing old container..."

sudo docker compose rm -f "$OLD_SERVICE" || true

echo "✅ Old container removed."

# ============================================================
# 23. Cleanup
# ============================================================

echo ""
echo "🧹 Cleaning unused Docker images..."

sudo docker image prune -f || true

echo ""
echo "🧹 Cleaning Docker builder cache..."

sudo docker builder prune -af || true

# ============================================================
# 24. Final verification
# ============================================================

echo ""
echo "================================="
echo "🔎 Final Deployment Status"
echo "================================="

sudo docker ps \
    --format 'table {{.Names}}\t{{.Ports}}\t{{.Status}}'

echo ""
echo "🔎 Active Nginx proxy:"

sudo nginx -T 2>&1 | grep -nE 'proxy_pass|5000|5001' || true

echo ""
echo "🔎 Active target port:"

if sudo nginx -T 2>&1 | grep -Eq \
    "proxy_pass[[:space:]]+http://127\.0\.0\.1:${NEW_PORT}([;/[:space:]]|$)"; then

    echo "✅ Nginx → ${NEW_PORT}"
else
    echo "⚠️ Could not confirm final Nginx target."
fi

echo ""
echo "================================="
echo "🎉 Zero Downtime Deployment Complete"
echo "================================="
echo "Active Service : $TARGET_SERVICE"
echo "Active Port    : $NEW_PORT"
echo "================================="

exit 0