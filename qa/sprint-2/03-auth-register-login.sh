#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/../be-crud-tests/lib/assert.sh"

export API_BASE="${API_BASE:-http://localhost:5000/api}"
UNIQUE_EMAIL="sprint2-$(date +%s)@test.local"

echo "============================================"
echo " Sprint 2 — 03 auth register + login"
echo "============================================"

RESP=$(curl -s -w "\n__STATUS__%{http_code}" -X POST "${API_BASE}/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"QA User\",\"email\":\"${UNIQUE_EMAIL}\",\"password\":\"test1234\",\"role\":\"user\"}")
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -n1 | sed 's/__STATUS__//')

assert_status_code 201 "$STATUS" "POST /auth/register → 201"
assert_json_not_null "$BODY" '.data.token' "register returns token"

RESP=$(curl -s -w "\n__STATUS__%{http_code}" -X POST "${API_BASE}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@shigoto.local","password":"demo1234"}')
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -n1 | sed 's/__STATUS__//')

assert_status_code 200 "$STATUS" "POST /auth/login demo → 200"
assert_json_not_null "$BODY" '.data.token' "login returns token"

RESP=$(curl -s -w "\n__STATUS__%{http_code}" -X POST "${API_BASE}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@shigoto.local","password":"wrongpass"}')
STATUS=$(echo "$RESP" | tail -n1 | sed 's/__STATUS__//')
assert_status_code 401 "$STATUS" "wrong password → 401"

print_summary "03-auth-register-login"
export_counts
[ "$FAIL_COUNT" -eq 0 ] || exit 1
