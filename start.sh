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

MAX_ATTEMPTS="${DB_WAIT_MAX_ATTEMPTS:-15}"
SLEEP_SECONDS="${DB_WAIT_SLEEP_SECONDS:-4}"
ATTEMPT=1

echo "[STARTUP] Applying migrations..."
while [ "$ATTEMPT" -le "$MAX_ATTEMPTS" ]; do
  if npx prisma migrate deploy; then
    echo "[STARTUP] Migrations applied successfully."
    break
  fi

  if [ "$ATTEMPT" -eq "$MAX_ATTEMPTS" ]; then
    echo "[STARTUP] Failed to reach the database after ${MAX_ATTEMPTS} attempts."
    exit 1
  fi

  echo "[STARTUP] Migration attempt ${ATTEMPT}/${MAX_ATTEMPTS} failed. Retrying in ${SLEEP_SECONDS}s..."
  ATTEMPT=$((ATTEMPT + 1))
  sleep "$SLEEP_SECONDS"
done

echo "[STARTUP] Starting server..."
exec npx tsx server/index.ts
