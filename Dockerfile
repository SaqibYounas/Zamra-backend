FROM node:22.14.0-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# --- Production Stage ---

FROM node:22.14.0

WORKDIR /app

COPY package*.json ./
RUN npm install --only=production

COPY --from=builder /app/dist ./dist
COPY .env ./

EXPOSE 5000
CMD ["node", "dist/main.js"]
