#!/bin/sh
set -e

echo "[STARTUP] Iniciando Design Flow..."

# Garante que o diretório de dados existe
mkdir -p /app/data

DB_PATH="${DATABASE_URL#file:}"
echo "[STARTUP] Database path: ${DB_PATH}"

# Cria o banco vazio se não existir
if [ ! -f "${DB_PATH}" ]; then
  echo "[STARTUP] Criando banco de dados: ${DB_PATH}"
  touch "${DB_PATH}"
fi

echo "[STARTUP] DATABASE_URL: ${DATABASE_URL}"

# Prisma 7: migrate deploy lê DATABASE_URL do ambiente (sem --url)
echo "[STARTUP] Aplicando migrations pendentes..."
npx prisma migrate deploy || echo "[STARTUP] Migration pode já estar aplicada ou skip..."

echo "[STARTUP] Migrations aplicadas. Iniciando servidor na porta ${PORT:-3001}..."
exec npx tsx server/index.ts
