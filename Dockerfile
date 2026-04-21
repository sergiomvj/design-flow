# =============================================================================
# Stage 1: Build
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

EXPOSE 3001

ENTRYPOINT ["/app/start.sh"]
