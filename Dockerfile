# Stage 1: Build
FROM node:20-alpine AS build

# Install build dependencies for better-sqlite3
RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build frontend
ARG GEMINI_API_KEY
ENV GEMINI_API_KEY=$GEMINI_API_KEY
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

# Better-sqlite3 still needs some runtime libs on alpine
RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/server ./server
COPY --from=build /app/prisma ./prisma

EXPOSE 3001

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://localhost:3001/api/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
