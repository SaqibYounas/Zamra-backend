# Enable BuildKit cache
# Syntax directive for Docker BuildKit
# syntax=docker/dockerfile:1

# --- Builder Stage ---
FROM node:22.14.0-alpine AS builder

WORKDIR /app

# Copy dependency files first
COPY package*.json ./

# Cache npm dependencies between builds
RUN --mount=type=cache,target=/root/.npm \
    npm install --legacy-peer-deps

# Copy source code after dependencies to preserve cache layer
COPY . .

RUN npm run build


# --- Production Stage ---
FROM node:22.14.0-alpine AS runner

WORKDIR /app

COPY package*.json ./

# Cache npm production dependencies
RUN --mount=type=cache,target=/root/.npm \
    npm install --only=production --legacy-peer-deps

COPY --from=builder /app/dist ./dist

EXPOSE 3001

CMD ["node", "dist/main.js"]