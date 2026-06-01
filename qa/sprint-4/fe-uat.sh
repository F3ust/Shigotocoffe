#!/usr/bin/env bash
# fe-uat.sh — Validate Frontend Sprint 4 Features, Layouts, and Translations
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
source "${REPO_ROOT}/qa/be-crud-tests/lib/assert.sh"

echo "========================================================="
echo " Sprint 4 — FE Features & UAT Verification"
echo "========================================================="

JA_JSON="${REPO_ROOT}/frontend/src/i18n/locales/ja.json"
VI_JSON="${REPO_ROOT}/frontend/src/i18n/locales/vi.json"

# Check JSON files exist
if [ -f "$JA_JSON" ] && [ -f "$VI_JSON" ]; then
  _pass "Translation files exist"
else
  _fail "Translation files check" "Missing ja.json or vi.json"
fi

# Verify JSON validity
jq . "$JA_JSON" > /dev/null
assert_status_code 0 $? "ja.json is valid JSON"

jq . "$VI_JSON" > /dev/null
assert_status_code 0 $? "vi.json is valid JSON"

# Verify Sprint 4 keys in ja.json
JA_CONTENT=$(cat "$JA_JSON")
assert_json_not_null "$JA_CONTENT" '.sprint4.edit_visually' "sprint4.edit_visually in ja.json"
assert_json_not_null "$JA_CONTENT" '.sprint4.reply_badge' "sprint4.reply_badge in ja.json"
assert_json_not_null "$JA_CONTENT" '.sprint4.favorites_title' "sprint4.favorites_title in ja.json"
assert_json_not_null "$JA_CONTENT" '.sprint4.upload_failed' "sprint4.upload_failed in ja.json"
assert_json_not_null "$JA_CONTENT" '.nav.favorites' "nav.favorites in ja.json"

# Verify Sprint 4 keys in vi.json
VI_CONTENT=$(cat "$VI_JSON")
assert_json_not_null "$VI_CONTENT" '.sprint4.edit_visually' "sprint4.edit_visually in vi.json"
assert_json_not_null "$VI_CONTENT" '.sprint4.reply_badge' "sprint4.reply_badge in vi.json"
assert_json_not_null "$VI_CONTENT" '.sprint4.favorites_title' "sprint4.favorites_title in vi.json"
assert_json_not_null "$VI_CONTENT" '.sprint4.upload_failed' "sprint4.upload_failed in vi.json"
assert_json_not_null "$VI_CONTENT" '.nav.favorites' "nav.favorites in vi.json"

# Verify HomePage has owner redirect
grep -q "owner" "${REPO_ROOT}/frontend/src/pages/HomePage.tsx"
assert_status_code 0 $? "HomePage has owner redirect check"

# Verify CafeDetailPage imports replyToReview
grep -q "replyToReview" "${REPO_ROOT}/frontend/src/pages/CafeDetailPage.tsx"
assert_status_code 0 $? "CafeDetailPage imports replyToReview API"

# Verify CafeDetailLayout has edit visually and bookmark heart button
grep -q "edit_visually" "${REPO_ROOT}/frontend/src/components/cafe/CafeDetailLayout.tsx"
assert_status_code 0 $? "CafeDetailLayout has edit_visually button"
grep -q "bookmark-" "${REPO_ROOT}/frontend/src/components/cafe/CafeDetailLayout.tsx"
assert_status_code 0 $? "CafeDetailLayout has bookmark heart toggle button"

# Verify ReviewSidebar renders owner replies
grep -q "reply_badge" "${REPO_ROOT}/frontend/src/components/cafe/ReviewSidebar.tsx"
assert_status_code 0 $? "ReviewSidebar renders owner reply_badge"

# Verify CafeForm has local file upload with uploadImage
grep -q "uploadImage" "${REPO_ROOT}/frontend/src/components/cafe/CafeForm.tsx"
assert_status_code 0 $? "CafeForm integrates uploadImage API for local files"

# Verify FavoritesPage exists
if [ -f "${REPO_ROOT}/frontend/src/pages/FavoritesPage.tsx" ]; then
  _pass "FavoritesPage page component exists"
else
  _fail "FavoritesPage exists check" "Missing FavoritesPage.tsx"
fi

print_summary "fe-uat"
export_counts
[ "$FAIL_COUNT" -eq 0 ] || exit 1
