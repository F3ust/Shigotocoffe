#!/usr/bin/env bash
# Test suite: POST /api/cafes — create café
# Tests: 6
# Side-effect: exports CREATED_CAFE_ID for use by 04-update.sh and 05-delete.sh

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/lib/assert.sh"

echo "============================================"
echo " 03 — POST /api/cafes (create)"
echo "============================================"

FIXTURE="${SCRIPT_DIR}/fixtures/valid-cafe.json"

# ── TC-03-01: POST with valid body → 201, data._id exists ──
echo ""
echo "── TC-03-01: POST valid café body"
RESP=$(curl -s -w "\n__STATUS__%{http_code}" \
  -X POST \
  -H "Content-Type: application/json" \
  -d "@${FIXTURE}" \
  "${BASE_URL}/cafes")
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -n1 | sed 's/__STATUS__//')

assert_status_code 201 "$STATUS" "TC-03-01 POST /api/cafes (valid) → 201"
assert_json_field "$BODY" '.status' 'success' "TC-03-01 body.status = success"
assert_json_not_null "$BODY" '.data._id' "TC-03-01 data._id exists"
assert_json_not_null "$BODY" '.data.name.vi' "TC-03-01 data.name.vi persisted"

# Export the created ID for downstream suites
CREATED_CAFE_ID=$(echo "$BODY" | jq -r '.data._id' 2>/dev/null)
export CREATED_CAFE_ID
if [ -n "$CREATED_CAFE_ID" ] && [ "$CREATED_CAFE_ID" != "null" ]; then
  echo "  Created café ID: $CREATED_CAFE_ID"
  # Persist to temp file for run-all.sh to pass to 04/05
  echo "$CREATED_CAFE_ID" > /tmp/shigoto_created_cafe_id.txt
fi

# ── TC-03-02: POST missing name.vi → 400 ──
echo ""
echo "── TC-03-02: POST missing name.vi"
BAD_BODY=$(jq '. | .name = {"ja": "Test"} ' "${FIXTURE}")
RESP=$(curl -s -w "\n__STATUS__%{http_code}" \
  -X POST \
  -H "Content-Type: application/json" \
  -d "$BAD_BODY" \
  "${BASE_URL}/cafes")
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -n1 | sed 's/__STATUS__//')

assert_status_code 400 "$STATUS" "TC-03-02 POST missing name.vi → 400"
assert_json_field "$BODY" '.status' 'error' "TC-03-02 body.status = error"

# ── TC-03-03: POST missing openingHours.open → 400 ──
echo ""
echo "── TC-03-03: POST missing openingHours.open"
BAD_BODY=$(jq '. | .openingHours = {"close": "22:00"}' "${FIXTURE}")
RESP=$(curl -s -w "\n__STATUS__%{http_code}" \
  -X POST \
  -H "Content-Type: application/json" \
  -d "$BAD_BODY" \
  "${BASE_URL}/cafes")
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -n1 | sed 's/__STATUS__//')

assert_status_code 400 "$STATUS" "TC-03-03 POST missing openingHours.open → 400"
assert_json_field "$BODY" '.status' 'error' "TC-03-03 body.status = error"

MSG=$(echo "$BODY" | jq -r '.message // ""' 2>/dev/null)
echo "  Error message: $MSG"

# ── TC-03-04: POST invalid time format openingHours.open="25:00" → 400 ──
echo ""
echo "── TC-03-04: POST invalid time openingHours.open=25:00"
BAD_BODY=$(jq '. | .openingHours.open = "25:00"' "${FIXTURE}")
RESP=$(curl -s -w "\n__STATUS__%{http_code}" \
  -X POST \
  -H "Content-Type: application/json" \
  -d "$BAD_BODY" \
  "${BASE_URL}/cafes")
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -n1 | sed 's/__STATUS__//')

assert_status_code 400 "$STATUS" "TC-03-04 POST openingHours.open=25:00 → 400"
assert_json_field "$BODY" '.status' 'error' "TC-03-04 body.status = error"

# ── TC-03-05: POST invalid hashtag (not in enum) → 400 ──
echo ""
echo "── TC-03-05: POST invalid hashtag"
BAD_BODY=$(jq '. | .hashtags = ["invalid_tag"]' "${FIXTURE}")
RESP=$(curl -s -w "\n__STATUS__%{http_code}" \
  -X POST \
  -H "Content-Type: application/json" \
  -d "$BAD_BODY" \
  "${BASE_URL}/cafes")
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -n1 | sed 's/__STATUS__//')

assert_status_code 400 "$STATUS" "TC-03-05 POST hashtags=[invalid_tag] → 400"
assert_json_field "$BODY" '.status' 'error' "TC-03-05 body.status = error"

MSG=$(echo "$BODY" | jq -r '.message // ""' 2>/dev/null)
echo "  Error message: $MSG"

# ── TC-03-06: POST location.coordinates with lng > 180 → 400 ──
echo ""
echo "── TC-03-06: POST invalid coordinates (lng > 180)"
BAD_BODY=$(jq '. | .location.coordinates = [200, 21.0]' "${FIXTURE}")
RESP=$(curl -s -w "\n__STATUS__%{http_code}" \
  -X POST \
  -H "Content-Type: application/json" \
  -d "$BAD_BODY" \
  "${BASE_URL}/cafes")
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -n1 | sed 's/__STATUS__//')

assert_status_code 400 "$STATUS" "TC-03-06 POST coordinates=[200,21] → 400"
assert_json_field "$BODY" '.status' 'error' "TC-03-06 body.status = error"

echo ""
print_summary "03-create"
export_counts
