#!/usr/bin/env bash
# GET /api/cafes/:id — detail + optional lang

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/../be-crud-tests/lib/assert.sh"

export API_BASE="${API_BASE:-http://localhost:5000/api}"

echo "============================================"
echo " 01 — GET /api/cafes/:id (detail)"
echo "============================================"

if [ -z "${CAFE_ID:-}" ]; then
  LIST_RESP=$(curl -s "${API_BASE}/cafes?limit=1")
  CAFE_ID=$(echo "$LIST_RESP" | jq -r '.data[0]._id // empty' 2>/dev/null || true)
fi

if [ -z "$CAFE_ID" ] || [ "$CAFE_ID" = "null" ]; then
  echo "⚠ SKIP — no CAFE_ID (run: cd backend && npm run seed)"
  FAIL_COUNT=$((FAIL_COUNT + 4))
  print_summary "01-cafe-detail"
  export_counts
  exit 1
fi

echo "Using CAFE_ID: $CAFE_ID"

echo ""
echo "── TC-01-01: GET detail"
RESP=$(curl -s -w "\n__STATUS__%{http_code}" "${API_BASE}/cafes/${CAFE_ID}")
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -n1 | sed 's/__STATUS__//')

assert_status_code 200 "$STATUS" "TC-01-01 GET /api/cafes/:id → 200"
assert_json_field "$BODY" '.status' 'success' "TC-01-01 body.status = success"
assert_json_field "$BODY" '.data._id' "$CAFE_ID" "TC-01-01 data._id matches"
assert_json_not_null "$BODY" '.data.name.ja' "TC-01-01 data.name.ja present"

echo ""
echo "── TC-01-02: GET detail with lang=vi"
RESP=$(curl -s -w "\n__STATUS__%{http_code}" "${API_BASE}/cafes/${CAFE_ID}?lang=vi")
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -n1 | sed 's/__STATUS__//')

assert_status_code 200 "$STATUS" "TC-01-02 GET with lang=vi → 200"
assert_json_field "$BODY" '.data.localized.lang' 'vi' "TC-01-02 localized.lang = vi"
assert_json_not_null "$BODY" '.data.localized.name' "TC-01-02 localized.name present"

print_summary "01-cafe-detail"
export_counts
