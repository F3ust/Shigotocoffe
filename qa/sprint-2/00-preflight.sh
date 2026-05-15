#!/usr/bin/env bash
# Preflight: GET /api/health — database.connected must be true

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/../be-crud-tests/lib/assert.sh"

export API_BASE="${API_BASE:-http://localhost:5000/api}"

echo "============================================"
echo " 00 — Preflight (health / database)"
echo "============================================"

ROOT_URL="${API_BASE%/api}"

echo ""
echo "── TC-00-01: GET /api/health"
RESP=$(curl -s -w "\n__STATUS__%{http_code}" "${ROOT_URL}/api/health")
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -n1 | sed 's/__STATUS__//')

assert_status_code 200 "$STATUS" "TC-00-01 GET /api/health → 200"
assert_json_field "$BODY" '.status' 'ok' "TC-00-01 health status is ok"

if ! command -v jq &>/dev/null; then
  _fail "TC-00-01 jq for database.connected" "jq not installed"
else
  CONNECTED=$(echo "$BODY" | jq -r '.database.connected' 2>/dev/null)
  if [ "$CONNECTED" = "true" ]; then
    _pass "TC-00-01 database.connected is true"
  else
    _fail "TC-00-01 database.connected is true" "got: $CONNECTED (start MongoDB: docker compose -p shigoto-coffee up -d; check MONGODB_URI in .env)"
  fi
fi

print_summary "00-preflight"
export_counts
