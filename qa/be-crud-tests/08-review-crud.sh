#!/usr/bin/env bash
# Test suite: Review CRUD and average rating recalculation
# Tests: 9

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/lib/assert.sh"

echo "============================================"
echo " 08 — Review CRUD and Average Rating Recalculation"
echo "============================================"

# Register Owner
RANDOM_SUFFIX=$(date +%s)
REG_BODY_OWNER="{\"name\":\"Review Test Owner\",\"email\":\"owner_$RANDOM_SUFFIX@shigoto.local\",\"password\":\"password123\",\"role\":\"owner\"}"
REG_RESP_OWNER=$(curl -s -H "Content-Type: application/json" -d "$REG_BODY_OWNER" "${BASE_URL}/auth/register")
OWNER_TOKEN=$(echo "$REG_RESP_OWNER" | jq -r '.data.token // empty')

if [ -z "$OWNER_TOKEN" ]; then
  echo "✗ Failed to register owner: $REG_RESP_OWNER"
  exit 1
fi

# Create a Cafe for testing reviews
CAFE_FIXTURE="${SCRIPT_DIR}/fixtures/valid-cafe.json"
CAFE_RESP=$(curl -s -X POST \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "@${CAFE_FIXTURE}" \
  "${BASE_URL}/cafes")
CAFE_ID=$(echo "$CAFE_RESP" | jq -r '.data._id // empty')

if [ -z "$CAFE_ID" ]; then
  echo "✗ Failed to create cafe: $CAFE_RESP"
  exit 1
fi
echo "✓ Created Cafe for review testing: $CAFE_ID"

# Register User 1
REG_BODY_USER1="{\"name\":\"Review User 1\",\"email\":\"user1_$RANDOM_SUFFIX@shigoto.local\",\"password\":\"password123\",\"role\":\"user\"}"
REG_RESP_USER1=$(curl -s -H "Content-Type: application/json" -d "$REG_BODY_USER1" "${BASE_URL}/auth/register")
USER1_TOKEN=$(echo "$REG_RESP_USER1" | jq -r '.data.token // empty')
USER1_ID=$(echo "$REG_RESP_USER1" | jq -r '.data.user._id // empty')

if [ -z "$USER1_TOKEN" ]; then
  echo "✗ Failed to register user 1: $REG_RESP_USER1"
  exit 1
fi
echo "✓ Registered User 1 (ID: $USER1_ID)"

# Register User 2
REG_BODY_USER2="{\"name\":\"Review User 2\",\"email\":\"user2_$RANDOM_SUFFIX@shigoto.local\",\"password\":\"password123\",\"role\":\"user\"}"
REG_RESP_USER2=$(curl -s -H "Content-Type: application/json" -d "$REG_BODY_USER2" "${BASE_URL}/auth/register")
USER2_TOKEN=$(echo "$REG_RESP_USER2" | jq -r '.data.token // empty')
USER2_ID=$(echo "$REG_RESP_USER2" | jq -r '.data.user._id // empty')

if [ -z "$USER2_TOKEN" ]; then
  echo "✗ Failed to register user 2: $REG_RESP_USER2"
  exit 1
fi
echo "✓ Registered User 2 (ID: $USER2_ID)"

# ── TC-08-01: Create review (logged-in user) ──
echo ""
echo "── TC-08-01: Create review (User 1)"
REVIEW_BODY="{\"rating\":4,\"comment\":\"Great place to work!\"}"
RESP=$(curl -s -w "\n__STATUS__%{http_code}" \
  -X POST \
  -H "Authorization: Bearer $USER1_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$REVIEW_BODY" \
  "${BASE_URL}/cafes/${CAFE_ID}/reviews")
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -n1 | sed 's/__STATUS__//')

assert_status_code 201 "$STATUS" "TC-08-01 POST /api/cafes/:id/reviews → 201"
assert_json_field "$BODY" '.status' 'success' "TC-08-01 body.status = success"
assert_json_field "$BODY" '.data.rating' 4 "TC-08-01 review rating matches"
assert_json_field "$BODY" '.data.comment' "Great place to work!" "TC-08-01 review comment matches"

REVIEW_ID=$(echo "$BODY" | jq -r '.data._id // empty')
if [ -z "$REVIEW_ID" ]; then
  echo "✗ Could not extract created review ID"
  exit 1
fi

# ── TC-08-02: Duplicate review (same user + cafe) → 409 ──
echo ""
echo "── TC-08-02: Duplicate review (User 1 on same cafe)"
RESP=$(curl -s -w "\n__STATUS__%{http_code}" \
  -X POST \
  -H "Authorization: Bearer $USER1_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"rating\":5,\"comment\":\"Another comment\"}" \
  "${BASE_URL}/cafes/${CAFE_ID}/reviews")
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -n1 | sed 's/__STATUS__//')

assert_status_code 409 "$STATUS" "TC-08-02 duplicate review → 409"
assert_json_field "$BODY" '.status' 'error' "TC-08-02 body.status = error"

# ── TC-08-03: Create review (guest) → 401 ──
echo ""
echo "── TC-08-03: Create review (guest)"
RESP=$(curl -s -w "\n__STATUS__%{http_code}" \
  -X POST \
  -H "Content-Type: application/json" \
  -d "$REVIEW_BODY" \
  "${BASE_URL}/cafes/${CAFE_ID}/reviews")
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -n1 | sed 's/__STATUS__//')

assert_status_code 401 "$STATUS" "TC-08-03 guest review → 401"
assert_json_field "$BODY" '.status' 'error' "TC-08-03 body.status = error"

# ── TC-08-04: Edit review (owner of review) → 200 ──
echo ""
echo "── TC-08-04: Edit review (User 1)"
EDIT_BODY="{\"rating\":5,\"comment\":\"Actually, it is perfect!\"}"
RESP=$(curl -s -w "\n__STATUS__%{http_code}" \
  -X PATCH \
  -H "Authorization: Bearer $USER1_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$EDIT_BODY" \
  "${BASE_URL}/reviews/${REVIEW_ID}")
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -n1 | sed 's/__STATUS__//')

assert_status_code 200 "$STATUS" "TC-08-04 update review by owner → 200"
assert_json_field "$BODY" '.status' 'success' "TC-08-04 body.status = success"
assert_json_field "$BODY" '.data.rating' 5 "TC-08-04 updated rating is 5"
assert_json_field "$BODY" '.data.comment' "Actually, it is perfect!" "TC-08-04 updated comment matches"

# ── TC-08-05: Edit review (other user) → 403 ──
echo ""
echo "── TC-08-05: Edit review (User 2)"
RESP=$(curl -s -w "\n__STATUS__%{http_code}" \
  -X PATCH \
  -H "Authorization: Bearer $USER2_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"rating\":2}" \
  "${BASE_URL}/reviews/${REVIEW_ID}")
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -n1 | sed 's/__STATUS__//')

assert_status_code 403 "$STATUS" "TC-08-05 update review by non-owner → 403"
assert_json_field "$BODY" '.status' 'error' "TC-08-05 body.status = error"

# ── TC-08-06: Delete review (other user) → 403 ──
echo ""
echo "── TC-08-06: Delete review (User 2)"
RESP=$(curl -s -w "\n__STATUS__%{http_code}" \
  -X DELETE \
  -H "Authorization: Bearer $USER2_TOKEN" \
  "${BASE_URL}/reviews/${REVIEW_ID}")
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -n1 | sed 's/__STATUS__//')

assert_status_code 403 "$STATUS" "TC-08-06 delete review by non-owner → 403"
assert_json_field "$BODY" '.status' 'error' "TC-08-06 body.status = error"

# ── TC-08-07: Verify average rating updated after review creation/update ──
echo ""
echo "── TC-08-07: Verify average rating after edit"
CAFE_RESP2=$(curl -s "${BASE_URL}/cafes/${CAFE_ID}")
assert_json_field "$CAFE_RESP2" '.data.averageRating' 5 "TC-08-07 averageRating is 5"
assert_json_field "$CAFE_RESP2" '.data.reviewCount' 1 "TC-08-07 reviewCount is 1"

# ── TC-08-08: Delete review (owner of review) → 204 ──
echo ""
echo "── TC-08-08: Delete review (User 1)"
RESP=$(curl -s -w "\n__STATUS__%{http_code}" \
  -X DELETE \
  -H "Authorization: Bearer $USER1_TOKEN" \
  "${BASE_URL}/reviews/${REVIEW_ID}")
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -n1 | sed 's/__STATUS__//')

assert_status_code 204 "$STATUS" "TC-08-08 delete review by owner → 204"

# ── TC-08-09: Verify average rating updated after review deletion ──
echo ""
echo "── TC-08-09: Verify average rating after delete"
CAFE_RESP3=$(curl -s "${BASE_URL}/cafes/${CAFE_ID}")
assert_json_field "$CAFE_RESP3" '.data.averageRating' 0 "TC-08-09 averageRating is reset to 0"
assert_json_field "$CAFE_RESP3" '.data.reviewCount' 0 "TC-08-09 reviewCount is reset to 0"

echo ""
print_summary "08-review-crud"
export_counts
