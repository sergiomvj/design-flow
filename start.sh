#!/bin/sh

echo "[STARTUP] ====================="
echo "[STARTUP] Starting..."
echo "[STARTUP] DATABASE_URL is set: $(test -n \"$DATABASE_URL\" && echo YES || echo NO)"
echo "[STARTUP] PORT: ${PORT:-3001}"
echo "[STARTUP] ====================="

echo "[STARTUP] Starting node..."
exec node --loader tsx server/index.ts