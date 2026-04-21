#!/bin/sh

echo "[STARTUP] Starting..."
echo "[STARTUP] PORT: ${PORT:-3001}"

npx prisma migrate deploy || echo "[STARTUP] Migration skipped"

exec npx tsx server/index.ts