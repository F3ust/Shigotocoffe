#!/usr/bin/env bash
# fe-cafe-manage.sh — Validate Frontend Cafe Management Owner CRUD integration
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
source "${REPO_ROOT}/qa/be-crud-tests/lib/assert.sh"

echo "========================================================="
echo " Sprint 3 — FE Cafe Management & Owner Flow Verification"
echo "========================================================="

# Verify component files exist
[ -f "${REPO_ROOT}/frontend/src/components/cafe/CafeForm.tsx" ] && _pass "CafeForm.tsx exists" || _fail "CafeForm.tsx" "Missing"
[ -f "${REPO_ROOT}/frontend/src/pages/CafeManagePage.tsx" ] && _pass "CafeManagePage.tsx exists" || _fail "CafeManagePage.tsx" "Missing"

# Verify component contains key elements
grep -q "nameJa" "${REPO_ROOT}/frontend/src/components/cafe/CafeForm.tsx"
assert_status_code 0 $? "CafeForm.tsx supports bilingual names (ja)"
grep -q "nameVi" "${REPO_ROOT}/frontend/src/components/cafe/CafeForm.tsx"
assert_status_code 0 $? "CafeForm.tsx supports bilingual names (vi)"
grep -q "menu" "${REPO_ROOT}/frontend/src/components/cafe/CafeForm.tsx"
assert_status_code 0 $? "CafeForm.tsx contains menu section"

# Verify route registration
grep -q "/manage" "${REPO_ROOT}/frontend/src/App.tsx"
assert_status_code 0 $? "App.tsx registers /manage route"

# API baseline integration check for Owner CRUD
echo ""
echo "── Running Owner Cafe CRUD Integration Check via API..."

# Register an owner
EMAIL="owner-$(date +%s)@test.local"
REG_RESP=$(curl -s -X POST "${BASE_URL}/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Cafe Owner\",\"email\":\"${EMAIL}\",\"password\":\"test1234\",\"role\":\"owner\"}")
TOKEN=$(echo "$REG_RESP" | jq -r '.data.token // empty')

if [ -z "$TOKEN" ]; then
  _fail "Owner Registration" "Could not register a test owner user"
  exit 1
fi
_pass "Successfully registered test owner: ${EMAIL}"

# POST new cafe
CREATE_RESP=$(curl -s -w "\n__STATUS__%{http_code}" -X POST "${BASE_URL}/cafes" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": {"ja": "テストカフェ", "vi": "Cafe Test"},
    "description": {"ja": "テスト説明", "vi": "Mo ta test"},
    "address": {"ja": "ハノイ", "vi": "Ha Noi"},
    "district": "Ba Dinh",
    "openingHours": {"open": "08:00", "close": "22:00"},
    "location": {"type": "Point", "coordinates": [105.85, 21.03]},
    "hashtags": ["wifi", "quiet"],
    "menu": [{"name": "Coffee", "price": 30000}]
  }')
STATUS=$(echo "$CREATE_RESP" | tail -n1 | sed 's/__STATUS__//')
BODY=$(echo "$CREATE_RESP" | sed '$d')

assert_status_code 201 "$STATUS" "Owner POST /cafes → 201"
assert_json_field "$BODY" '.data.name.ja' "テストカフェ" "Cafe name (ja) correct"
assert_json_field "$BODY" '.data.district' "Ba Dinh" "Cafe district correct"

CAFE_ID=$(echo "$BODY" | jq -r '.data._id // empty')
OWNER_ID=$(echo "$BODY" | jq -r '.data.owner // empty')
assert_json_not_null "$BODY" '.data.owner' "Cafe has owner field assigned"

# Clean up
if [ -n "$CAFE_ID" ]; then
  DEL_RESP=$(curl -s -w "\n__STATUS__%{http_code}" -X DELETE "${BASE_URL}/cafes/${CAFE_ID}" \
    -H "Authorization: Bearer ${TOKEN}")
  STATUS=$(echo "$DEL_RESP" | tail -n1 | sed 's/__STATUS__//')
  assert_status_code 204 "$STATUS" "Owner DELETE /cafes/:id → 204"
fi

print_summary "fe-cafe-manage"
export_counts
[ "$FAIL_COUNT" -eq 0 ] || exit 1
