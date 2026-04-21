#!/bin/sh

echo "[STARTUP] ====================="
echo "[STARTUP] Starting..."
echo "[STARTUP] DATABASE_URL: ${DATABASE_URL:0:50}..."
echo "[STARTUP] PORT: ${PORT:-3001}"
echo "[STARTUP] ====================="

# Skip migration if DB not reachable
echo "[STARTUP] Trying migration..."
npx prisma migrate deploy || echo "[STARTUP] Migration skipped (DB may not be ready)"

echo "[STARTUP] Starting server..."
exec npx tsx server/index.ts
