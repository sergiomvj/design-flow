#!/bin/sh
set -e

echo "[STARTUP] ====================="
echo "[STARTUP] Iniciando Design Flow..."
echo "[STARTUP] DATABASE_URL: ${DATABASE_URL}"
echo "[STARTUP] PORT: ${PORT:-3001}"
echo "[STARTUP] ====================="

# Debug: testar conexão PostgreSQL
echo "[STARTUP] Testando conexão PostgreSQL..."
apt-get update -qq && apt-get install -y -qq postgresql-client > /dev/null 2>&1 || true
PGPASSWORD=Super1404 psql -h webserver2_postgres_designflow -p 5432 -U postgres -d webserver2 -c "SELECT version();" || echo "[STARTUP] PostgreSQL connection failed"

# Prisma migrate
echo "[STARTUP] Aplicando migrations..."
npx prisma migrate deploy
echo "[STARTUP] ====================="

# Iniciar servidor
echo "[STARTUP] Iniciando servidor..."
npx tsx server/index.ts
