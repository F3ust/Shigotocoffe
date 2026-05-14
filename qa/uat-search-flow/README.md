# UAT Search Flow

## Overview

| Item | Value |
|------|-------|
| Sprint | Sprint 1 |
| Task ID | 14 |
| Task | Search flow acceptance test |
| Owner | Quoc Khanh, QA Tester B |
| Estimate | 3h |

This folder contains UAT artifacts for the guest cafe search flow. It covers keyword search, district filter, rating filter, tag filter, pagination, and sort order.

## Scope

Product Backlog items:
- **P_ID 1**: Cafe list display
- **P_ID 3**: Japanese and Vietnamese content support
- **P_ID 4**: Search and filters

Reference screen: Screen 3, Guest Home Cafe List.

Out of scope for Sprint 1:
- Cafe detail page
- Geolocation and distance API filter
- Tag checkboxes in `FilterPanel` UI. The API supports tag filters; the UI gap appears in `execution-log.md`.

## Folder Structure

```
qa/uat-search-flow/
├── README.md
├── scenarios.md
├── execution-log.md
├── run-search-uat.sh
└── lib/
    └── extra-assert.sh
```

## Run

### Pre-conditions

1. Start MongoDB:
   ```bash
   docker compose up -d
   ```
2. Start the backend on port `5000`:
   ```bash
   cd backend && npm run dev
   ```
3. Seed the database:
   ```bash
   cd backend && npm run seed
   ```
4. Install `jq`:
   ```bash
   sudo apt-get install -y jq
   ```

### Run the UAT script

```bash
# From the repo root
bash qa/uat-search-flow/run-search-uat.sh

# Capture output
bash qa/uat-search-flow/run-search-uat.sh 2>&1 | tee qa/uat-search-flow/execution-output.txt

# Override base URL
API_BASE=http://localhost:5000/api bash qa/uat-search-flow/run-search-uat.sh
```

### Windows through WSL

```powershell
wsl -d Ubuntu -- bash -c "cd '<repo-root>' && bash qa/uat-search-flow/run-search-uat.sh"
```

## Shared Helpers

The runner imports assertion helpers from Task ID 9:

```
qa/be-crud-tests/lib/assert.sh
```

Reused helpers: `assert_status_code`, `assert_json_field`, `assert_json_not_null`, `assert_json_array_not_empty`, `assert_json_number_gte`, `print_summary`.

`lib/extra-assert.sh` adds collection-level assertions:
- `assert_json_array_length` — check exact count
- `assert_json_array_length_gte` — check minimum count
- `assert_all_field_equal` — verify all items have same field value
- `assert_all_field_gte` — verify all items have numeric field >= min
- `assert_all_contain_tag` — verify all items have specific hashtag
- `assert_sorted_desc` — verify array sorted descending by field
- `assert_text_match_any` — verify all items match keyword in bilingual text fields

## References

| Item | Details |
|-----|----------|
| Product Backlog P_ID 1, 3, 4 | Sprint 1 acceptance criteria |
| Screen 3 | Guest Home Cafe List |
| Task ID 9 artifacts | `qa/be-crud-tests/` |
| BE logic | `backend/src/controllers/cafeController.ts` → `getCafes` |
| Seed data | `backend/src/seeds/cafeSeedData.ts` (12 cafes) |
| FE search | `frontend/src/pages/HomePage.tsx`, `SearchBar.tsx`, `FilterPanel.tsx` |
