#!/usr/bin/env bash
# run-all.sh — Run all Shigoto Coffee BE CRUD test suites in order
# Usage: bash qa/be-crud-tests/run-all.sh [--base-url http://...]

set -uo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Allow overriding API base URL
export API_BASE="${API_BASE:-http://localhost:5000/api}"
for arg in "$@"; do
  case "$arg" in
    --base-url=*) export API_BASE="${arg#*=}" ;;
    --base-url)   export API_BASE="$2"; shift ;;
  esac
done

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║   Shigoto Coffee — BE CRUD API Test Runner   ║"
echo "╚══════════════════════════════════════════════╝"
echo "  API base: ${API_BASE}"
echo "  Date    : $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# Pre-flight: check connectivity
if ! curl -fsS "${API_BASE}/cafes?limit=1" -o /dev/null 2>&1; then
  echo "✗ ERROR: Cannot reach ${API_BASE}/cafes"
  echo "  Please ensure:"
  echo "  1. MongoDB is running (docker compose up -d)"
  echo "  2. Backend is running (cd backend && npm run dev)"
  echo "  3. DB is seeded (cd backend && npm run seed)"
  exit 2
fi
echo "✓ Pre-flight: API reachable at ${API_BASE}"

# Fetch first cafe ID for suite 02
echo ""
CAFE_LIST=$(curl -s "${API_BASE}/cafes?limit=1")
export CAFE_ID
CAFE_ID=$(echo "$CAFE_LIST" | jq -r '.data[0]._id // empty' 2>/dev/null || true)
if [ -n "$CAFE_ID" ]; then
  echo "✓ Pre-flight: seed data found, CAFE_ID=$CAFE_ID"
else
  echo "⚠ WARNING: No cafes in DB. Some tests may be skipped. Run: cd backend && npm run seed"
fi

# ── Accumulate results ──
TOTAL_PASS=0
TOTAL_FAIL=0

run_suite() {
  local script="$1"
  local name
  name=$(basename "$script")
  echo ""
  echo "┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄"

  # Run script, capture last line with counts
  local output
  output=$(bash "$script" 2>&1)
  local exit_code=$?
  echo "$output"

  # Parse pass/fail from export_counts output
  local counts_line
  counts_line=$(echo "$output" | grep "^PASS:" | tail -1 || true)
  if [ -n "$counts_line" ]; then
    local p f
    p=$(echo "$counts_line" | grep -oP 'PASS:\K[0-9]+' || echo 0)
    f=$(echo "$counts_line" | grep -oP 'FAIL:\K[0-9]+' || echo 0)
    TOTAL_PASS=$((TOTAL_PASS + p))
    TOTAL_FAIL=$((TOTAL_FAIL + f))
  fi

  return $exit_code
}

SUITE_EXIT=0
run_suite "${SCRIPT_DIR}/01-get-list.sh"  || SUITE_EXIT=$?
run_suite "${SCRIPT_DIR}/02-get-by-id.sh" || SUITE_EXIT=$?
run_suite "${SCRIPT_DIR}/03-create.sh"    || SUITE_EXIT=$?

# Pass CREATED_CAFE_ID from 03-create to 04 and 05
if [ -f /tmp/shigoto_created_cafe_id.txt ]; then
  export CREATED_CAFE_ID
  CREATED_CAFE_ID=$(cat /tmp/shigoto_created_cafe_id.txt)
fi

run_suite "${SCRIPT_DIR}/04-update.sh"    || SUITE_EXIT=$?
run_suite "${SCRIPT_DIR}/05-delete.sh"    || SUITE_EXIT=$?

# ── Final Summary ──
TOTAL=$((TOTAL_PASS + TOTAL_FAIL))
echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║            FINAL RESULTS                     ║"
echo "╠══════════════════════════════════════════════╣"
printf "║  Total: %-4d | Pass: %-4d | Fail: %-4d     ║\n" \
  "$TOTAL" "$TOTAL_PASS" "$TOTAL_FAIL"
echo "╚══════════════════════════════════════════════╝"

if [ "$TOTAL_FAIL" -gt 0 ]; then
  echo ""
  echo "✗ ${TOTAL_FAIL} test(s) FAILED — exit code 1"
  exit 1
else
  echo ""
  echo "✓ All tests passed!"
  exit 0
fi
