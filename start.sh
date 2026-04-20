#!/bin/sh
set -e

echo "[STARTUP] Iniciando Design Flow..."

# Prisma 7: migrate deploy lê DATABASE_URL do ambiente (sem --url)
echo "[STARTUP] Aplicando migrations pendentes..."
npx prisma migrate deploy

echo "[STARTUP] Migrations aplicadas. Iniciando servidor na porta ${PORT:-3001}..."
exec npx tsx server/index.ts
