# Stage 1 — builder
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build

# Stage 2 — runner
FROM node:20-alpine AS runner

WORKDIR /app

COPY package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

RUN npm ci --omit=dev

USER node

EXPOSE 3000

CMD ["sh", "-c", "DATABASE_URL=$DATABASE_URL npx prisma migrate deploy && node dist/main.js"]
