#!/usr/bin/env bash
# Test suite: DELETE /api/cafes/:id
# Tests: 3
# Requires: CREATED_CAFE_ID env var (set by 03-create.sh)

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/lib/assert.sh"

echo "============================================"
echo " 05 — DELETE /api/cafes/:id"
echo "============================================"

# Resolve CREATED_CAFE_ID
if [ -z "${CREATED_CAFE_ID:-}" ] && [ -f /tmp/shigoto_created_cafe_id.txt ]; then
  CREATED_CAFE_ID=$(cat /tmp/shigoto_created_cafe_id.txt)
fi

if [ -z "${CREATED_CAFE_ID:-}" ] || [ "$CREATED_CAFE_ID" = "null" ]; then
  echo "⚠ SKIP — CREATED_CAFE_ID not available (03-create.sh must run first)"
  FAIL_COUNT=$((FAIL_COUNT + 3))
  print_summary "05-delete"
  export_counts
  exit 1
fi

echo "Using CREATED_CAFE_ID: $CREATED_CAFE_ID"

# ── TC-05-01: DELETE existing café → 204, no body ──
echo ""
echo "── TC-05-01: DELETE existing café"
RESP=$(curl -s -w "\n__STATUS__%{http_code}" \
  -X DELETE \
  "${BASE_URL}/cafes/${CREATED_CAFE_ID}")
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -n1 | sed 's/__STATUS__//')

assert_status_code 204 "$STATUS" "TC-05-01 DELETE /api/cafes/:id (existing) → 204"

# 204 should have empty body
BODY_LEN=${#BODY}
if [ "$BODY_LEN" -le 1 ]; then
  _pass "TC-05-01 response body is empty (correct for 204)"
else
  _fail "TC-05-01 response body is empty" "Got body: '$BODY'"
fi

# Clean up temp file
rm -f /tmp/shigoto_created_cafe_id.txt

# ── TC-05-02: DELETE same café again → 404 ──
echo ""
echo "── TC-05-02: DELETE already-deleted café"
RESP=$(curl -s -w "\n__STATUS__%{http_code}" \
  -X DELETE \
  "${BASE_URL}/cafes/${CREATED_CAFE_ID}")
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -n1 | sed 's/__STATUS__//')

assert_status_code 404 "$STATUS" "TC-05-02 DELETE already-deleted → 404"
assert_json_field "$BODY" '.status' 'error' "TC-05-02 body.status = error"

# ── TC-05-03: DELETE with invalid ObjectId → 400 ──
echo ""
echo "── TC-05-03: DELETE invalid ObjectId"
RESP=$(curl -s -w "\n__STATUS__%{http_code}" \
  -X DELETE \
  "${BASE_URL}/cafes/bad-id-xyz")
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -n1 | sed 's/__STATUS__//')

assert_status_code 400 "$STATUS" "TC-05-03 DELETE invalid ObjectId → 400"
assert_json_field "$BODY" '.status' 'error' "TC-05-03 body.status = error"

MSG=$(echo "$BODY" | jq -r '.message // ""' 2>/dev/null | tr '[:upper:]' '[:lower:]')
if echo "$MSG" | grep -q "invalid"; then
  _pass "TC-05-03 error message contains 'invalid'"
else
  _fail "TC-05-03 error message contains 'invalid'" "Message was: '$MSG'"
fi

echo ""
print_summary "05-delete"
export_counts
