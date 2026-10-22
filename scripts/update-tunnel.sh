#!/usr/bin/env bash
set -euo pipefail

LOG_FILE="/var/log/cloudflared-tunnel.log"

if [ ! -f "$LOG_FILE" ]; then
  echo "Error: $LOG_FILE not found. Is cloudflared-tunnel.service running?"
  exit 1
fi

TUNNEL_URL=$(grep -o 'https://[-a-z0-9.]*\.trycloudflare\.com' "$LOG_FILE" | tail -n 1 || true)

if [ -z "$TUNNEL_URL" ]; then
  echo "Error: Could not extract trycloudflare URL from $LOG_FILE"
  exit 1
fi

echo "Current Cloudflare Tunnel URL: $TUNNEL_URL"
echo "Testing health..."
curl -s --max-time 5 "$TUNNEL_URL/health" || echo ""
echo ""

# Update vercel.json at root and apps/web
sed -i -E "s|https://[-a-z0-9.]*\.trycloudflare\.com|$TUNNEL_URL|g" vercel.json apps/web/vercel.json

echo "Updated vercel.json and apps/web/vercel.json successfully with $TUNNEL_URL"
