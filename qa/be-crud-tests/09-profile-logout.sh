#!/usr/bin/env bash
# Test suite: User profile and logout endpoints
# Tests: 7

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/lib/assert.sh"

echo "============================================"
echo " 09 — User Profile and Logout Endpoints"
echo "============================================"

# Register User 1 dynamically
RANDOM_SUFFIX=$(date +%s)
USER1_NAME="Profile User 1"
USER1_EMAIL="puser1_$RANDOM_SUFFIX@shigoto.local"
REG_BODY_USER1="{\"name\":\"$USER1_NAME\",\"email\":\"$USER1_EMAIL\",\"password\":\"password123\",\"role\":\"user\"}"
REG_RESP_USER1=$(curl -s -H "Content-Type: application/json" -d "$REG_BODY_USER1" "${BASE_URL}/auth/register")
USER1_TOKEN=$(echo "$REG_RESP_USER1" | jq -r '.data.token // empty')

if [ -z "$USER1_TOKEN" ]; then
  echo "✗ Failed to register User 1: $REG_RESP_USER1"
  exit 1
fi
echo "✓ Registered User 1 (Email: $USER1_EMAIL)"

# Register User 2 dynamically (for email collision test)
USER2_EMAIL="puser2_$RANDOM_SUFFIX@shigoto.local"
REG_BODY_USER2="{\"name\":\"Profile User 2\",\"email\":\"$USER2_EMAIL\",\"password\":\"password123\",\"role\":\"user\"}"
REG_RESP_USER2=$(curl -s -H "Content-Type: application/json" -d "$REG_BODY_USER2" "${BASE_URL}/auth/register")
USER2_TOKEN=$(echo "$REG_RESP_USER2" | jq -r '.data.token // empty')

if [ -z "$USER2_TOKEN" ]; then
  echo "✗ Failed to register User 2: $REG_RESP_USER2"
  exit 1
fi
echo "✓ Registered User 2 (Email: $USER2_EMAIL)"

# ── TC-09-01: Get profile as guest → 401 ──
echo ""
echo "── TC-09-01: Get profile as guest"
RESP=$(curl -s -w "\n__STATUS__%{http_code}" \
  "${BASE_URL}/users/me")
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -n1 | sed 's/__STATUS__//')

assert_status_code 401 "$STATUS" "TC-09-01 GET /api/users/me (guest) → 401"
assert_json_field "$BODY" '.status' 'error' "TC-09-01 body.status = error"

# ── TC-09-02: Get profile as logged-in user → 200 ──
echo ""
echo "── TC-09-02: Get profile as logged-in user"
RESP=$(curl -s -w "\n__STATUS__%{http_code}" \
  -H "Authorization: Bearer $USER1_TOKEN" \
  "${BASE_URL}/users/me")
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -n1 | sed 's/__STATUS__//')

assert_status_code 200 "$STATUS" "TC-09-02 GET /api/users/me (User 1) → 200"
assert_json_field "$BODY" '.status' 'success' "TC-09-02 body.status = success"
assert_json_field "$BODY" '.data.name' "$USER1_NAME" "TC-09-02 name matches"
assert_json_field "$BODY" '.data.email' "$USER1_EMAIL" "TC-09-02 email matches"

# ── TC-09-03: Update profile name → 200 ──
echo ""
echo "── TC-09-03: Update profile name"
NEW_NAME="Updated Profile Name"
RESP=$(curl -s -w "\n__STATUS__%{http_code}" \
  -X PATCH \
  -H "Authorization: Bearer $USER1_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"$NEW_NAME\"}" \
  "${BASE_URL}/users/me")
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -n1 | sed 's/__STATUS__//')

assert_status_code 200 "$STATUS" "TC-09-03 PATCH /api/users/me (name change) → 200"
assert_json_field "$BODY" '.status' 'success' "TC-09-03 body.status = success"
assert_json_field "$BODY" '.data.name' "$NEW_NAME" "TC-09-03 updated name matches"
assert_json_field "$BODY" '.data.email' "$USER1_EMAIL" "TC-09-03 email is unchanged"

# ── TC-09-04: Update profile email → 200 ──
echo ""
echo "── TC-09-04: Update profile email"
NEW_EMAIL="new_email_$RANDOM_SUFFIX@shigoto.local"
RESP=$(curl -s -w "\n__STATUS__%{http_code}" \
  -X PATCH \
  -H "Authorization: Bearer $USER1_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$NEW_EMAIL\"}" \
  "${BASE_URL}/users/me")
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -n1 | sed 's/__STATUS__//')

assert_status_code 200 "$STATUS" "TC-09-04 PATCH /api/users/me (email change) → 200"
assert_json_field "$BODY" '.status' 'success' "TC-09-04 body.status = success"
assert_json_field "$BODY" '.data.name' "$NEW_NAME" "TC-09-04 name is unchanged"
assert_json_field "$BODY" '.data.email' "$NEW_EMAIL" "TC-09-04 updated email matches"

# ── TC-09-05: Update profile email to one already in use → 409 ──
echo ""
echo "── TC-09-05: Update profile email to existing one"
RESP=$(curl -s -w "\n__STATUS__%{http_code}" \
  -X PATCH \
  -H "Authorization: Bearer $USER1_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$USER2_EMAIL\"}" \
  "${BASE_URL}/users/me")
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -n1 | sed 's/__STATUS__//')

assert_status_code 409 "$STATUS" "TC-09-05 duplicate email update → 409"
assert_json_field "$BODY" '.status' 'error' "TC-09-05 body.status = error"

# ── TC-09-06: Logout as guest → 401 ──
echo ""
echo "── TC-09-06: Logout as guest"
RESP=$(curl -s -w "\n__STATUS__%{http_code}" \
  -X POST \
  "${BASE_URL}/auth/logout")
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -n1 | sed 's/__STATUS__//')

assert_status_code 401 "$STATUS" "TC-09-06 POST /api/auth/logout (guest) → 401"
assert_json_field "$BODY" '.status' 'error' "TC-09-06 body.status = error"

# ── TC-09-07: Logout as logged-in user → 200 ──
echo ""
echo "── TC-09-07: Logout as logged-in user"
RESP=$(curl -s -w "\n__STATUS__%{http_code}" \
  -X POST \
  -H "Authorization: Bearer $USER1_TOKEN" \
  "${BASE_URL}/auth/logout")
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -n1 | sed 's/__STATUS__//')

assert_status_code 200 "$STATUS" "TC-09-07 POST /api/auth/logout (User 1) → 200"
assert_json_field "$BODY" '.status' 'success' "TC-09-07 body.status = success"

echo ""
print_summary "09-profile-logout"
export_counts
