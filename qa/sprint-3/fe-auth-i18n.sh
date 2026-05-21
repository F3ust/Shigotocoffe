#!/usr/bin/env bash
# fe-auth-i18n.sh — Validate Frontend Authentication Pages and Translation Catalog keys
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
source "${REPO_ROOT}/qa/be-crud-tests/lib/assert.sh"

echo "========================================================="
echo " Sprint 3 — FE Auth & i18n Verification"
echo "========================================================="

JA_JSON="${REPO_ROOT}/frontend/src/i18n/locales/ja.json"
VI_JSON="${REPO_ROOT}/frontend/src/i18n/locales/vi.json"

# Check JSON files exist
if [ -f "$JA_JSON" ] && [ -f "$VI_JSON" ]; then
  _pass "Translation files (ja.json and vi.json) exist"
else
  _fail "Translation files check" "Missing ja.json or vi.json"
fi

# Verify JSON validity
jq . "$JA_JSON" > /dev/null
assert_status_code 0 $? "ja.json is valid JSON"

jq . "$VI_JSON" > /dev/null
assert_status_code 0 $? "vi.json is valid JSON"

# Verify keys in ja.json
JA_CONTENT=$(cat "$JA_JSON")
assert_json_not_null "$JA_CONTENT" '.profile.title' "profile.title in ja.json"
assert_json_not_null "$JA_CONTENT" '.profile.edit' "profile.edit in ja.json"
assert_json_not_null "$JA_CONTENT" '.manage.title' "manage.title in ja.json"
assert_json_not_null "$JA_CONTENT" '.reviewForm.write_title' "reviewForm.write_title in ja.json"
assert_json_not_null "$JA_CONTENT" '.auth.role' "auth.role in ja.json"
assert_json_not_null "$JA_CONTENT" '.auth.role_owner' "auth.role_owner in ja.json"

# Verify keys in vi.json
VI_CONTENT=$(cat "$VI_JSON")
assert_json_not_null "$VI_CONTENT" '.profile.title' "profile.title in vi.json"
assert_json_not_null "$VI_CONTENT" '.profile.edit' "profile.edit in vi.json"
assert_json_not_null "$VI_CONTENT" '.manage.title' "manage.title in vi.json"
assert_json_not_null "$VI_CONTENT" '.reviewForm.write_title' "reviewForm.write_title in vi.json"
assert_json_not_null "$VI_CONTENT" '.auth.role' "auth.role in vi.json"
assert_json_not_null "$VI_CONTENT" '.auth.role_owner' "auth.role_owner in vi.json"

# Verify SignupPage role selector element presence
grep -q "role" "${REPO_ROOT}/frontend/src/pages/SignupPage.tsx"
assert_status_code 0 $? "SignupPage has role selector"

# Verify LoginPage references login_title translation
grep -q "login_title" "${REPO_ROOT}/frontend/src/pages/LoginPage.tsx"
assert_status_code 0 $? "LoginPage references login_title"

print_summary "fe-auth-i18n"
export_counts
[ "$FAIL_COUNT" -eq 0 ] || exit 1
