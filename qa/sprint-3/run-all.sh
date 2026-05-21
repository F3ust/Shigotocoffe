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
  local output
  output=$(bash "$script" 2>&1)
  local exit_code=$?
  echo "$output"
  if [ $exit_code -ne 0 ]; then
    echo "Suite failed: $script" >&2
    exit $exit_code
  fi

  local counts_line
  counts_line=$(echo "$output" | grep "^PASS:" | tail -1 || true)
  if [ -n "$counts_line" ]; then
    local p f
    # Use standard grep/sed for portability across different environments
    p=$(echo "$counts_line" | sed -E 's/.*PASS:([0-9]+).*/\1/' || echo 0)
    f=$(echo "$counts_line" | sed -E 's/.*FAIL:([0-9]+).*/\1/' || echo 0)
    TOTAL_PASS=$((TOTAL_PASS + p))
    TOTAL_FAIL=$((TOTAL_FAIL + f))
  fi
}

run_suite "${SCRIPT_DIR}/fe-auth-i18n.sh"
run_suite "${SCRIPT_DIR}/fe-review-flow.sh"
run_suite "${SCRIPT_DIR}/fe-cafe-manage.sh"
run_suite "${SCRIPT_DIR}/fe-profile-logout.sh"

echo ""
echo "Sprint 3 total: ${TOTAL_PASS} passed, ${TOTAL_FAIL} failed"
[ "$TOTAL_FAIL" -eq 0 ] || exit 1
