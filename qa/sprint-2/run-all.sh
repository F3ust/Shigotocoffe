#!/usr/bin/env bash
set -uo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export API_BASE="${API_BASE:-http://localhost:5000/api}"

for arg in "$@"; do
  case "$arg" in
    --base-url=*) export API_BASE="${arg#*=}" ;;
    --base-url) export API_BASE="$2"; shift ;;
  esac
done

echo "Sprint 2 QA — API_BASE=${API_BASE}"
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

run_suite "${SCRIPT_DIR}/00-preflight.sh"
run_suite "${SCRIPT_DIR}/01-cafe-detail.sh"
run_suite "${SCRIPT_DIR}/02-cafe-reviews.sh"
run_suite "${SCRIPT_DIR}/03-auth-register-login.sh"
run_suite "${SCRIPT_DIR}/04-auth-duplicate.sh"
run_suite "${SCRIPT_DIR}/05-cafe-filter-tags.sh"

echo ""
echo "Sprint 2 total: ${TOTAL_PASS} passed, ${TOTAL_FAIL} failed"
[ "$TOTAL_FAIL" -eq 0 ] || exit 1
