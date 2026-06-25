FROM node:22.14.0-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build

# --- Production Stage ---

FROM node:22.14.0

WORKDIR /app

COPY package*.json ./
RUN npm install --only=production --legacy-peer-deps

COPY --from=builder /app/dist ./dist
COPY .env ./

EXPOSE 5000
CMD ["node", "dist/main.js"]
