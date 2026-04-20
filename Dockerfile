# Stage 1: Build
FROM node:20-alpine AS build

# Install build dependencies for better-sqlite3 (native addon)
RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build frontend (Vite)
ARG GEMINI_API_KEY
ENV GEMINI_API_KEY=$GEMINI_API_KEY
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

# Runtime libs needed by better-sqlite3
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy everything needed from build stage
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/server ./server
COPY --from=build /app/prisma ./prisma

# Create persistent storage directory for SQLite database
# Mount a Docker volume at /app/data to persist the database between deploys
RUN mkdir -p /app/data

EXPOSE 3001

# Healthcheck - dá 15s para o servidor iniciar antes de verificar
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=5 \
  CMD node -e "fetch('http://localhost:3001/api/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

# DATABASE_URL aponta para o volume persistente
ENV DATABASE_URL="file:/app/data/production.db"

# Roda migration e sobe o servidor
CMD ["sh", "-c", "npx prisma migrate deploy && npx tsx server/index.ts"]
