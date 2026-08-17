#!/bin/bash

set -Eeuo pipefail

export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

# ============================================================
# Configuration
# ============================================================

BLUE_SERVICE="zamra-backend-blue"
GREEN_SERVICE="zamra-backend-green"

BLUE_PORT=5000
GREEN_PORT=5001

NGINX_CONF="/etc/nginx/sites-available/default"
NGINX_BACKUP="${NGINX_CONF}.bak"

STARTUP_WAIT=10
HEALTH_RETRIES=10
HEALTH_RETRY_DELAY=2

# ============================================================
# Helper functions
# ============================================================

cleanup_on_error() {
    echo ""
    echo "❌ Deployment failed."

    if [ -n "${NGINX_BACKUP_CREATED:-}" ] &&
       [ "${NGINX_BACKUP_CREATED:-false}" = "true" ]; then

        echo "ℹ️ Nginx backup available at:"
        echo "$NGINX_BACKUP"
    fi
}

trap cleanup_on_error ERR

container_running() {
    sudo docker ps \
        --format '{{.Names}}' |
        grep -Fxq "$1"
}

container_exists() {
    sudo docker ps -a \
        --format '{{.Names}}' |
        grep -Fxq "$1"
}

# ============================================================
# Start
# ============================================================

echo "================================="
echo "🚀 Zamra Backend Blue-Green Deploy"
echo "================================="

# ============================================================
# 1. Check requirements
# ============================================================

echo "🔍 Checking deployment requirements..."

if [ ! -f "$NGINX_CONF" ]; then
    echo "❌ Nginx config not found:"
    echo "$NGINX_CONF"
    exit 1
fi

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

echo "✅ Requirements OK."

# ============================================================
# 2. Check Docker Compose
# ============================================================

echo "🔍 Checking Docker Compose..."

if ! sudo docker compose version >/dev/null 2>&1; then
    echo "❌ Docker Compose is not available."
    exit 1
fi

echo "✅ Docker Compose OK."

# ============================================================
# 3. Detect running containers
# ============================================================

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
# 4. Determine active service
# ============================================================

if [ "$BLUE_RUNNING" = true ] && [ "$GREEN_RUNNING" = true ]; then

    echo ""
    echo "⚠️ Both blue and green containers are running."
    echo "🔎 Detecting active Nginx backend..."

    CURRENT_PORT=""

    # ------------------------------------------
    # Check 127.0.0.1:5000
    # ------------------------------------------

    if grep -Eq \
        "proxy_pass[[:space:]]+http://127\.0\.0\.1:${BLUE_PORT}([;/[:space:]]|$)" \
        "$NGINX_CONF"; then

        CURRENT_PORT="$BLUE_PORT"

    # ------------------------------------------
    # Check 127.0.0.1:5001
    # ------------------------------------------

    elif grep -Eq \
        "proxy_pass[[:space:]]+http://127\.0\.0\.1:${GREEN_PORT}([;/[:space:]]|$)" \
        "$NGINX_CONF"; then

        CURRENT_PORT="$GREEN_PORT"

    # ------------------------------------------
    # Check localhost:5000
    # ------------------------------------------

    elif grep -Eq \
        "proxy_pass[[:space:]]+http://localhost:${BLUE_PORT}([;/[:space:]]|$)" \
        "$NGINX_CONF"; then

        CURRENT_PORT="$BLUE_PORT"

    # ------------------------------------------
    # Check localhost:5001
    # ------------------------------------------

    elif grep -Eq \
        "proxy_pass[[:space:]]+http://localhost:${GREEN_PORT}([;/[:space:]]|$)" \
        "$NGINX_CONF"; then

        CURRENT_PORT="$GREEN_PORT"
    fi

    # ------------------------------------------
    # Determine target
    # ------------------------------------------

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

        echo ""
        echo "❌ Could not determine active Nginx backend."

        echo ""
        echo "🔎 Current proxy_pass entries:"
        sudo grep -n "proxy_pass" "$NGINX_CONF" || true

        echo ""
        echo "🔎 Current port references:"
        sudo grep -nE "5000|5001" "$NGINX_CONF" || true

        echo ""
        echo "⚠️ Both containers are running but Nginx does not"
        echo "clearly point to either 5000 or 5001."

        echo ""
        echo "🛑 Deployment stopped for safety."

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

    echo ""
    echo "❌ Neither blue nor green container is running."
    echo "Cannot safely determine current deployment."

    exit 1
fi

# ============================================================
# 5. Deployment information
# ============================================================

echo ""
echo "================================="
echo "🚀 Deployment Information"
echo "================================="
echo "Active Old Service : $OLD_SERVICE"
echo "Old Port           : $OLD_PORT"
echo "Deploying Target   : $TARGET_SERVICE"
echo "New Port           : $NEW_PORT"
echo "================================="

# ============================================================
# 6. Build target
# ============================================================

echo ""
echo "📦 Building $TARGET_SERVICE..."

sudo docker compose build "$TARGET_SERVICE"

echo "✅ Build completed."

# ============================================================
# 7. Start target
# ============================================================

echo ""
echo "▶️ Starting $TARGET_SERVICE..."

sudo docker compose up -d "$TARGET_SERVICE"

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

    echo "❌ Target container is not running:"
    echo "$TARGET_SERVICE"

    echo ""
    echo "📋 Container logs:"
    sudo docker logs --tail 100 "$TARGET_SERVICE" || true

    exit 1
fi

echo "✅ Target container is running."

# ============================================================
# 10. Health check target
# ============================================================

echo ""
echo "🏥 Checking application health..."
echo "Target URL: http://127.0.0.1:${NEW_PORT}"

HEALTH_OK=false

for ((i=1; i<=HEALTH_RETRIES; i++)); do

    echo "Health check ${i}/${HEALTH_RETRIES}..."

    if curl \
        --silent \
        --show-error \
        --fail \
        --max-time 5 \
        "http://127.0.0.1:${NEW_PORT}" \
        >/dev/null 2>&1; then

        HEALTH_OK=true
        break
    fi

    if [ "$i" -lt "$HEALTH_RETRIES" ]; then
        sleep "$HEALTH_RETRY_DELAY"
    fi
done

if [ "$HEALTH_OK" != true ]; then

    echo ""
    echo "❌ Target application did not respond."
    echo "Port: $NEW_PORT"

    echo ""
    echo "📋 Target container logs:"
    sudo docker logs --tail 100 "$TARGET_SERVICE" || true

    echo ""
    echo "🛑 Nginx will NOT be changed."

    exit 1
fi

echo "✅ Target application is healthy."

# ============================================================
# 11. Backup Nginx
# ============================================================

echo ""
echo "💾 Backing up Nginx configuration..."

sudo cp "$NGINX_CONF" "$NGINX_BACKUP"

NGINX_BACKUP_CREATED=true

echo "✅ Backup created:"
echo "$NGINX_BACKUP"

# ============================================================
# 12. Update Nginx
# ============================================================

echo ""
echo "🔄 Updating Nginx backend..."

sudo sed -i -E \
    "s#(proxy_pass[[:space:]]+http://)(127\.0\.0\.1|localhost):(5000|5001)#\1127.0.0.1:${NEW_PORT}#g" \
    "$NGINX_CONF"

# ============================================================
# 13. Verify Nginx port
# ============================================================

echo ""
echo "🔎 Verifying Nginx backend..."

if grep -Eq \
    "proxy_pass[[:space:]]+http://127\.0\.0\.1:${NEW_PORT}([;/[:space:]]|$)" \
    "$NGINX_CONF"; then

    echo "✅ Nginx now points to port $NEW_PORT."

else

    echo "❌ Nginx port update failed."

    echo ""
    echo "Current proxy_pass:"
    sudo grep -n "proxy_pass" "$NGINX_CONF" || true

    echo ""
    echo "♻️ Restoring Nginx configuration..."

    sudo cp "$NGINX_BACKUP" "$NGINX_CONF"

    exit 1
fi

# ============================================================
# 14. Test Nginx
# ============================================================

echo ""
echo "🧪 Testing Nginx configuration..."

if ! sudo nginx -t; then

    echo ""
    echo "❌ Nginx configuration test failed."

    echo "♻️ Restoring previous configuration..."

    sudo cp "$NGINX_BACKUP" "$NGINX_CONF"

    echo ""
    echo "🧪 Testing restored configuration..."

    sudo nginx -t || true

    exit 1
fi

echo "✅ Nginx configuration is valid."

# ============================================================
# 15. Reload Nginx
# ============================================================

echo ""
echo "♻️ Reloading Nginx..."

if ! sudo systemctl reload nginx; then

    echo ""
    echo "❌ Nginx reload failed."

    echo "♻️ Restoring previous configuration..."

    sudo cp "$NGINX_BACKUP" "$NGINX_CONF"

    sudo nginx -t || true
    sudo systemctl reload nginx || true

    exit 1
fi

echo "✅ Nginx reloaded successfully."

# ============================================================
# 16. Verify Nginx service
# ============================================================

echo ""
echo "🔍 Checking Nginx service..."

if ! sudo systemctl is-active --quiet nginx; then

    echo "❌ Nginx is not active."

    echo "♻️ Restoring previous configuration..."

    sudo cp "$NGINX_BACKUP" "$NGINX_CONF"

    sudo nginx -t || true
    sudo systemctl reload nginx || true

    exit 1
fi

echo "✅ Nginx is active."

# ============================================================
# 17. Verify traffic through Nginx
# ============================================================

echo ""
echo "🌐 Verifying traffic through Nginx..."

if ! curl \
    --silent \
    --show-error \
    --fail \
    --max-time 10 \
    http://127.0.0.1/ \
    >/dev/null 2>&1; then

    echo "❌ Nginx is not successfully serving the application."

    echo ""
    echo "♻️ Restoring previous Nginx configuration..."

    sudo cp "$NGINX_BACKUP" "$NGINX_CONF"

    sudo nginx -t
    sudo systemctl reload nginx

    exit 1
fi

echo "✅ Nginx traffic verification successful."

# ============================================================
# 18. Stop old container
# ============================================================

echo ""
echo "🧹 Stopping old container..."
echo "$OLD_SERVICE"

if ! sudo docker compose stop "$OLD_SERVICE"; then

    echo "⚠️ Could not stop old service."

else

    echo "✅ Old service stopped."
fi

# ============================================================
# 19. Remove old container
# ============================================================

echo ""
echo "🗑️ Removing old container..."

sudo docker compose rm -f "$OLD_SERVICE" || true

echo "✅ Old container removed."

# ============================================================
# 20. Cleanup images
# ============================================================

echo ""
echo "🧹 Cleaning unused Docker images..."

sudo docker image prune -f || true

echo ""
echo "🧹 Cleaning Docker builder cache..."

sudo docker builder prune -af || true

# ============================================================
# 21. Final status
# ============================================================

echo ""
echo "================================="
echo "🔎 Final Deployment Status"
echo "================================="

sudo docker ps \
    --format 'table {{.Names}}\t{{.Ports}}\t{{.Status}}'

echo ""
echo "🔎 Active Nginx proxy:"

sudo grep -n "proxy_pass" "$NGINX_CONF" || true

echo ""
echo "================================="
echo "✅ Zero Downtime Deployment Complete"
echo "================================="
echo "Active Service : $TARGET_SERVICE"
echo "Active Port    : $NEW_PORT"
echo "================================="

exit 0