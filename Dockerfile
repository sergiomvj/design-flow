# =============================================================================
# Stage 1: Build
# =============================================================================
FROM node:20-alpine AS build

# openssl necessário para os binários do Prisma no Alpine
RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Gera o Prisma Client com binário para Alpine (linux-musl-openssl-3.0.x)
# definido via binaryTargets no schema.prisma
RUN DATABASE_URL="file:./prisma/dev.db" npx prisma generate

# Build do frontend (Vite)
RUN npm run build

# =============================================================================
# Stage 2: Production
# =============================================================================
FROM node:20-alpine

# openssl necessário para rodar o Prisma engine em produção
RUN apk add --no-cache openssl

WORKDIR /app

COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/server ./server
COPY --from=build /app/prisma ./prisma

# Diretório do volume persistente para o SQLite
RUN mkdir -p /app/data

EXPOSE 3001

# Healthcheck (15s para o servidor inicializar)
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=5 \
  CMD node -e "fetch('http://localhost:3001/api/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

# DATABASE_URL, JWT_SECRET e GEMINI_API_KEY devem ser configurados
# nas Environment Variables do EasyPanel (runtime, não build args)
CMD ["sh", "-c", "npx prisma migrate deploy && npx tsx server/index.ts"]
