#!/bin/sh
set -e

echo "[STARTUP] ====================="
echo "[STARTUP] Starting..."
echo "[STARTUP] DATABASE_URL is set: $(test -n "$DATABASE_URL" && echo YES || echo NO)"
echo "[STARTUP] PORT: ${PORT:-3001}"
echo "[STARTUP] ====================="

if [ -z "$DATABASE_URL" ]; then
  echo "[STARTUP] DATABASE_URL is required"
  exit 1
fi

echo "[STARTUP] Applying migrations..."
npx prisma migrate deploy

echo "[STARTUP] Starting server..."
exec npx tsx server/index.ts
