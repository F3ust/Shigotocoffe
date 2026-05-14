#!/usr/bin/env bash
# ============================================================
# run-search-uat.sh — UAT Search Flow Test Runner
# Sprint 1 · Task ID 14 · QA Tester B (Quốc Khánh)
#
# Coverage: UAT-S-01 through UAT-S-11 (API-testable scenarios)
# UAT-S-12 (UI click → detail page) is skipped; UI-only / known limitation.
#
# Requires: curl, jq
# Usage:
#   bash qa/uat-search-flow/run-search-uat.sh
#   API_BASE=http://localhost:5000/api bash qa/uat-search-flow/run-search-uat.sh
# ============================================================

set -euo pipefail

BASE_URL="${API_BASE:-http://localhost:5000/api}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Source assert helpers
# shellcheck source=../be-crud-tests/lib/assert.sh
source "$REPO_ROOT/qa/be-crud-tests/lib/assert.sh"
# shellcheck source=./lib/extra-assert.sh
source "$SCRIPT_DIR/lib/extra-assert.sh"

# ── Banner ──────────────────────────────────────────────────
echo "╔══════════════════════════════════════════════════════╗"
echo "║   仕事コーヒー — UAT Search Flow Test Runner         ║"
echo "║   Sprint 1 · Task ID 14 · QA Tester B (Quốc Khánh)  ║"
echo "╚══════════════════════════════════════════════════════╝"
echo "  API base: $BASE_URL"
echo ""

# ── Helper: run curl, capture body + status ─────────────────
# Usage: do_get <path_with_query> → sets $HTTP_STATUS and $BODY
do_get() {
  local path="$1"
  BODY=$(curl -s -o /tmp/uat_body.json -w "%{http_code}" "${BASE_URL}${path}")
  HTTP_STATUS="$BODY"
  BODY=$(cat /tmp/uat_body.json)
}

# ── UAT-S-01: Default list (all 12 cafes) ───────────────────
echo "── UAT-S-01: Default cafe list (12 cafes, default pagination)"
do_get "/cafes"
assert_status_code 200 "$HTTP_STATUS" "[UAT-S-01] GET /cafes → HTTP 200"
assert_json_field "$BODY" '.status' '"success"' "[UAT-S-01] response.status = success"
assert_json_array_not_empty "$BODY" '.data' "[UAT-S-01] data array is non-empty"
assert_json_not_null "$BODY" '.pagination.total' "[UAT-S-01] pagination.total present"
assert_json_field "$BODY" '.pagination.page' '"1"' "[UAT-S-01] pagination.page = 1"
assert_json_field "$BODY" '.pagination.limit' '"12"' "[UAT-S-01] pagination.limit = 12 (default)"
assert_json_array_length "$BODY" '.data' "12" "[UAT-S-01] 12 cafes returned (full seed)"
assert_json_field "$BODY" '.pagination.total' '"12"' "[UAT-S-01] pagination.total = 12"
echo ""

# ── UAT-S-02: JP keyword search "コーヒー" ──────────────────
echo "── UAT-S-02: JP keyword search 'コーヒー'"
do_get "/cafes?q=$(python3 -c 'import urllib.parse; print(urllib.parse.quote("コーヒー"))' 2>/dev/null || echo '%E3%82%B3%E3%83%BC%E3%83%92%E3%83%BC')"
assert_status_code 200 "$HTTP_STATUS" "[UAT-S-02] GET /cafes?q=コーヒー → HTTP 200"
assert_json_field "$BODY" '.status' '"success"' "[UAT-S-02] response.status = success"
assert_json_array_not_empty "$BODY" '.data' "[UAT-S-02] At least 1 match found"
assert_text_match_any "$BODY" '.data' "コーヒー" "[UAT-S-02] All results contain 'コーヒー' in a text field"
echo ""

# ── UAT-S-03: VI keyword search "yên tĩnh" ──────────────────
echo "── UAT-S-03: VI keyword search 'yên tĩnh'"
do_get "/cafes?q=y%C3%AAn+t%C4%A9nh"
assert_status_code 200 "$HTTP_STATUS" "[UAT-S-03] GET /cafes?q=yên+tĩnh → HTTP 200"
assert_json_field "$BODY" '.status' '"success"' "[UAT-S-03] response.status = success"
assert_json_array_not_empty "$BODY" '.data' "[UAT-S-03] At least 1 match found"
assert_text_match_any "$BODY" '.data' "yên tĩnh" "[UAT-S-03] All results contain 'yên tĩnh' in a text field"
echo ""

# ── UAT-S-04: No-match keyword → empty state ────────────────
echo "── UAT-S-04: No-match keyword → empty result"
do_get "/cafes?q=xyz_nomatch_9999_uat"
assert_status_code 200 "$HTTP_STATUS" "[UAT-S-04] GET /cafes?q=xyz_nomatch → HTTP 200 (not 404)"
assert_json_field "$BODY" '.status' '"success"' "[UAT-S-04] response.status = success"
assert_json_array_length "$BODY" '.data' "0" "[UAT-S-04] data array is empty"
assert_json_field "$BODY" '.pagination.total' '"0"' "[UAT-S-04] pagination.total = 0"
echo ""

# ── UAT-S-05: District filter "Ba Đình" ─────────────────────
echo "── UAT-S-05: District filter 'Ba Đình'"
do_get "/cafes?district=Ba+%C4%90%C3%ACnh"
assert_status_code 200 "$HTTP_STATUS" "[UAT-S-05] GET /cafes?district=Ba+Đình → HTTP 200"
assert_json_field "$BODY" '.status' '"success"' "[UAT-S-05] response.status = success"
assert_json_array_not_empty "$BODY" '.data' "[UAT-S-05] At least 1 result in Ba Đình"
assert_json_array_length "$BODY" '.data' "4" "[UAT-S-05] Exactly 4 cafes in Ba Đình"
assert_all_field_equal "$BODY" '.data' '.district' 'Ba Đình' "[UAT-S-05] All results have district='Ba Đình'"
echo ""

# ── UAT-S-06: minRating=4 filter ───────────────────────────
echo "── UAT-S-06: minRating=4 filter"
do_get "/cafes?minRating=4"
assert_status_code 200 "$HTTP_STATUS" "[UAT-S-06] GET /cafes?minRating=4 → HTTP 200"
assert_json_field "$BODY" '.status' '"success"' "[UAT-S-06] response.status = success"
assert_json_array_not_empty "$BODY" '.data' "[UAT-S-06] At least 1 result with rating ≥ 4"
assert_json_array_length "$BODY" '.data' "11" "[UAT-S-06] 11 cafes have averageRating ≥ 4"
assert_all_field_gte "$BODY" '.data' '.averageRating' "4" "[UAT-S-06] All results have averageRating ≥ 4"
echo ""

# ── UAT-S-07: Single tag filter "wifi" ─────────────────────
echo "── UAT-S-07: Single tag filter tags=wifi"
do_get "/cafes?tags=wifi"
assert_status_code 200 "$HTTP_STATUS" "[UAT-S-07] GET /cafes?tags=wifi → HTTP 200"
assert_json_field "$BODY" '.status' '"success"' "[UAT-S-07] response.status = success"
assert_json_array_length "$BODY" '.data' "12" "[UAT-S-07] All 12 cafes have wifi"
assert_all_contain_tag "$BODY" '.data' 'wifi' "[UAT-S-07] All results contain hashtag 'wifi'"
echo ""

# ── UAT-S-08: AND-match tags=wifi,outlets ──────────────────
echo "── UAT-S-08: AND-match tags=wifi,outlets"
do_get "/cafes?tags=wifi%2Coutlets"
assert_status_code 200 "$HTTP_STATUS" "[UAT-S-08] GET /cafes?tags=wifi,outlets → HTTP 200"
assert_json_field "$BODY" '.status' '"success"' "[UAT-S-08] response.status = success"
assert_json_array_length "$BODY" '.data' "7" "[UAT-S-08] 7 cafes have both wifi AND outlets"
assert_all_contain_tag "$BODY" '.data' 'wifi' "[UAT-S-08] All results contain 'wifi'"
assert_all_contain_tag "$BODY" '.data' 'outlets' "[UAT-S-08] All results contain 'outlets' (AND-match)"
echo ""

# ── UAT-S-09: Pagination page=2&limit=5 ────────────────────
echo "── UAT-S-09: Pagination page=2&limit=5"
do_get "/cafes?page=2&limit=5"
assert_status_code 200 "$HTTP_STATUS" "[UAT-S-09] GET /cafes?page=2&limit=5 → HTTP 200"
assert_json_field "$BODY" '.status' '"success"' "[UAT-S-09] response.status = success"
assert_json_field "$BODY" '.pagination.page' '"2"' "[UAT-S-09] pagination.page = 2"
assert_json_field "$BODY" '.pagination.limit' '"5"' "[UAT-S-09] pagination.limit = 5"
assert_json_array_length "$BODY" '.data' "5" "[UAT-S-09] page 2 returns 5 items"
assert_json_field "$BODY" '.pagination.total' '"12"' "[UAT-S-09] pagination.total = 12"
assert_json_field "$BODY" '.pagination.totalPages' '"3"' "[UAT-S-09] pagination.totalPages = 3 (ceil(12/5))"
echo ""

# ── UAT-S-10: Compound search (q + district + tags) ────────
echo "── UAT-S-10: Compound search q=workspace&district=Ba+Đình&tags=wifi"
do_get "/cafes?q=workspace&district=Ba+%C4%90%C3%ACnh&tags=wifi"
assert_status_code 200 "$HTTP_STATUS" "[UAT-S-10] GET compound search → HTTP 200"
assert_json_field "$BODY" '.status' '"success"' "[UAT-S-10] response.status = success"
assert_json_array_not_empty "$BODY" '.data' "[UAT-S-10] At least 1 result matching all conditions"
assert_all_field_equal "$BODY" '.data' '.district' 'Ba Đình' "[UAT-S-10] All results have district='Ba Đình'"
assert_all_contain_tag "$BODY" '.data' 'wifi' "[UAT-S-10] All results have 'wifi' tag"
assert_text_match_any "$BODY" '.data' "workspace" "[UAT-S-10] All results contain 'workspace' in a text field"
echo ""

# ── UAT-S-11: Sort order (averageRating desc) ──────────────
echo "── UAT-S-11: Sort order — averageRating descending"
do_get "/cafes?limit=12"
assert_status_code 200 "$HTTP_STATUS" "[UAT-S-11] GET /cafes?limit=12 → HTTP 200"
assert_sorted_desc "$BODY" '.data' '.averageRating' "[UAT-S-11] Results sorted by averageRating descending"
# Verify top item is highest-rated cafe (The Workspace, 4.8)
assert_json_field "$BODY" '.data[0].averageRating' '"4.8"' "[UAT-S-11] First item has averageRating=4.8 (highest)"
echo ""

# ── UAT-S-12: SKIPPED ──────────────────────────────────────
echo "── UAT-S-12: UI — click card → detail page"
echo "   [SKIPPED] Known limitation per Sprint 1 scope."
echo "   Detail page (Screen 4) not implemented in Sprint 1."
echo "   Manual UI test required; see scenarios.md UAT-S-12."
echo ""

# ── Summary ─────────────────────────────────────────────────
print_summary "UAT Search Flow (Sprint 1 · Task ID 14)"
