#!/bin/bash

set -Eeuo pipefail

export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

BLUE_SERVICE="zamra-backend-blue"
GREEN_SERVICE="zamra-backend-green"

BLUE_PORT=5000
GREEN_PORT=5001

NGINX_CONF="/etc/nginx/sites-available/default"

echo "🔍 Checking current running deployment..."

# Container name match check (flexible grep)
if sudo docker ps --format "{{.Names}}" | grep -q "${BLUE_SERVICE}"; then
    TARGET_SERVICE=$GREEN_SERVICE
    OLD_SERVICE=$BLUE_SERVICE
    NEW_PORT=$GREEN_PORT
    OLD_PORT=$BLUE_PORT
else
    TARGET_SERVICE=$BLUE_SERVICE
    OLD_SERVICE=$GREEN_SERVICE
    NEW_PORT=$BLUE_PORT
    OLD_PORT=$GREEN_PORT
fi

echo "================================="
echo "🚀 Deployment Information"
echo "Active Old Service : $OLD_SERVICE (Port: $OLD_PORT)"
echo "Deploying Target   : $TARGET_SERVICE (Port: $NEW_PORT)"
echo "================================="

echo "📦 Building Docker image..."
sudo docker compose build "$TARGET_SERVICE"

echo "▶️ Starting new container..."
sudo docker compose up -d "$TARGET_SERVICE"

echo "⏳ Waiting for application startup..."
sleep 10

echo "🔄 Updating Nginx Configuration..."

# Regex match: Yeh 5000 ya 5001 dono ko target NEW_PORT se replace kar dega
sudo sed -i -E "s/(127\.0\.0\.1|localhost):(5000|5001)/127.0.0.1:${NEW_PORT}/g" "$NGINX_CONF"

# Verification step
if grep -q "127.0.0.1:${NEW_PORT}" "$NGINX_CONF"; then
    echo "✅ Nginx config successfully updated to port ${NEW_PORT}"
else
    echo "❌ Error: Failed to update port in $NGINX_CONF"
    exit 1
fi

echo "🧪 Testing Nginx..."
sudo nginx -t

echo "♻️ Reloading Nginx..."
sudo systemctl reload nginx

echo "🧹 Stopping old container..."
sudo docker compose stop "$OLD_SERVICE" || true

echo "🧹 Cleaning up unused Docker resources..."
sudo docker system prune -af --volumes
sudo docker builder prune -af

echo "================================="
echo "✅ Zero Downtime Deployment Complete"
echo "Active Service : $TARGET_SERVICE"
echo "Active Port    : $NEW_PORT"
echo "================================="

exit 0