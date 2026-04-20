# =============================================================================
# Stage 1: Build
# node:22-slim = Node.js 22.x LTS (Debian slim, glibc)
# OBRIGATÓRIO: Prisma 7.7.0 exige node ^20.19 || ^22.12 || >=24.0
# node:20-slim usa Node <20.19 → Prisma CLI recusa rodar (exit code 1)
# =============================================================================
FROM node:22-slim AS build

RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Gera o Prisma Client com Node 22 (satisfaz ^22.12 do Prisma 7.7.0)
RUN DATABASE_URL="file:./prisma/dev.db" npx prisma generate

# Build do frontend (Vite)
RUN npm run build

# =============================================================================
# Stage 2: Production
# =============================================================================
FROM node:22-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/server ./server
COPY --from=build /app/prisma ./prisma

COPY --from=build /app/start.sh ./start.sh
RUN chmod +x ./start.sh

# Diretório do volume persistente para o SQLite
RUN mkdir -p /app/data

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=5 \
  CMD node -e "fetch('http://localhost:3001/api/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

# ENTRYPOINT garante que nenhum "custom command" do EasyPanel sobrescreva o startup
# DATABASE_URL, JWT_SECRET e GEMINI_API_KEY configurados nas Environment Variables do EasyPanel
ENTRYPOINT ["/app/start.sh"]

