#!/bin/sh

echo "[STARTUP] Starting..."
echo "[STARTUP] PORT: ${PORT:-3001}"

exec node server/index.ts
