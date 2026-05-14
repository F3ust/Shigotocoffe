#!/usr/bin/env bash
# Test suite: GET /api/cafes — list with filters and pagination
# Tests: 7

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/lib/assert.sh"

echo "============================================"
echo " 01 — GET /api/cafes (list, filters, pagination)"
echo "============================================"

# ── TC-01-01: Basic list returns 200, success status, data array, pagination ──
echo ""
echo "── TC-01-01: Basic list"
RESP=$(curl -s -w "\n__STATUS__%{http_code}" "${BASE_URL}/cafes")
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -n1 | sed 's/__STATUS__//')

assert_status_code 200 "$STATUS" "TC-01-01 GET /api/cafes → 200"
assert_json_field "$BODY" '.status' 'success' "TC-01-01 body.status = success"
assert_json_not_null "$BODY" '.data' "TC-01-01 body.data exists"
assert_json_not_null "$BODY" '.pagination' "TC-01-01 body.pagination exists"
assert_json_not_null "$BODY" '.pagination.page' "TC-01-01 pagination.page exists"
assert_json_not_null "$BODY" '.pagination.limit' "TC-01-01 pagination.limit exists"
assert_json_not_null "$BODY" '.pagination.total' "TC-01-01 pagination.total exists"
assert_json_not_null "$BODY" '.pagination.totalPages' "TC-01-01 pagination.totalPages exists"

# Verify data is an array
DATA_TYPE=$(echo "$BODY" | jq -r '.data | type' 2>/dev/null)
if [ "$DATA_TYPE" = "array" ]; then
  _pass "TC-01-01 body.data is array"
else
  _fail "TC-01-01 body.data is array" "Expected array, got $DATA_TYPE"
fi

# ── TC-01-02: Search query ?q=workspace ──
echo ""
echo "── TC-01-02: Text search ?q=workspace"
RESP=$(curl -s -w "\n__STATUS__%{http_code}" "${BASE_URL}/cafes?q=workspace")
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -n1 | sed 's/__STATUS__//')

assert_status_code 200 "$STATUS" "TC-01-02 GET /api/cafes?q=workspace → 200"
assert_json_field "$BODY" '.status' 'success' "TC-01-02 status = success"

# Check that all returned items have "workspace" (case-insensitive) in name or description
COUNT=$(echo "$BODY" | jq '[.data[] | select(
  ((.name.ja // "" | ascii_downcase) | contains("workspace")) or
  ((.name.vi // "" | ascii_downcase) | contains("workspace")) or
  ((.description.ja // "" | ascii_downcase) | contains("workspace")) or
  ((.description.vi // "" | ascii_downcase) | contains("workspace"))
)] | length' 2>/dev/null)
TOTAL=$(echo "$BODY" | jq '.data | length' 2>/dev/null)

if [ "$COUNT" -eq "$TOTAL" ] && [ "$TOTAL" -gt 0 ]; then
  _pass "TC-01-02 all results contain 'workspace' in name/description"
else
  _fail "TC-01-02 all results contain 'workspace' in name/description" \
    "Only $COUNT/$TOTAL items matched"
fi

# ── TC-01-03: District filter ──
echo ""
echo "── TC-01-03: District filter"
RESP=$(curl -s -w "\n__STATUS__%{http_code}" "${BASE_URL}/cafes?district=Ba%20%C4%90%C3%ACnh")
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -n1 | sed 's/__STATUS__//')

assert_status_code 200 "$STATUS" "TC-01-03 GET /api/cafes with district filter returns 200"
assert_json_field "$BODY" '.status' 'success' "TC-01-03 status = success"

TOTAL=$(echo "$BODY" | jq '.data | length' 2>/dev/null)
NON_MATCHING=$(echo "$BODY" | jq '[.data[] | select(.district != "Ba Đình")] | length' 2>/dev/null)
if [ "$NON_MATCHING" -eq 0 ] && [ "$TOTAL" -gt 0 ]; then
  _pass "TC-01-03 all results match the requested district"
else
  _fail "TC-01-03 all results match the requested district" \
    "$NON_MATCHING/$TOTAL items have wrong district"
fi

# ── TC-01-04: minRating filter ──
echo ""
echo "── TC-01-04: minRating=4 filter"
RESP=$(curl -s -w "\n__STATUS__%{http_code}" "${BASE_URL}/cafes?minRating=4")
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -n1 | sed 's/__STATUS__//')

assert_status_code 200 "$STATUS" "TC-01-04 GET /api/cafes?minRating=4 → 200"
assert_json_field "$BODY" '.status' 'success' "TC-01-04 status = success"

TOTAL=$(echo "$BODY" | jq '.data | length' 2>/dev/null)
BELOW=$(echo "$BODY" | jq '[.data[] | select(.averageRating < 4)] | length' 2>/dev/null)
if [ "$BELOW" -eq 0 ] && [ "$TOTAL" -gt 0 ]; then
  _pass "TC-01-04 all results have averageRating >= 4"
else
  _fail "TC-01-04 all results have averageRating >= 4" \
    "$BELOW/$TOTAL items have averageRating < 4"
fi

# ── TC-01-05: Tag filter (single tag) ?tags=wifi ──
echo ""
echo "── TC-01-05: Tag filter ?tags=wifi"
RESP=$(curl -s -w "\n__STATUS__%{http_code}" "${BASE_URL}/cafes?tags=wifi")
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -n1 | sed 's/__STATUS__//')

assert_status_code 200 "$STATUS" "TC-01-05 GET /api/cafes?tags=wifi → 200"
assert_json_field "$BODY" '.status' 'success' "TC-01-05 status = success"

TOTAL=$(echo "$BODY" | jq '.data | length' 2>/dev/null)
WITHOUT_WIFI=$(echo "$BODY" | jq '[.data[] | select(.hashtags | index("wifi") | not)] | length' 2>/dev/null)
if [ "$WITHOUT_WIFI" -eq 0 ] && [ "$TOTAL" -gt 0 ]; then
  _pass "TC-01-05 all results contain hashtag 'wifi'"
else
  _fail "TC-01-05 all results contain hashtag 'wifi'" \
    "$WITHOUT_WIFI/$TOTAL items missing 'wifi'"
fi

# ── TC-01-06: Tag filter (multiple, AND-match) ?tags=wifi,outlets ──
echo ""
echo "── TC-01-06: Multi-tag AND filter ?tags=wifi,outlets"
RESP=$(curl -s -w "\n__STATUS__%{http_code}" "${BASE_URL}/cafes?tags=wifi,outlets")
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -n1 | sed 's/__STATUS__//')

assert_status_code 200 "$STATUS" "TC-01-06 GET /api/cafes?tags=wifi,outlets → 200"
assert_json_field "$BODY" '.status' 'success' "TC-01-06 status = success"

TOTAL=$(echo "$BODY" | jq '.data | length' 2>/dev/null)
MISSING=$(echo "$BODY" | jq '
  [.data[] | select(
    ((.hashtags | index("wifi")) == null) or
    ((.hashtags | index("outlets")) == null)
  )] | length' 2>/dev/null)
if [ "$MISSING" -eq 0 ] && [ "$TOTAL" -gt 0 ]; then
  _pass "TC-01-06 all results have both 'wifi' AND 'outlets'"
else
  _fail "TC-01-06 all results have both 'wifi' AND 'outlets'" \
    "$MISSING/$TOTAL items missing at least one tag"
fi

# ── TC-01-07: Pagination ?page=2&limit=5 ──
echo ""
echo "── TC-01-07: Pagination ?page=2&limit=5"
RESP=$(curl -s -w "\n__STATUS__%{http_code}" "${BASE_URL}/cafes?page=2&limit=5")
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -n1 | sed 's/__STATUS__//')

assert_status_code 200 "$STATUS" "TC-01-07 GET /api/cafes?page=2&limit=5 → 200"
assert_json_field "$BODY" '.pagination.page' '2' "TC-01-07 pagination.page = 2"
assert_json_field "$BODY" '.pagination.limit' '5' "TC-01-07 pagination.limit = 5"

echo ""
print_summary "01-get-list"
export_counts
