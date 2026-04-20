# =============================================================================
# Stage 1: Build
# =============================================================================
FROM node:22-slim AS build

# openssl e ca-certificates necessarios para o Prisma
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# O Prisma Client ja e gerado no npm install via postinstall do @prisma/client.
# Evitamos rodar `prisma generate` novamente no build porque esse passo tem
# falhado no EasyPanel apesar de nao ser necessario para esta imagem.

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
COPY --from=build /app/prisma.config.ts ./prisma.config.ts
COPY --from=build /app/start.sh ./start.sh

RUN chmod +x ./start.sh
RUN mkdir -p /app/data

EXPOSE 3001

# ENTRYPOINT evita que o EasyPanel sobrescreva o comando de inicializacao com flags invalidas
ENTRYPOINT ["/app/start.sh"]
