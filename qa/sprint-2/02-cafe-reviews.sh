#!/usr/bin/env bash
# GET /api/cafes/:id/reviews

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/../be-crud-tests/lib/assert.sh"

export API_BASE="${API_BASE:-http://localhost:5000/api}"

echo "============================================"
echo " 02 — GET /api/cafes/:id/reviews"
echo "============================================"

if [ -z "${CAFE_ID:-}" ]; then
  LIST_RESP=$(curl -s "${API_BASE}/cafes?limit=1")
  CAFE_ID=$(echo "$LIST_RESP" | jq -r '.data[0]._id // empty' 2>/dev/null || true)
fi

if [ -z "$CAFE_ID" ] || [ "$CAFE_ID" = "null" ]; then
  echo "⚠ SKIP — no CAFE_ID"
  FAIL_COUNT=$((FAIL_COUNT + 3))
  print_summary "02-cafe-reviews"
  export_counts
  exit 1
fi

echo "Using CAFE_ID: $CAFE_ID"

echo ""
echo "── TC-02-01: GET reviews list"
RESP=$(curl -s -w "\n__STATUS__%{http_code}" "${API_BASE}/cafes/${CAFE_ID}/reviews")
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -n1 | sed 's/__STATUS__//')

assert_status_code 200 "$STATUS" "TC-02-01 GET /api/cafes/:id/reviews → 200"
assert_json_field "$BODY" '.status' 'success' "TC-02-01 body.status = success"
assert_json_array_not_empty "$BODY" '.data' "TC-02-01 reviews data is non-empty (seed demo reviews)"

LEN=$(echo "$BODY" | jq -r '.data | length' 2>/dev/null || echo 0)
if [ "${LEN:-0}" -ge 1 ] 2>/dev/null; then
  _pass "TC-02-01 at least 1 review for seeded café (unique user+cafe)"
else
  _fail "TC-02-01 at least 1 review for seeded café (unique user+cafe)" "expected >= 1, got $LEN"
fi

print_summary "02-cafe-reviews"
export_counts
