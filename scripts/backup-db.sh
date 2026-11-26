#!/usr/bin/env bash
# =============================================================================
# backup-db.sh — Automated MySQL backup for Expiry (runs via systemd timer or cron)
#
# Usage:
#   ./backup-db.sh [--keep N]      # default: keep last 7 daily + 4 weekly backups
#
# Environment variables (or sourced from .env):
#   MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE
#   BACKUP_DIR   (default: /home/tducn/data/expiry/backups/db)
#   KEEP_DAILY   (default: 7)
#   KEEP_WEEKLY  (default: 4)
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Load .env if present
ENV_FILE="$PROJECT_ROOT/.env"
if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

# Configuration with defaults
MYSQL_CONTAINER="${MYSQL_CONTAINER:-expiry-mysql84}"
MYSQL_HOST="${MYSQL_HOST:-127.0.0.1}"
MYSQL_PORT="${MYSQL_PORT:-3307}"
MYSQL_USER="${MYSQL_USER:-root}"
MYSQL_PASSWORD="${MYSQL_ROOT_PASSWORD:-${MYSQL_PASSWORD:-root_dev_password}}"
MYSQL_DATABASE="${MYSQL_DATABASE:-expiry_dev}"
BACKUP_DIR="${BACKUP_DIR:-$PROJECT_ROOT/backups/db}"
KEEP_DAILY="${KEEP_DAILY:-7}"
KEEP_WEEKLY="${KEEP_WEEKLY:-4}"

# Parse CLI args
while [[ $# -gt 0 ]]; do
  case "$1" in
    --keep) KEEP_DAILY="$2"; shift 2 ;;
    *) echo "Unknown argument: $1" >&2; exit 1 ;;
  esac
done

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
DAY_OF_WEEK="$(date +%u)"   # 1=Mon … 7=Sun; weekly on Sunday (7)
FILENAME="expiry_${TIMESTAMP}.sql.gz"
BACKUP_PATH="$BACKUP_DIR/$FILENAME"

echo "[backup-db] Starting backup → $BACKUP_PATH"

# Run mysqldump: prefer local client if available, otherwise execute inside docker container
if command -v mysqldump &>/dev/null; then
  MYSQL_PWD="$MYSQL_PASSWORD" mysqldump \
    --host="$MYSQL_HOST" \
    --port="$MYSQL_PORT" \
    --user="$MYSQL_USER" \
    --single-transaction \
    --routines \
    --triggers \
    --events \
    --set-gtid-purged=OFF \
    "$MYSQL_DATABASE" | gzip -9 > "$BACKUP_PATH"
elif docker ps --format '{{.Names}}' | grep -q "^${MYSQL_CONTAINER}$"; then
  echo "[backup-db] Using docker container '${MYSQL_CONTAINER}'..."
  docker exec -i -e MYSQL_PWD="$MYSQL_PASSWORD" "$MYSQL_CONTAINER" mysqldump \
    -u"$MYSQL_USER" \
    --single-transaction \
    --no-tablespaces \
    --routines \
    --triggers \
    --events \
    --set-gtid-purged=OFF \
    "$MYSQL_DATABASE" | gzip -9 > "$BACKUP_PATH"
else
  echo "[backup-db] Error: neither host mysqldump nor container ${MYSQL_CONTAINER} is available." >&2
  exit 1
fi

BACKUP_SIZE="$(du -sh "$BACKUP_PATH" | cut -f1)"
echo "[backup-db] Dump complete: $BACKUP_PATH ($BACKUP_SIZE)"

# --- Rotation: keep last N daily backups ---
echo "[backup-db] Rotating daily backups (keep $KEEP_DAILY)..."
mapfile -t ALL_BACKUPS < <(ls -1t "$BACKUP_DIR"/expiry_*.sql.gz 2>/dev/null || true)
TOTAL=${#ALL_BACKUPS[@]}
if (( TOTAL > KEEP_DAILY )); then
  for (( i=KEEP_DAILY; i<TOTAL; i++ )); do
    echo "[backup-db] Removing old daily backup: ${ALL_BACKUPS[$i]}"
    rm -f "${ALL_BACKUPS[$i]}"
  done
fi

# --- Rotation: preserve one weekly snapshot every Sunday ---
WEEKLY_DIR="$BACKUP_DIR/weekly"
mkdir -p "$WEEKLY_DIR"
if [[ "$DAY_OF_WEEK" == "7" ]]; then
  WEEKLY_FILE="$WEEKLY_DIR/expiry_weekly_${TIMESTAMP}.sql.gz"
  cp "$BACKUP_PATH" "$WEEKLY_FILE"
  echo "[backup-db] Weekly snapshot saved: $WEEKLY_FILE"

  # Keep only last N weekly snapshots
  mapfile -t WEEKLIES < <(ls -1t "$WEEKLY_DIR"/expiry_weekly_*.sql.gz 2>/dev/null || true)
  WEEKLY_TOTAL=${#WEEKLIES[@]}
  if (( WEEKLY_TOTAL > KEEP_WEEKLY )); then
    for (( i=KEEP_WEEKLY; i<WEEKLY_TOTAL; i++ )); do
      echo "[backup-db] Removing old weekly backup: ${WEEKLIES[$i]}"
      rm -f "${WEEKLIES[$i]}"
    done
  fi
fi

echo "[backup-db] Done. Backup retained at: $BACKUP_PATH"
