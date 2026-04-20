# =============================================================================
# Stage 1: Build
# =============================================================================
FROM node:20-alpine AS build

# Dependências nativas para better-sqlite3
RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# DATABASE_URL temporário só para o prisma generate funcionar no build
# (não precisa de banco real, só gera o client TypeScript)
ENV DATABASE_URL="file:./prisma/dev.db"

# Gera o Prisma Client
RUN npx prisma generate

# Build do frontend (Vite)
# GEMINI_API_KEY é injetada em tempo de build pelo Vite (vite.config.ts define process.env.GEMINI_API_KEY)
ARG GEMINI_API_KEY
RUN GEMINI_API_KEY=$GEMINI_API_KEY npm run build

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

# Em produção, o banco fica no volume persistente /app/data
# As variáveis sensíveis (JWT_SECRET, GEMINI_API_KEY) vêm do ambiente da VPS,
# nunca embutidas na imagem
ENV DATABASE_URL="file:/app/data/production.db"

# Executa as migrations pendentes e sobe o servidor
CMD ["sh", "-c", "npx prisma migrate deploy && npx tsx server/index.ts"]
