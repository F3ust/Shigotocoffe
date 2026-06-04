#!/usr/bin/env bash
# Test suite: Sprint 4 Backend Features (Upload, Owner Replies, Bookmarks)
# Tests: 8

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Source the assertion library from the exist be-crud-tests
source "${SCRIPT_DIR}/../be-crud-tests/lib/assert.sh"

echo "============================================"
# Clean up target description to avoid non-ASCII / complex text formatting in headers
echo " 10 - Sprint 4 Backend Integration Tests"
echo "============================================"

# Prepare a mock image file for the upload test
MOCK_IMAGE="${SCRIPT_DIR}/mock-image.png"
echo "This is a mock image file for QA testing" > "$MOCK_IMAGE"

# Clean up mock file when script exits
trap 'rm -f "$MOCK_IMAGE"' EXIT

# Generate unique accounts
RANDOM_SUFFIX=$(date +%s)
REG_BODY_OWNER="{\"name\":\"S4 Owner\",\"email\":\"owner_$RANDOM_SUFFIX@shigoto.local\",\"password\":\"password123\",\"role\":\"owner\"}"
REG_RESP_OWNER=$(curl -s -H "Content-Type: application/json" -d "$REG_BODY_OWNER" "${BASE_URL}/auth/register")
OWNER_TOKEN=$(echo "$REG_RESP_OWNER" | jq -r '.data.token // empty')

if [ -z "$OWNER_TOKEN" ]; then
  echo "✗ Failed to register owner: $REG_RESP_OWNER"
  exit 1
fi
echo "✓ Registered S4 Owner"

REG_BODY_USER1="{\"name\":\"S4 User 1\",\"email\":\"user1_$RANDOM_SUFFIX@shigoto.local\",\"password\":\"password123\",\"role\":\"user\"}"
REG_RESP_USER1=$(curl -s -H "Content-Type: application/json" -d "$REG_BODY_USER1" "${BASE_URL}/auth/register")
USER1_TOKEN=$(echo "$REG_RESP_USER1" | jq -r '.data.token // empty')

if [ -z "$USER1_TOKEN" ]; then
  echo "✗ Failed to register user 1: $REG_RESP_USER1"
  exit 1
fi
echo "✓ Registered S4 User 1"

REG_BODY_USER2="{\"name\":\"S4 User 2\",\"email\":\"user2_$RANDOM_SUFFIX@shigoto.local\",\"password\":\"password123\",\"role\":\"user\"}"
REG_RESP_USER2=$(curl -s -H "Content-Type: application/json" -d "$REG_BODY_USER2" "${BASE_URL}/auth/register")
USER2_TOKEN=$(echo "$REG_RESP_USER2" | jq -r '.data.token // empty')

if [ -z "$USER2_TOKEN" ]; then
  echo "✗ Failed to register user 2: $REG_RESP_USER2"
  exit 1
fi
echo "✓ Registered S4 User 2"

# ── TC-S4-01: Guest file upload -> 401 ──
echo ""
echo "── TC-S4-01: Guest file upload -> 401"
RESP=$(curl -s -w "\n__STATUS__%{http_code}" \
  -X POST \
  -F "image=@${MOCK_IMAGE}" \
  "${BASE_URL}/upload")
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -n1 | sed 's/__STATUS__//')
assert_status_code 401 "$STATUS" "TC-S4-01: Guest file upload rejected"

# ── TC-S4-02: Authenticated file upload -> 200 ──
echo ""
echo "── TC-S4-02: Authenticated file upload -> 200"
RESP=$(curl -s -w "\n__STATUS__%{http_code}" \
  -X POST \
  -H "Authorization: Bearer $USER1_TOKEN" \
  -F "image=@${MOCK_IMAGE}" \
  "${BASE_URL}/upload")
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -n1 | sed 's/__STATUS__//')
assert_status_code 200 "$STATUS" "TC-S4-02: Upload succeeds"
assert_json_field "$BODY" '.status' 'success' "TC-S4-02: status is success"
assert_json_not_null "$BODY" '.data.url' "TC-S4-02: data.url is present"

# ── TC-S4-03: Create a Cafe ──
echo ""
echo "── Create a Cafe"
CAFE_FIXTURE_BODY="{\"name\":{\"ja\":\"S4 Test Cafe\",\"vi\":\"S4 Test Cafe\"},\"description\":{\"ja\":\"QA S4\",\"vi\":\"QA S4\"},\"address\":{\"ja\":\"1 QA St\",\"vi\":\"1 QA St\"},\"district\":\"Hoàn Kiếm\",\"openingHours\":{\"open\":\"08:00\",\"close\":\"22:00\"},\"isOpen\":true,\"hashtags\":[\"wifi\"]}"
CAFE_RESP=$(curl -s -X POST \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$CAFE_FIXTURE_BODY" \
  "${BASE_URL}/cafes")
CAFE_ID=$(echo "$CAFE_RESP" | jq -r '.data._id // empty')
if [ -z "$CAFE_ID" ]; then
  echo "✗ Failed to create cafe: $CAFE_RESP"
  exit 1
fi
echo "✓ Created S4 Test Cafe (ID: $CAFE_ID)"

# ── TC-S4-04: Initial Bookmarks -> Empty Array ──
echo ""
echo "── TC-S4-04: Initial Bookmarks -> Empty Array"
RESP=$(curl -s -w "\n__STATUS__%{http_code}" \
  -H "Authorization: Bearer $USER1_TOKEN" \
  "${BASE_URL}/users/favorites")
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -n1 | sed 's/__STATUS__//')
assert_status_code 200 "$STATUS" "TC-S4-04: Fetch bookmarks succeeds"
assert_json_field "$BODY" '.status' 'success' "TC-S4-04: status is success"
FAV_LENGTH=$(echo "$BODY" | jq -r '.data | length')
if [ "$FAV_LENGTH" -eq 0 ]; then
  _pass "TC-S4-04: favorites is empty initially"
else
  _fail "TC-S4-04: favorites was not empty initially"
fi

# ── TC-S4-05: Add Bookmark -> 200 ──
echo ""
echo "── TC-S4-05: Add Bookmark -> 200"
RESP=$(curl -s -w "\n__STATUS__%{http_code}" \
  -X POST \
  -H "Authorization: Bearer $USER1_TOKEN" \
  "${BASE_URL}/users/favorites/${CAFE_ID}")
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -n1 | sed 's/__STATUS__//')
assert_status_code 200 "$STATUS" "TC-S4-05: Add favorite succeeds"
assert_json_field "$BODY" '.status' 'success' "TC-S4-05: status is success"

# Verify bookmark is populated in subsequent get
RESP=$(curl -s -H "Authorization: Bearer $USER1_TOKEN" "${BASE_URL}/users/favorites")
FAV_CAFE_ID=$(echo "$RESP" | jq -r '.data[0]._id // empty')
if [ "$FAV_CAFE_ID" = "$CAFE_ID" ]; then
  _pass "TC-S4-05: favorited cafe is returned and populated"
else
  _fail "TC-S4-05: favorited cafe mismatch or not returned"
fi

# ── TC-S4-06: Remove Bookmark -> 200 ──
echo ""
echo "── TC-S4-06: Remove Bookmark -> 200"
RESP=$(curl -s -w "\n__STATUS__%{http_code}" \
  -X DELETE \
  -H "Authorization: Bearer $USER1_TOKEN" \
  "${BASE_URL}/users/favorites/${CAFE_ID}")
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -n1 | sed 's/__STATUS__//')
assert_status_code 200 "$STATUS" "TC-S4-06: Remove favorite succeeds"

RESP=$(curl -s -H "Authorization: Bearer $USER1_TOKEN" "${BASE_URL}/users/favorites")
FAV_LENGTH=$(echo "$RESP" | jq -r '.data | length')
if [ "$FAV_LENGTH" -eq 0 ]; then
  _pass "TC-S4-06: bookmark removed successfully"
else
  _fail "TC-S4-06: bookmark was not removed"
fi

# ── TC-S4-07: Create review and reply (non-owner) -> 403 ──
echo ""
echo "── TC-S4-07: Owner replies authorization checks"
# Create a review as User 1
REVIEW_RESP=$(curl -s -X POST \
  -H "Authorization: Bearer $USER1_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"rating\":5,\"comment\":\"Beautiful workspace!\"}" \
  "${BASE_URL}/cafes/${CAFE_ID}/reviews")
REVIEW_ID=$(echo "$REVIEW_RESP" | jq -r '.data._id // empty')
if [ -z "$REVIEW_ID" ]; then
  echo "✗ Failed to create review: $REVIEW_RESP"
  exit 1
fi
echo "✓ Created review (ID: $REVIEW_ID)"

# User 2 attempts to reply -> 403 Forbidden
RESP=$(curl -s -w "\n__STATUS__%{http_code}" \
  -X POST \
  -H "Authorization: Bearer $USER2_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"comment\":\"I agree!\"}" \
  "${BASE_URL}/reviews/${REVIEW_ID}/reply")
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -n1 | sed 's/__STATUS__//')
assert_status_code 403 "$STATUS" "TC-S4-07: Non-owner replying gets 403 Forbidden"
assert_json_field "$BODY" '.status' 'error' "TC-S4-07: status is error"

# ── TC-S4-08: Cafe owner replies -> 200 ──
echo ""
echo "── TC-S4-08: Owner replies successfully -> 200"
RESP=$(curl -s -w "\n__STATUS__%{http_code}" \
  -X POST \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"comment\":\"Thank you for coming!\"}" \
  "${BASE_URL}/reviews/${REVIEW_ID}/reply")
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -n1 | sed 's/__STATUS__//')
assert_status_code 200 "$STATUS" "TC-S4-08: Owner reply succeeds"
assert_json_field "$BODY" '.status' 'success' "TC-S4-08: status is success"
assert_json_field "$BODY" '.data.reply.comment' "Thank you for coming!" "TC-S4-08: Reply comment stored matches"

print_summary "Sprint 4 Backend QA Suite"
export_counts
