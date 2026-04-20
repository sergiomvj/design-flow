#!/bin/sh
set -e

echo "[STARTUP] Iniciando Design Flow..."
echo "[STARTUP] DATABASE_URL: ${DATABASE_URL}"
echo "[STARTUP] PORT: ${PORT}"

# Prisma 7: migrate deploy lê DATABASE_URL do ambiente
echo "[STARTUP] Aplicando migrations..."
npx prisma migrate deploy

echo "[STARTUP] Servidor iniciando na porta ${PORT:-3001}..."
exec npx tsx server/index.ts
