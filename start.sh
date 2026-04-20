#!/bin/sh
set -e

echo "[STARTUP] Iniciando Design Flow..."

# Garante que o diretorio de dados existe
mkdir -p /app/data

# Define um fallback seguro para execucoes sem variavel injetada pela VPS
: "${DATABASE_URL:=file:/app/data/production.db}"
export DATABASE_URL

DB_PATH="${DATABASE_URL#file:}"
echo "[STARTUP] Database path: ${DB_PATH}"

# Cria o banco vazio se nao existir
if [ ! -f "${DB_PATH}" ]; then
  echo "[STARTUP] Criando banco de dados: ${DB_PATH}"
  touch "${DB_PATH}"
fi

echo "[STARTUP] DATABASE_URL: ${DATABASE_URL}"

# Prisma 7: migrate deploy le DATABASE_URL do ambiente
echo "[STARTUP] Aplicando migrations pendentes..."
npx prisma migrate deploy

echo "[STARTUP] Migrations aplicadas. Iniciando servidor na porta ${PORT:-3001}..."
exec npx tsx server/index.ts
