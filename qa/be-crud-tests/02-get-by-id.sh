#!/usr/bin/env bash
# Test suite: GET /api/cafes/:id
# Tests: 3
# NOTE: This script expects CAFE_ID env var to be set by run-all.sh.
#       If running standalone, it will fetch the first cafe from the list first.

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/lib/assert.sh"

echo "============================================"
echo " 02 — GET /api/cafes/:id"
echo "============================================"

# Resolve a valid café ID if not provided by run-all.sh
if [ -z "${CAFE_ID:-}" ]; then
  echo "(CAFE_ID not set — fetching from list...)"
  LIST_RESP=$(curl -s "${BASE_URL}/cafes?limit=1")
  CAFE_ID=$(echo "$LIST_RESP" | jq -r '.data[0]._id' 2>/dev/null)
fi

if [ -z "$CAFE_ID" ] || [ "$CAFE_ID" = "null" ]; then
  echo "⚠ SKIP — could not resolve a valid CAFE_ID (is DB seeded?)"
  FAIL_COUNT=$((FAIL_COUNT + 3))
  print_summary "02-get-by-id"
  export_counts
  exit 1
fi

echo "Using CAFE_ID: $CAFE_ID"

# ── TC-02-01: GET with valid existing id → 200, data._id matches ──
echo ""
echo "── TC-02-01: GET with valid id"
RESP=$(curl -s -w "\n__STATUS__%{http_code}" "${BASE_URL}/cafes/${CAFE_ID}")
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -n1 | sed 's/__STATUS__//')

assert_status_code 200 "$STATUS" "TC-02-01 GET /api/cafes/:id (valid) → 200"
assert_json_field "$BODY" '.status' 'success' "TC-02-01 body.status = success"
assert_json_field "$BODY" '.data._id' "$CAFE_ID" "TC-02-01 data._id matches requested id"
assert_json_not_null "$BODY" '.data.name.vi' "TC-02-01 data.name.vi is present"

# ── TC-02-02: GET with non-existent valid ObjectId → 404 ──
echo ""
echo "── TC-02-02: GET with non-existent ObjectId"
NONEXIST_ID="000000000000000000000000"
RESP=$(curl -s -w "\n__STATUS__%{http_code}" "${BASE_URL}/cafes/${NONEXIST_ID}")
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -n1 | sed 's/__STATUS__//')

assert_status_code 404 "$STATUS" "TC-02-02 GET /api/cafes/000...000 → 404"
assert_json_field "$BODY" '.status' 'error' "TC-02-02 body.status = error"

# Check message contains "not found" (case-insensitive)
MSG=$(echo "$BODY" | jq -r '.message // ""' 2>/dev/null | tr '[:upper:]' '[:lower:]')
if echo "$MSG" | grep -q "not found"; then
  _pass "TC-02-02 error message contains 'not found'"
else
  _fail "TC-02-02 error message contains 'not found'" "Message was: '$MSG'"
fi

# ── TC-02-03: GET with invalid id format "abc" ──
# Known behavior (from code review): getCafeById does NOT call isValidObjectId before
# Cafe.findById(), so Mongoose throws a CastError → not caught as AppError → 500.
# This is a pre-existing gap (GET by id lacks explicit ObjectId format validation).
# updateCafe and deleteCafe DO have isValidObjectId checks → return 400.
# STATUS: known issue per handover — do NOT fix production code.
echo ""
echo "── TC-02-03: GET with invalid id format 'abc' (known-issue probe)"
RESP=$(curl -s -w "\n__STATUS__%{http_code}" "${BASE_URL}/cafes/abc")
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -n1 | sed 's/__STATUS__//')

# Based on code review: getCafeById has no isValidObjectId guard.
# Mongoose CastError is not an AppError → falls to 500 handler.
# Expected: 500 (actual behavior per code); desired behavior would be 400.
echo "  [KNOWN ISSUE] GET /api/cafes/abc — response HTTP $STATUS"
echo "  Expected per code review: 500 (Mongoose CastError, unhandled AppError)"
echo "  Desired per best practice: 400 (explicit ObjectId validation missing in getCafeById)"

if [ "$STATUS" -eq 500 ]; then
  _pass "TC-02-03 GET /api/cafes/abc → 500 (matches code review — known issue documented)"
elif [ "$STATUS" -eq 400 ]; then
  _pass "TC-02-03 GET /api/cafes/abc → 400 (improved validation present)"
else
  _fail "TC-02-03 GET /api/cafes/abc → unexpected HTTP $STATUS"
fi

echo ""
print_summary "02-get-by-id"
export_counts
