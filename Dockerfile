# =============================================================================
# Stage 1: Build
# =============================================================================
FROM node:20-alpine AS build

# Dependências nativas para better-sqlite3
RUN apk add --no-cache python3 make g++ openssl

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# DATABASE_URL: recebe do EasyPanel via --build-arg, com fallback para build local
# Não é dado sensível (apenas caminho de arquivo de desenvolvimento)
ARG DATABASE_URL="file:./prisma/dev.db"
ENV DATABASE_URL=$DATABASE_URL

# Gera o Prisma Client
# --no-engine: o @prisma/adapter-better-sqlite3 substitui o query engine nativo,
# então não precisamos baixar o binário do Prisma (que falha no Alpine/musl)
RUN npx prisma generate --no-engine

# Build do frontend (Vite)
# GEMINI_API_KEY foi removida do build — a chave ficará apenas no servidor (runtime)
RUN npm run build

# =============================================================================
# Stage 2: Production
# =============================================================================
FROM node:20-alpine

# Libs de runtime para better-sqlite3
RUN apk add --no-cache python3 make g++

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

# Em produção: DATABASE_URL, JWT_SECRET e GEMINI_API_KEY devem ser
# configurados nas Environment Variables do EasyPanel (não como build args)
CMD ["sh", "-c", "npx prisma migrate deploy && npx tsx server/index.ts"]
