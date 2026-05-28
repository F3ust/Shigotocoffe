#!/usr/bin/env bash
# Test suite: Cafe Management (Owner CRUD and ownership checks)
# Tests: 6

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/lib/assert.sh"

echo "============================================"
echo " 07 — Cafe Owner CRUD and Ownership Checks"
echo "============================================"

# Register Owner 1
RANDOM_SUFFIX1=$(date +%s)
REG_BODY1="{\"name\":\"Cafe Owner 1\",\"email\":\"owner1_$RANDOM_SUFFIX1@shigoto.local\",\"password\":\"password123\",\"role\":\"owner\"}"
REG_RESP1=$(curl -s -H "Content-Type: application/json" -d "$REG_BODY1" "${BASE_URL}/auth/register")
OWNER1_TOKEN=$(echo "$REG_RESP1" | jq -r '.data.token // empty')
OWNER1_ID=$(echo "$REG_RESP1" | jq -r '.data.user._id // empty')

if [ -z "$OWNER1_TOKEN" ] || [ -z "$OWNER1_ID" ]; then
  echo "✗ Failed to register owner 1: $REG_RESP1"
  exit 1
fi
echo "✓ Registered Owner 1 (ID: $OWNER1_ID)"

# Register Owner 2
REG_BODY2="{\"name\":\"Cafe Owner 2\",\"email\":\"owner2_$RANDOM_SUFFIX1@shigoto.local\",\"password\":\"password123\",\"role\":\"owner\"}"
REG_RESP2=$(curl -s -H "Content-Type: application/json" -d "$REG_BODY2" "${BASE_URL}/auth/register")
OWNER2_TOKEN=$(echo "$REG_RESP2" | jq -r '.data.token // empty')
OWNER2_ID=$(echo "$REG_RESP2" | jq -r '.data.user._id // empty')

if [ -z "$OWNER2_TOKEN" ]; then
  echo "✗ Failed to register owner 2: $REG_RESP2"
  exit 1
fi
echo "✓ Registered Owner 2 (ID: $OWNER2_ID)"

# ── TC-07-01: Create cafe as Owner 1 ──
echo ""
echo "── TC-07-01: Create cafe as Owner 1"
CAFE_FIXTURE="${SCRIPT_DIR}/fixtures/valid-cafe.json"
RESP=$(curl -s -w "\n__STATUS__%{http_code}" \
  -X POST \
  -H "Authorization: Bearer $OWNER1_TOKEN" \
  -H "Content-Type: application/json" \
  -d "@${CAFE_FIXTURE}" \
  "${BASE_URL}/cafes")
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -n1 | sed 's/__STATUS__//')

assert_status_code 201 "$STATUS" "TC-07-01 POST /api/cafes → 201"
assert_json_field "$BODY" '.status' 'success' "TC-07-01 body.status = success"
assert_json_field "$BODY" '.data.owner' "$OWNER1_ID" "TC-07-01 owner is Owner 1"

CAFE_ID=$(echo "$BODY" | jq -r '.data._id // empty')
if [ -z "$CAFE_ID" ]; then
  echo "✗ Could not extract created cafe ID"
  exit 1
fi

# ── TC-07-02: Try to update cafe as Owner 2 → 403 ──
echo ""
echo "── TC-07-02: Try to update cafe as Owner 2"
RESP=$(curl -s -w "\n__STATUS__%{http_code}" \
  -X PATCH \
  -H "Authorization: Bearer $OWNER2_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"district": "Hoan Kiem"}' \
  "${BASE_URL}/cafes/${CAFE_ID}")
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -n1 | sed 's/__STATUS__//')

assert_status_code 403 "$STATUS" "TC-07-02 update cafe by non-owner → 403"
assert_json_field "$BODY" '.status' 'error' "TC-07-02 body.status = error"

# ── TC-07-03: Try to delete cafe as Owner 2 → 403 ──
echo ""
echo "── TC-07-03: Try to delete cafe as Owner 2"
RESP=$(curl -s -w "\n__STATUS__%{http_code}" \
  -X DELETE \
  -H "Authorization: Bearer $OWNER2_TOKEN" \
  "${BASE_URL}/cafes/${CAFE_ID}")
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -n1 | sed 's/__STATUS__//')

assert_status_code 403 "$STATUS" "TC-07-03 delete cafe by non-owner → 403"
assert_json_field "$BODY" '.status' 'error' "TC-07-03 body.status = error"

# ── TC-07-04: Update cafe as Owner 1 → 200 ──
echo ""
echo "── TC-07-04: Update cafe as Owner 1"
RESP=$(curl -s -w "\n__STATUS__%{http_code}" \
  -X PATCH \
  -H "Authorization: Bearer $OWNER1_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"district": "Tay Ho"}' \
  "${BASE_URL}/cafes/${CAFE_ID}")
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -n1 | sed 's/__STATUS__//')

assert_status_code 200 "$STATUS" "TC-07-04 update cafe by owner → 200"
assert_json_field "$BODY" '.status' 'success' "TC-07-04 body.status = success"
assert_json_field "$BODY" '.data.district' "Tay Ho" "TC-07-04 field was updated successfully"

# ── TC-07-05: Delete cafe as Owner 1 → 204 ──
echo ""
echo "── TC-07-05: Delete cafe as Owner 1"
RESP=$(curl -s -w "\n__STATUS__%{http_code}" \
  -X DELETE \
  -H "Authorization: Bearer $OWNER1_TOKEN" \
  "${BASE_URL}/cafes/${CAFE_ID}")
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -n1 | sed 's/__STATUS__//')

assert_status_code 204 "$STATUS" "TC-07-05 delete cafe by owner → 204"

# ── TC-07-06: Update deleted cafe as Owner 1 → 404 ──
echo ""
echo "── TC-07-06: Update deleted cafe as Owner 1"
RESP=$(curl -s -w "\n__STATUS__%{http_code}" \
  -X PATCH \
  -H "Authorization: Bearer $OWNER1_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"district": "Hoan Kiem"}' \
  "${BASE_URL}/cafes/${CAFE_ID}")
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -n1 | sed 's/__STATUS__//')

assert_status_code 404 "$STATUS" "TC-07-06 update deleted cafe → 404"
assert_json_field "$BODY" '.status' 'error' "TC-07-06 body.status = error"

echo ""
print_summary "07-cafe-owner-crud"
export_counts
