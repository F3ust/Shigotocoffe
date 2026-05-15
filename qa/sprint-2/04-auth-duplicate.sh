#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/../be-crud-tests/lib/assert.sh"

export API_BASE="${API_BASE:-http://localhost:5000/api}"

echo "============================================"
echo " Sprint 2 — 04 duplicate register"
echo "============================================"

RESP=$(curl -s -w "\n__STATUS__%{http_code}" -X POST "${API_BASE}/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"name":"Dup","email":"demo@shigoto.local","password":"test1234"}')
STATUS=$(echo "$RESP" | tail -n1 | sed 's/__STATUS__//')
assert_status_code 409 "$STATUS" "duplicate email → 409"

print_summary "04-auth-duplicate"
export_counts
[ "$FAIL_COUNT" -eq 0 ] || exit 1
