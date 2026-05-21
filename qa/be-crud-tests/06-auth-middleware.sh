#!/usr/bin/env bash
# Test suite: Auth Middleware and ForbiddenError
# Tests: 4

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/lib/assert.sh"

echo "============================================"
echo " 06 — Auth Middleware and ForbiddenError"
echo "============================================"

# ── TC-06-01: Access protected route with no token → 401 ──
echo ""
echo "── TC-06-01: No token"
RESP=$(curl -s -w "\n__STATUS__%{http_code}" \
  "${BASE_URL}/users/me")
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -n1 | sed 's/__STATUS__//')

assert_status_code 401 "$STATUS" "TC-06-01 GET /api/users/me with no token → 401"
assert_json_field "$BODY" '.status' 'error' "TC-06-01 body.status = error"

# ── TC-06-02: Access protected route with invalid token → 401 ──
echo ""
echo "── TC-06-02: Invalid token"
RESP=$(curl -s -w "\n__STATUS__%{http_code}" \
  -H "Authorization: Bearer invalid_token_xyz" \
  "${BASE_URL}/users/me")
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -n1 | sed 's/__STATUS__//')

assert_status_code 401 "$STATUS" "TC-06-02 GET /api/users/me with invalid token → 401"
assert_json_field "$BODY" '.status' 'error' "TC-06-02 body.status = error"

# ── TC-06-03: Access protected route with malformed Authorization header → 401 ──
echo ""
echo "── TC-06-03: Malformed Authorization header"
RESP=$(curl -s -w "\n__STATUS__%{http_code}" \
  -H "Authorization: NotBearer token_xyz" \
  "${BASE_URL}/users/me")
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -n1 | sed 's/__STATUS__//')

assert_status_code 401 "$STATUS" "TC-06-03 GET /api/users/me with malformed header → 401"
assert_json_field "$BODY" '.status' 'error' "TC-06-03 body.status = error"

# ── TC-06-04: Access protected route with valid token → 200 ──
echo ""
echo "── TC-06-04: Valid token"

# Register a new user dynamically
RANDOM_SUFFIX=$(date +%s)
REGISTER_BODY="{\"name\":\"QA User $RANDOM_SUFFIX\",\"email\":\"qa_user_$RANDOM_SUFFIX@shigoto.local\",\"password\":\"password123\",\"role\":\"user\"}"
REG_RESP=$(curl -s -H "Content-Type: application/json" -d "$REGISTER_BODY" "${BASE_URL}/auth/register")
TOKEN=$(echo "$REG_RESP" | jq -r '.data.token // empty')

if [ -z "$TOKEN" ]; then
  _fail "TC-06-04 register test user to get token" "Could not obtain token: $REG_RESP"
else
  _pass "TC-06-04 registered test user and obtained token"

  RESP=$(curl -s -w "\n__STATUS__%{http_code}" \
    -H "Authorization: Bearer $TOKEN" \
    "${BASE_URL}/users/me")
  BODY=$(echo "$RESP" | sed '$d')
  STATUS=$(echo "$RESP" | tail -n1 | sed 's/__STATUS__//')

  assert_status_code 200 "$STATUS" "TC-06-04 GET /api/users/me with valid token → 200"
  assert_json_field "$BODY" '.status' 'success' "TC-06-04 body.status = success"
  assert_json_field "$BODY" '.data.email' "qa_user_$RANDOM_SUFFIX@shigoto.local" "TC-06-04 returns correct user details"
fi

echo ""
print_summary "06-auth-middleware"
export_counts
