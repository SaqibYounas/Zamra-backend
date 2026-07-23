#!/bin/bash

set -e

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


echo "📦 Pulling latest code..."
git pull origin master


echo "📦 Building Docker image..."
sudo docker compose build $TARGET_SERVICE


echo "▶️ Starting new container..."
sudo docker compose up -d $TARGET_SERVICE


echo "⏳ Waiting for application startup..."
sleep 30


echo "🔎 Checking container status..."

if sudo docker ps --format "{{.Names}}" | grep -q "$TARGET_SERVICE"
then
    echo "✅ Container started successfully"
else
    echo "❌ Container failed to start"
    sudo docker compose logs --tail=100 $TARGET_SERVICE
    exit 1
fi


echo "🔎 Checking application health..."

if curl -f http://127.0.0.1:$NEW_PORT/health > /dev/null 2>&1
then
    echo "✅ Application is healthy"
else
    echo "⚠️ Health endpoint failed"
    echo "Showing logs..."
    sudo docker compose logs --tail=100 $TARGET_SERVICE
    exit 1
fi


echo "🔄 Updating Nginx traffic..."

sudo sed -i \
"s/127.0.0.1:$OLD_PORT/127.0.0.1:$NEW_PORT/g" \
/etc/nginx/sites-available/default


echo "🧪 Testing Nginx configuration..."

sudo nginx -t


echo "♻️ Reloading Nginx..."

sudo systemctl reload nginx


echo "🧹 Removing old container..."

sudo docker compose stop $OLD_SERVICE


echo "🧹 Cleaning unused images..."

sudo docker image prune -f


echo "================================="
echo "✅ Zero Downtime Deployment Done"
echo "Active Service : $TARGET_SERVICE"
echo "Active Port    : $NEW_PORT"
echo "================================="
