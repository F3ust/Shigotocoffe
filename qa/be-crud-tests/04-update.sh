#!/usr/bin/env bash
# Test suite: PATCH /api/cafes/:id — update café
# Tests: 4
# Requires: CREATED_CAFE_ID env var (set by 03-create.sh via run-all.sh or /tmp file)

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/lib/assert.sh"

echo "============================================"
echo " 04 — PATCH /api/cafes/:id (update)"
echo "============================================"

# Resolve CREATED_CAFE_ID
if [ -z "${CREATED_CAFE_ID:-}" ] && [ -f /tmp/shigoto_created_cafe_id.txt ]; then
  CREATED_CAFE_ID=$(cat /tmp/shigoto_created_cafe_id.txt)
fi

if [ -z "${CREATED_CAFE_ID:-}" ] || [ "$CREATED_CAFE_ID" = "null" ]; then
  echo "⚠ SKIP — CREATED_CAFE_ID not available (03-create.sh must run first)"
  FAIL_COUNT=$((FAIL_COUNT + 4))
  print_summary "04-update"
  export_counts
  exit 1
fi

echo "Using CREATED_CAFE_ID: $CREATED_CAFE_ID"

# ── TC-04-01: PATCH with valid partial body → 200, field updated ──
echo ""
echo "── TC-04-01: PATCH valid partial body (update description)"
UPDATE_BODY='{"description": {"ja": "Updated QA test description", "vi": "Updated QA test description"}}'
RESP=$(curl -s -w "\n__STATUS__%{http_code}" \
  -X PATCH \
  -H "Content-Type: application/json" \
  -d "$UPDATE_BODY" \
  "${BASE_URL}/cafes/${CREATED_CAFE_ID}")
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -n1 | sed 's/__STATUS__//')

assert_status_code 200 "$STATUS" "TC-04-01 PATCH /api/cafes/:id (valid) → 200"
assert_json_field "$BODY" '.status' 'success' "TC-04-01 body.status = success"
assert_json_field "$BODY" '.data.description.vi' 'Updated QA test description' "TC-04-01 description.vi updated"
assert_json_field "$BODY" '.data.description.ja' 'Updated QA test description' "TC-04-01 description.ja updated"

# ── TC-04-02: PATCH with invalid ObjectId format → 400 ──
echo ""
echo "── TC-04-02: PATCH invalid ObjectId"
RESP=$(curl -s -w "\n__STATUS__%{http_code}" \
  -X PATCH \
  -H "Content-Type: application/json" \
  -d '{"district": "Hoan Kiem"}' \
  "${BASE_URL}/cafes/not-a-valid-id")
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -n1 | sed 's/__STATUS__//')

assert_status_code 400 "$STATUS" "TC-04-02 PATCH invalid ObjectId → 400"
assert_json_field "$BODY" '.status' 'error' "TC-04-02 body.status = error"

MSG=$(echo "$BODY" | jq -r '.message // ""' 2>/dev/null | tr '[:upper:]' '[:lower:]')
if echo "$MSG" | grep -q "invalid"; then
  _pass "TC-04-02 error message contains 'invalid'"
else
  _fail "TC-04-02 error message contains 'invalid'" "Message was: '$MSG'"
fi

# ── TC-04-03: PATCH with non-existent ObjectId → 404 ──
echo ""
echo "── TC-04-03: PATCH non-existent ObjectId"
RESP=$(curl -s -w "\n__STATUS__%{http_code}" \
  -X PATCH \
  -H "Content-Type: application/json" \
  -d '{"district": "Hoan Kiem"}' \
  "${BASE_URL}/cafes/000000000000000000000000")
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -n1 | sed 's/__STATUS__//')

assert_status_code 404 "$STATUS" "TC-04-03 PATCH non-existent id → 404"
assert_json_field "$BODY" '.status' 'error' "TC-04-03 body.status = error"

# ── TC-04-04: PATCH with _id and averageRating in body → 200, immutable fields stripped ──
echo ""
echo "── TC-04-04: PATCH with immutable fields (_id, averageRating) stripped"

# First get current averageRating
CURRENT=$(curl -s "${BASE_URL}/cafes/${CREATED_CAFE_ID}")
CURRENT_RATING=$(echo "$CURRENT" | jq -r '.data.averageRating // 0' 2>/dev/null)
echo "  Current averageRating: $CURRENT_RATING"

PATCH_BODY="{\"_id\": \"000000000000000000000000\", \"averageRating\": 9.9, \"district\": \"Hoan Kiem\"}"
RESP=$(curl -s -w "\n__STATUS__%{http_code}" \
  -X PATCH \
  -H "Content-Type: application/json" \
  -d "$PATCH_BODY" \
  "${BASE_URL}/cafes/${CREATED_CAFE_ID}")
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -n1 | sed 's/__STATUS__//')

assert_status_code 200 "$STATUS" "TC-04-04 PATCH with immutable fields → 200 (not blocked)"
assert_json_field "$BODY" '.status' 'success' "TC-04-04 body.status = success"
assert_json_field "$BODY" '.data.district' 'Hoan Kiem' "TC-04-04 district was updated"

# averageRating should NOT have changed to 9.9
RETURNED_RATING=$(echo "$BODY" | jq -r '.data.averageRating' 2>/dev/null)
if [ "$RETURNED_RATING" != "9.9" ]; then
  _pass "TC-04-04 averageRating NOT overwritten (was $CURRENT_RATING, still $RETURNED_RATING)"
else
  _fail "TC-04-04 averageRating NOT overwritten" \
    "averageRating changed to 9.9 — immutable field was NOT stripped"
fi

# _id should remain original
RETURNED_ID=$(echo "$BODY" | jq -r '.data._id' 2>/dev/null)
if [ "$RETURNED_ID" = "$CREATED_CAFE_ID" ]; then
  _pass "TC-04-04 _id unchanged (immutable field stripped)"
else
  _fail "TC-04-04 _id unchanged" "Expected $CREATED_CAFE_ID, got $RETURNED_ID"
fi

echo ""
print_summary "04-update"
export_counts
