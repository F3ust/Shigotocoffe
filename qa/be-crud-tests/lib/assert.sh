#!/usr/bin/env bash
# Shared assert helpers for Shigoto Coffee CRUD API tests
# Usage: source this file from each test script

BASE_URL="${API_BASE:-http://localhost:5000/api}"

# Global counters
PASS_COUNT=0
FAIL_COUNT=0

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

_pass() {
  local test_name="$1"
  PASS_COUNT=$((PASS_COUNT + 1))
  echo -e "${GREEN}✓ PASS${NC} — ${test_name}"
}

_fail() {
  local test_name="$1"
  local reason="$2"
  FAIL_COUNT=$((FAIL_COUNT + 1))
  echo -e "${RED}✗ FAIL${NC} — ${test_name}"
  echo -e "       ${YELLOW}Reason: ${reason}${NC}"
}

# assert_status_code <expected_code> <actual_code> <test_name>
assert_status_code() {
  local expected="$1"
  local actual="$2"
  local test_name="$3"
  if [ "$actual" -eq "$expected" ]; then
    _pass "$test_name"
  else
    _fail "$test_name" "Expected HTTP $expected, got HTTP $actual"
  fi
}

# assert_json_field <json_string> <jq_path> <expected_value> <test_name>
# Example: assert_json_field "$body" '.status' '"success"' "status is success"
assert_json_field() {
  local json="$1"
  local path="$2"
  local expected="$3"
  local test_name="$4"

  if ! command -v jq &>/dev/null; then
    _fail "$test_name" "jq not installed"
    return
  fi

  local actual
  actual=$(echo "$json" | jq -r "$path" 2>/dev/null)
  local jq_exit=$?

  if [ $jq_exit -ne 0 ]; then
    _fail "$test_name" "jq parse error on path '$path'"
    return
  fi

  # Strip surrounding quotes from expected for raw comparison
  local expected_raw
  expected_raw=$(echo "$expected" | sed 's/^"//;s/"$//')

  if [ "$actual" = "$expected_raw" ]; then
    _pass "$test_name"
  else
    _fail "$test_name" "Expected '$expected_raw' at '$path', got '$actual'"
  fi
}

# assert_json_not_null <json_string> <jq_path> <test_name>
assert_json_not_null() {
  local json="$1"
  local path="$2"
  local test_name="$3"

  if ! command -v jq &>/dev/null; then
    _fail "$test_name" "jq not installed"
    return
  fi

  local actual
  actual=$(echo "$json" | jq -r "$path" 2>/dev/null)

  if [ "$actual" = "null" ] || [ -z "$actual" ]; then
    _fail "$test_name" "Expected non-null at '$path', got '$actual'"
  else
    _pass "$test_name"
  fi
}

# assert_json_array_not_empty <json_string> <jq_path> <test_name>
assert_json_array_not_empty() {
  local json="$1"
  local path="$2"
  local test_name="$3"

  local len
  len=$(echo "$json" | jq -r "${path} | length" 2>/dev/null)

  if [ -z "$len" ] || [ "$len" -eq 0 ]; then
    _fail "$test_name" "Expected non-empty array at '$path', got length $len"
  else
    _pass "$test_name"
  fi
}

# assert_json_number_gte <json_string> <jq_path> <min_value> <test_name>
assert_json_number_gte() {
  local json="$1"
  local path="$2"
  local min="$3"
  local test_name="$4"

  local actual
  actual=$(echo "$json" | jq -r "$path" 2>/dev/null)

  # Use awk for float comparison
  if awk "BEGIN{exit !($actual >= $min)}"; then
    _pass "$test_name"
  else
    _fail "$test_name" "Expected $path >= $min, got $actual"
  fi
}

# print_summary — call at end of each test file
print_summary() {
  local suite="${1:-Test Suite}"
  local total=$((PASS_COUNT + FAIL_COUNT))
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  ${suite} — Results: ${PASS_COUNT}/${total} passed"
  if [ "$FAIL_COUNT" -gt 0 ]; then
    echo -e "  ${RED}${FAIL_COUNT} test(s) FAILED${NC}"
  else
    echo -e "  ${GREEN}All tests passed!${NC}"
  fi
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

# export counters so run-all.sh can accumulate them
export_counts() {
  echo "PASS:${PASS_COUNT} FAIL:${FAIL_COUNT}"
}
