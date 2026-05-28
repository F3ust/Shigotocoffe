#!/usr/bin/env bash
# fe-profile-logout.sh — Validate Frontend Profile Page and Logout flow integration
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
source "${REPO_ROOT}/qa/be-crud-tests/lib/assert.sh"

echo "========================================================="
echo " Sprint 3 — FE Profile and Logout Flow Verification"
echo "========================================================="

# Verify component files exist
[ -f "${REPO_ROOT}/frontend/src/pages/ProfilePage.tsx" ] && _pass "ProfilePage.tsx exists" || _fail "ProfilePage.tsx" "Missing"
[ -f "${REPO_ROOT}/frontend/src/components/common/Header.tsx" ] && _pass "Header.tsx exists" || _fail "Header.tsx" "Missing"

# Verify profile page components and fields
grep -q "updateUserProfile" "${REPO_ROOT}/frontend/src/pages/ProfilePage.tsx"
assert_status_code 0 $? "ProfilePage.tsx references updateUserProfile API method"

# Verify header component updates
grep -q "menu-profile" "${REPO_ROOT}/frontend/src/components/common/Header.tsx"
assert_status_code 0 $? "Header.tsx renders profile menu item with id menu-profile"

grep -q "menu-manage" "${REPO_ROOT}/frontend/src/components/common/Header.tsx"
assert_status_code 0 $? "Header.tsx renders cafe management menu item with id menu-manage"

grep -q "logoutUserToServer" "${REPO_ROOT}/frontend/src/components/common/Header.tsx"
assert_status_code 0 $? "Header.tsx calls logoutUserToServer on logout"

# API integration check for Profile update and Logout
echo ""
echo "── Running Profile & Logout Integration Check via API..."

# Register a user
EMAIL="prof-$(date +%s)@test.local"
REG_RESP=$(curl -s -X POST "${BASE_URL}/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Original Name\",\"email\":\"${EMAIL}\",\"password\":\"test1234\",\"role\":\"user\"}")
TOKEN=$(echo "$REG_RESP" | jq -r '.data.token // empty')

if [ -z "$TOKEN" ]; then
  _fail "User Registration" "Could not register a test user"
  exit 1
fi
_pass "Successfully registered test user: ${EMAIL}"

# Get profile
GET_RESP=$(curl -s -w "\n__STATUS__%{http_code}" "${BASE_URL}/users/me" \
  -H "Authorization: Bearer ${TOKEN}")
STATUS=$(echo "$GET_RESP" | tail -n1 | sed 's/__STATUS__//')
BODY=$(echo "$GET_RESP" | sed '$d')

assert_status_code 200 "$STATUS" "GET /users/me → 200"
assert_json_field "$BODY" '.data.name' "Original Name" "Name field is correct in profile"

# Patch profile
PATCH_RESP=$(curl -s -w "\n__STATUS__%{http_code}" -X PATCH "${BASE_URL}/users/me" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Name"}')
STATUS=$(echo "$PATCH_RESP" | tail -n1 | sed 's/__STATUS__//')
BODY=$(echo "$PATCH_RESP" | sed '$d')

assert_status_code 200 "$STATUS" "PATCH /users/me → 200"
assert_json_field "$BODY" '.data.name' "Updated Name" "Name successfully updated to Updated Name"

# Call Logout
LOGOUT_RESP=$(curl -s -w "\n__STATUS__%{http_code}" -X POST "${BASE_URL}/auth/logout" \
  -H "Authorization: Bearer ${TOKEN}")
STATUS=$(echo "$LOGOUT_RESP" | tail -n1 | sed 's/__STATUS__//')
assert_status_code 200 "$STATUS" "POST /auth/logout → 200"

# Verify token is invalidated
INVALID_RESP=$(curl -s -w "\n__STATUS__%{http_code}" "${BASE_URL}/users/me" \
  -H "Authorization: Bearer ${TOKEN}")
STATUS=$(echo "$INVALID_RESP" | tail -n1 | sed 's/__STATUS__//')
assert_status_code 401 "$STATUS" "GET /users/me with logged out token → 401 Unauthorized"

print_summary "fe-profile-logout"
export_counts
[ "$FAIL_COUNT" -eq 0 ] || exit 1
