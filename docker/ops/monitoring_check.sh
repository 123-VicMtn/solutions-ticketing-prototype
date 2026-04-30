#!/usr/bin/env sh
set -eu

COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"
APP_URL="${APP_URL:-http://localhost:3333}"
HEALTH_CHECK_SECRET="${HEALTH_CHECK_SECRET:-}"
MAX_VOLUME_BYTES="${MAX_VOLUME_BYTES:-21474836480}" # 20 GiB
UPLOADS_VOLUME="${UPLOADS_VOLUME:-solution-ticketing-prototype_uploads}"
PGDATA_VOLUME="${PGDATA_VOLUME:-solution-ticketing-prototype_pgdata}"
ALERT_WEBHOOK_URL="${ALERT_WEBHOOK_URL:-}"

STATUS=0
MESSAGES=""

append_message() {
  line="$1"
  MESSAGES="${MESSAGES}${line}\n"
  echo "${line}"
}

check_health_endpoint() {
  endpoint="$1"
  code="$(curl -s -o /dev/null -w "%{http_code}" "${APP_URL}${endpoint}" || true)"
  if [ "${code}" != "200" ]; then
    STATUS=1
    append_message "[alert] ${endpoint} returned HTTP ${code}"
  else
    append_message "[ok] ${endpoint} returned HTTP 200"
  fi
}

check_ready_endpoint() {
  if [ -n "${HEALTH_CHECK_SECRET}" ]; then
    code="$(curl -s -o /dev/null -w "%{http_code}" \
      -H "x-monitoring-secret: ${HEALTH_CHECK_SECRET}" \
      "${APP_URL}/health/ready" || true)"
  else
    code="$(curl -s -o /dev/null -w "%{http_code}" "${APP_URL}/health/ready" || true)"
  fi

  if [ "${code}" != "200" ]; then
    STATUS=1
    append_message "[alert] /health/ready returned HTTP ${code}"
  else
    append_message "[ok] /health/ready returned HTTP 200"
  fi
}

check_restart_counts() {
  containers="$(docker compose -f "${COMPOSE_FILE}" ps -q || true)"
  if [ -z "${containers}" ]; then
    STATUS=1
    append_message "[alert] No running containers found for ${COMPOSE_FILE}"
    return
  fi

  for container_id in ${containers}; do
    name="$(docker inspect -f '{{.Name}}' "${container_id}" | sed 's#^/##')"
    restart_count="$(docker inspect -f '{{.RestartCount}}' "${container_id}")"
    health_status="$(docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' "${container_id}")"

    if [ "${restart_count}" -gt 0 ]; then
      STATUS=1
      append_message "[alert] ${name} restart count is ${restart_count}"
    else
      append_message "[ok] ${name} restart count is 0"
    fi

    if [ "${health_status}" = "unhealthy" ]; then
      STATUS=1
      append_message "[alert] ${name} health status is unhealthy"
    fi
  done
}

check_volume_usage() {
  volume_name="$1"
  if ! docker volume inspect "${volume_name}" >/dev/null 2>&1; then
    STATUS=1
    append_message "[alert] Docker volume not found: ${volume_name}"
    return
  fi

  used_bytes="$(
    docker run --rm -v "${volume_name}:/volume:ro" alpine:3.20 \
      sh -c "du -sb /volume | awk '{print \$1}'" 2>/dev/null || echo "0"
  )"

  if [ "${used_bytes}" -gt "${MAX_VOLUME_BYTES}" ]; then
    STATUS=1
    append_message "[alert] Volume ${volume_name} usage ${used_bytes} bytes exceeds ${MAX_VOLUME_BYTES}"
  else
    append_message "[ok] Volume ${volume_name} usage ${used_bytes} bytes"
  fi
}

send_alert_if_needed() {
  if [ "${STATUS}" -eq 0 ] || [ -z "${ALERT_WEBHOOK_URL}" ]; then
    return
  fi

  payload="$(printf '{"text":"%s"}' "$(printf "%b" "${MESSAGES}" | tr '\n' ' ' | sed 's/"/\\"/g')")"
  curl -sS -X POST -H "Content-Type: application/json" -d "${payload}" "${ALERT_WEBHOOK_URL}" >/dev/null || true
}

append_message "[info] Running AG-16 monitoring checks"
check_health_endpoint "/health/live"
check_ready_endpoint
check_restart_counts
check_volume_usage "${UPLOADS_VOLUME}"
check_volume_usage "${PGDATA_VOLUME}"
send_alert_if_needed

if [ "${STATUS}" -eq 0 ]; then
  append_message "[ok] Monitoring checks completed successfully"
else
  append_message "[alert] Monitoring checks completed with failures"
fi

exit "${STATUS}"
