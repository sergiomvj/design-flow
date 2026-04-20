#!/bin/sh
set -e

echo "[STARTUP] ====================="
echo "[STARTUP] Iniciando Design Flow..."
echo "[STARTUP] DATABASE_URL: ${DATABASE_URL}"
echo "[STARTUP] PORT: ${PORT:-3001}"
echo "[STARTUP] ====================="

# Debug: verificar libs
echo "[STARTUP] Verificando ambiente..."
node -v
npm -v
echo "[STARTUP] ====================="

# Prisma migrate
echo "[STARTUP] Aplicando migrations..."
npx prisma migrate deploy
echo "[STARTUP] ====================="

# Iniciar servidor
echo "[STARTUP] Iniciando servidor..."
npx tsx server/index.ts
