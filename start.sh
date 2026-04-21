#!/bin/sh

echo "[STARTUP] Starting..."
echo "[STARTUP] DATABASE_URL: ${DATABASE_URL:0:40}..."
echo "[STARTUP] PORT: ${PORT:-3001}"

npx prisma migrate deploy || echo "[STARTUP] Migration skipped"

exec npx tsx server/index.ts