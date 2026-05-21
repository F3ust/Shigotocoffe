#!/usr/bin/env bash
# run-all.sh — Run all Sprint 3 QA verification suites
set -uo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export API_BASE="${API_BASE:-http://localhost:5000/api}"

for arg in "$@"; do
  case "$arg" in
    --base-url=*) export API_BASE="${arg#*=}" ;;
    --base-url) export API_BASE="$2"; shift ;;
  esac
done

echo "Sprint 3 QA — API_BASE=${API_BASE}"
TOTAL_PASS=0
TOTAL_FAIL=0

run_suite() {
  local script="$1"
  bash "$script" || {
    echo "Suite failed: $script" >&2
    exit 1
  }
  # shellcheck source=/dev/null
  source "${SCRIPT_DIR}/../be-crud-tests/lib/assert.sh"
  TOTAL_PASS=$((TOTAL_PASS + PASS_COUNT))
  TOTAL_FAIL=$((TOTAL_FAIL + FAIL_COUNT))
  PASS_COUNT=0
  FAIL_COUNT=0
}

run_suite "${SCRIPT_DIR}/fe-auth-i18n.sh"
run_suite "${SCRIPT_DIR}/fe-review-flow.sh"
run_suite "${SCRIPT_DIR}/fe-cafe-manage.sh"
run_suite "${SCRIPT_DIR}/fe-profile-logout.sh"

echo ""
echo "Sprint 3 total: ${TOTAL_PASS} passed, ${TOTAL_FAIL} failed"
[ "$TOTAL_FAIL" -eq 0 ] || exit 1
