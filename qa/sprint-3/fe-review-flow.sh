#!/usr/bin/env bash
# fe-review-flow.sh — Validate Frontend Review Submission UI integration and backend flow
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
source "${REPO_ROOT}/qa/be-crud-tests/lib/assert.sh"

echo "========================================================="
echo " Sprint 3 — FE Review Flow & Submission Verification"
echo "========================================================="

# Verify component files exist
[ -f "${REPO_ROOT}/frontend/src/components/cafe/ReviewForm.tsx" ] && _pass "ReviewForm.tsx exists" || _fail "ReviewForm.tsx" "Missing"
[ -f "${REPO_ROOT}/frontend/src/pages/CafeDetailPage.tsx" ] && _pass "CafeDetailPage.tsx exists" || _fail "CafeDetailPage.tsx" "Missing"

# Verify component contains key elements
grep -q "reviewForm" "${REPO_ROOT}/frontend/src/components/cafe/ReviewForm.tsx"
assert_status_code 0 $? "ReviewForm.tsx references reviewForm translation keys"

grep -q "createReview" "${REPO_ROOT}/frontend/src/pages/CafeDetailPage.tsx"
assert_status_code 0 $? "CafeDetailPage.tsx references createReview API method"

# API baseline integration check for review flow
echo ""
echo "── Running Review CRUD Integration Check via API..."

# Register a test user
EMAIL="revtest-$(date +%s)@test.local"
REG_RESP=$(curl -s -X POST "${BASE_URL}/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Reviewer User\",\"email\":\"${EMAIL}\",\"password\":\"test1234\",\"role\":\"user\"}")
TOKEN=$(echo "$REG_RESP" | jq -r '.data.token // empty')

if [ -z "$TOKEN" ]; then
  _fail "User Registration" "Could not register a test reviewer user"
  exit 1
fi
_pass "Successfully registered test user: ${EMAIL}"

# Get first cafe ID
LIST_RESP=$(curl -s "${BASE_URL}/cafes?limit=1")
CAFE_ID=$(echo "$LIST_RESP" | jq -r '.data[0]._id // empty')

if [ -z "$CAFE_ID" ]; then
  _fail "Retrieve Cafe" "No cafes available to review"
  exit 1
fi
echo "Target Cafe: $CAFE_ID"

# POST review
REV_RESP=$(curl -s -w "\n__STATUS__%{http_code}" -X POST "${BASE_URL}/cafes/${CAFE_ID}/reviews" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"rating":5,"comment":"Frontend review flow integration test comment!"}')
STATUS=$(echo "$REV_RESP" | tail -n1 | sed 's/__STATUS__//')
assert_status_code 201 "$STATUS" "Create review through API -> 201"

# Verify averageRating updated
CAFE_RESP=$(curl -s "${BASE_URL}/cafes/${CAFE_ID}")
RATING=$(echo "$CAFE_RESP" | jq -r '.data.averageRating')
COUNT=$(echo "$CAFE_RESP" | jq -r '.data.reviewCount')
echo "New Average Rating: $RATING ($COUNT reviews)"
assert_json_number_gte "$CAFE_RESP" '.data.reviewCount' 1 "Cafe has at least 1 review"

print_summary "fe-review-flow"
export_counts
[ "$FAIL_COUNT" -eq 0 ] || exit 1
