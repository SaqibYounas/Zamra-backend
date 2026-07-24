#!/bin/bash

set -Eeuo pipefail

BLUE_SERVICE="zamra-backend-blue"
GREEN_SERVICE="zamra-backend-green"

BLUE_PORT=5000
GREEN_PORT=5001

echo "🔍 Checking current running deployment..."

if sudo docker ps --format "{{.Names}}" | grep -q "zamra-app-blue"; then
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
echo "New Service : $TARGET_SERVICE"
echo "New Port    : $NEW_PORT"
echo "Old Service : $OLD_SERVICE"
echo "================================="


echo "📦 Building Docker image..."
sudo docker compose build "$TARGET_SERVICE"


echo "▶️ Starting new container..."
sudo docker compose up -d "$TARGET_SERVICE"


echo "⏳ Waiting for application startup..."
sleep 10


echo "🔄 Updating Nginx..."

sudo sed -i \
"s/127.0.0.1:${OLD_PORT}/127.0.0.1:${NEW_PORT}/g" \
/etc/nginx/sites-available/default


echo "🧪 Testing Nginx..."
sudo nginx -t


echo "♻️ Reloading Nginx..."
sudo systemctl reload nginx


echo "🧹 Stopping old container..."
sudo docker compose stop "$OLD_SERVICE"


echo "🧹 Removing unused images..."
sudo docker image prune -f


echo "================================="
echo "✅ Zero Downtime Deployment Complete"
echo "Active Service : $TARGET_SERVICE"
echo "Active Port    : $NEW_PORT"
echo "================================="

exit 0