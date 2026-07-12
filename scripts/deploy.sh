#!/bin/bash

if docker ps --format "{{.Names}}" | grep -q "zamra-app-blue"; then
    TARGET_SERVICE="zamra-backend-green"
    OLD_SERVICE="zamra-backend-blue"
    NEW_PORT=5001
    OLD_PORT=5000
else
    TARGET_SERVICE="zamra-backend-blue"
    OLD_SERVICE="zamra-backend-green"
    NEW_PORT=5000
    OLD_PORT=5001
fi

echo "🚀 Deploying to $TARGET_SERVICE on port $NEW_PORT..."

docker compose build $TARGET_SERVICE
docker compose up -d $TARGET_SERVICE

echo "⏳ Waiting for app startup and compilation..."
sleep 30

echo "🔄 Swapping traffic routing inside Nginx proxy..."
sudo sed -i "s/127.0.0.1:$OLD_PORT/127.0.0.1:$NEW_PORT/g" /etc/nginx/sites-available/default

sudo systemctl reload nginx

echo "🧹 Stopping old deployment stream ($OLD_SERVICE)..."
docker compose stop $OLD_SERVICE

echo "✅ Zero Downtime Deployment Complete! Purely operational on port $NEW_PORT."