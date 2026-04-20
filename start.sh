#!/bin/sh

echo "[STARTUP] ====================="
echo "[STARTUP] Iniciando..."
echo "[STARTUP] DATABASE_URL: ${DATABASE_URL:0:50}..."
echo "[STARTUP] PORT: ${PORT:-3001}"
echo "[STARTUP] ====================="

# Teste direto Node
echo "[STARTUP] Testando node..."
node -e "console.log('Node OK')"

echo "[STARTUP] Iniciando server/index.ts..."
exec node --loader tsx server/index.ts
