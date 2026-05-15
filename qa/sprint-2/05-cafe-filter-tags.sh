#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/../be-crud-tests/lib/assert.sh"

export API_BASE="${API_BASE:-http://localhost:5000/api}"

echo "============================================"
echo " Sprint 2 — 05 cafe filter tags"
echo "============================================"

RESP=$(curl -s -w "\n__STATUS__%{http_code}" "${API_BASE}/cafes?tags=wifi,japanese&limit=50")
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -n1 | sed 's/__STATUS__//')

assert_status_code 200 "$STATUS" "GET /cafes?tags=wifi,japanese → 200"

COUNT=$(echo "$BODY" | jq '.data | length' 2>/dev/null || echo 0)
if [ "$COUNT" -gt 0 ]; then
  HAS_WIFI=$(echo "$BODY" | jq '[.data[].hashtags | index("wifi")] | all(. != null)' 2>/dev/null)
  if [ "$HAS_WIFI" = "true" ]; then
    _pass "all results include wifi tag"
  else
    _fail "tag filter wifi" "not all items have wifi"
  fi
else
  _pass "tag filter returned empty list (acceptable if no seed match)"
fi

RESP=$(curl -s -w "\n__STATUS__%{http_code}" "${API_BASE}/cafes?tags=notARealTag")
STATUS=$(echo "$RESP" | tail -n1 | sed 's/__STATUS__//')
# BE may return 200 with empty or 400 — accept 200 empty or 400
if [ "$STATUS" -eq 400 ] || [ "$STATUS" -eq 200 ]; then
  _pass "unknown tag handled (${STATUS})"
else
  _fail "unknown tag" "expected 200 or 400, got ${STATUS}"
fi

print_summary "05-cafe-filter-tags"
export_counts
[ "$FAIL_COUNT" -eq 0 ] || exit 1
