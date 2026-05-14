#!/usr/bin/env bash
# Extra assert helpers for UAT search flow tests
# Extends qa/be-crud-tests/lib/assert.sh with collection-level checks
# Author: QA Tester B (Quoc Khanh) — Sprint 1, Task ID 14
# Usage: source this file AFTER sourcing ../be-crud-tests/lib/assert.sh

# assert_json_array_length <json_string> <jq_path_to_array> <expected_length> <test_name>
# Checks that array at path has exactly the expected number of elements.
assert_json_array_length() {
  local json="$1"
  local path="$2"
  local expected="$3"
  local test_name="$4"

  if ! command -v jq &>/dev/null; then
    _fail "$test_name" "jq not installed"
    return
  fi

  local actual
  actual=$(echo "$json" | jq -r "${path} | length" 2>/dev/null)

  if [ "$actual" = "$expected" ]; then
    _pass "$test_name"
  else
    _fail "$test_name" "Expected array length $expected at '$path', got $actual"
  fi
}

# assert_json_array_length_gte <json_string> <jq_path_to_array> <min_length> <test_name>
# Checks that array at path has at least min_length elements.
assert_json_array_length_gte() {
  local json="$1"
  local path="$2"
  local min="$3"
  local test_name="$4"

  local actual
  actual=$(echo "$json" | jq -r "${path} | length" 2>/dev/null)

  if awk "BEGIN{exit !($actual >= $min)}"; then
    _pass "$test_name"
  else
    _fail "$test_name" "Expected array length >= $min at '$path', got $actual"
  fi
}

# assert_all_field_equal <json_string> <jq_data_path> <field_path> <expected_value> <test_name>
# Checks that every item in the array at data_path has field_path equal to expected_value.
# Example: assert_all_field_equal "$body" '.data' '.district' 'District Name' "all items match district"
assert_all_field_equal() {
  local json="$1"
  local data_path="$2"
  local field_path="$3"
  local expected="$4"
  local test_name="$5"

  if ! command -v jq &>/dev/null; then
    _fail "$test_name" "jq not installed"
    return
  fi

  # Get count of items where field != expected
  local mismatch_count
  mismatch_count=$(echo "$json" | jq -r "${data_path} | map(select(${field_path} != \"${expected}\")) | length" 2>/dev/null)

  if [ "$mismatch_count" = "0" ]; then
    _pass "$test_name"
  else
    local first_bad
    first_bad=$(echo "$json" | jq -r "${data_path} | map(select(${field_path} != \"${expected}\"))[0]${field_path}" 2>/dev/null)
    _fail "$test_name" "$mismatch_count item(s) have ${field_path} != '${expected}' (first bad: ${first_bad})"
  fi
}

# assert_all_field_gte <json_string> <jq_data_path> <field_path> <min_value> <test_name>
# Checks that every item in the array has field_path >= min_value (numeric).
assert_all_field_gte() {
  local json="$1"
  local data_path="$2"
  local field_path="$3"
  local min="$4"
  local test_name="$5"

  local mismatch_count
  mismatch_count=$(echo "$json" | jq -r "${data_path} | map(select(${field_path} < ${min})) | length" 2>/dev/null)

  if [ "$mismatch_count" = "0" ]; then
    _pass "$test_name"
  else
    local min_found
    min_found=$(echo "$json" | jq -r "[${data_path}[]${field_path}] | min" 2>/dev/null)
    _fail "$test_name" "$mismatch_count item(s) have ${field_path} < ${min} (min found: ${min_found})"
  fi
}

# assert_all_contain_tag <json_string> <jq_data_path> <tag_value> <test_name>
# Checks that every item in the array has <tag_value> in its .hashtags array.
assert_all_contain_tag() {
  local json="$1"
  local data_path="$2"
  local tag="$3"
  local test_name="$4"

  local mismatch_count
  mismatch_count=$(echo "$json" | jq -r "${data_path} | map(select(.hashtags | index(\"${tag}\") | not)) | length" 2>/dev/null)

  if [ "$mismatch_count" = "0" ]; then
    _pass "$test_name"
  else
    _fail "$test_name" "$mismatch_count item(s) do not contain tag '${tag}' in .hashtags"
  fi
}

# assert_sorted_desc <json_string> <jq_data_path> <field_path> <test_name>
# Checks that numeric field at field_path is non-increasing across array elements.
assert_sorted_desc() {
  local json="$1"
  local data_path="$2"
  local field_path="$3"
  local test_name="$4"

  # Extract values as array, then check if sorted desc
  local values
  values=$(echo "$json" | jq -r "[${data_path}[]${field_path}]" 2>/dev/null)

  local is_sorted
  is_sorted=$(echo "$values" | jq -r '. as $arr | (range(1; length) | . as $i | if $arr[$i] > $arr[$i-1] then "no" else "ok" end) // "ok"' 2>/dev/null | grep -c "no" || true)

  if [ "$is_sorted" = "0" ]; then
    _pass "$test_name"
  else
    _fail "$test_name" "Array at '${data_path}' is NOT sorted descending by ${field_path}"
  fi
}

# assert_text_match_any <json_string> <jq_data_path> <keyword> <test_name>
# Checks that every item in the array has at least one bilingual text field matching keyword (case-insensitive).
# Fields checked: .name.ja, .name.vi, .description.ja, .description.vi
assert_text_match_any() {
  local json="$1"
  local data_path="$2"
  local keyword="$3"
  local test_name="$4"

  local lower_kw
  lower_kw=$(echo "$keyword" | tr '[:upper:]' '[:lower:]')

  # Count items that do NOT have keyword in any text field
  local mismatch_count
  mismatch_count=$(echo "$json" | jq -r \
    --arg kw "$keyword" \
    "${data_path} | map(
      select(
        ((.name.ja // \"\") | ascii_downcase | contains(\$kw | ascii_downcase) | not) and
        ((.name.vi // \"\") | ascii_downcase | contains(\$kw | ascii_downcase) | not) and
        ((.description.ja // \"\") | ascii_downcase | contains(\$kw | ascii_downcase) | not) and
        ((.description.vi // \"\") | ascii_downcase | contains(\$kw | ascii_downcase) | not)
      )
    ) | length" 2>/dev/null)

  if [ "$mismatch_count" = "0" ]; then
    _pass "$test_name"
  else
    _fail "$test_name" "$mismatch_count item(s) do not contain keyword '${keyword}' in any text field"
  fi
}
