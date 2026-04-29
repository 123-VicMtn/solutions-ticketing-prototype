#!/usr/bin/env sh
set -eu

COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"
BACKUP_DIR="${BACKUP_DIR:-./backups/postgres}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"
TIMESTAMP="$(date +"%Y%m%d_%H%M%S")"
BACKUP_FILE="${BACKUP_DIR}/postgres_${TIMESTAMP}.dump"

mkdir -p "${BACKUP_DIR}"

echo "[backup] Starting PostgreSQL backup -> ${BACKUP_FILE}"

docker compose -f "${COMPOSE_FILE}" exec -T postgres sh -lc '
  PGPASSWORD="$POSTGRES_PASSWORD" pg_dump \
    -U "$POSTGRES_USER" \
    -d "$POSTGRES_DB" \
    -Fc
' > "${BACKUP_FILE}"

if [ ! -s "${BACKUP_FILE}" ]; then
  echo "[backup] Backup file is empty, aborting."
  exit 1
fi

echo "[backup] Backup completed: ${BACKUP_FILE}"

find "${BACKUP_DIR}" -type f -name "*.dump" -mtime +"${RETENTION_DAYS}" -delete
echo "[backup] Retention cleanup done (>${RETENTION_DAYS} days)."
