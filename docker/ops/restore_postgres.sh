#!/usr/bin/env sh
set -eu

if [ "$#" -lt 1 ]; then
  echo "Usage: $0 <backup-file.dump> [target-db]"
  exit 1
fi

COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"
BACKUP_FILE="$1"
TARGET_DB="${2:-ticketing_restore_test}"

if [ ! -f "${BACKUP_FILE}" ]; then
  echo "[restore] Backup file not found: ${BACKUP_FILE}"
  exit 1
fi

echo "[restore] Preparing target database: ${TARGET_DB}"

docker compose -f "${COMPOSE_FILE}" exec -T postgres sh -lc "
  set -eu
  export PGPASSWORD=\"\$POSTGRES_PASSWORD\"
  psql -U \"\$POSTGRES_USER\" -d postgres -v ON_ERROR_STOP=1 \
    -c \"DROP DATABASE IF EXISTS ${TARGET_DB};\"
  psql -U \"\$POSTGRES_USER\" -d postgres -v ON_ERROR_STOP=1 \
    -c \"CREATE DATABASE ${TARGET_DB};\"
"

echo "[restore] Restoring backup ${BACKUP_FILE} -> ${TARGET_DB}"

docker compose -f "${COMPOSE_FILE}" exec -T postgres sh -lc "
  set -eu
  export PGPASSWORD=\"\$POSTGRES_PASSWORD\"
  pg_restore -U \"\$POSTGRES_USER\" -d \"${TARGET_DB}\" --clean --if-exists --no-owner --no-privileges
" < "${BACKUP_FILE}"

echo "[restore] Restore completed successfully."
