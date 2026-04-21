#!/bin/sh

echo "[STARTUP] Starting..."
echo "[STARTUP] PORT: ${PORT:-3001}"

exec npx tsx server/index.ts