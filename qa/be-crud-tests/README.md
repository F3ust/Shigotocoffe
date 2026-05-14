# BE CRUD API Test Plan

> Sprint 1, Task ID 9  
> Owner: Ngoc Quy, QA Tester A  
> Branch: `feature/sprint-1-qa-completion`

## Overview

| Item | Value |
|------|-------|
| Scope | Cafe REST API: `GET /api/cafes`, `GET /api/cafes/:id`, `POST /api/cafes`, `PATCH /api/cafes/:id`, `DELETE /api/cafes/:id` |
| Tooling | `bash`, `curl`, `jq` |
| Dependencies | No npm packages |
| Test cases | 23 logical cases |
| Execution status | Not run in the QA agent. The backend was not running. |

## Preconditions

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

## Run

```bash
# From the repo root
bash qa/be-crud-tests/run-all.sh

# Override the API base URL
API_BASE=http://localhost:5000/api bash qa/be-crud-tests/run-all.sh

# Run a single suite
bash qa/be-crud-tests/01-get-list.sh
```

Example pass output:
```text
BE CRUD API Test Runner
API base: http://localhost:5000/api

PASS - TC-01-01 GET /api/cafes returns 200
PASS - TC-01-01 body.status = success

FINAL RESULTS
Total: 23 | Pass: 23 | Fail: 0
All tests passed.
```

## Test Case Summary

### Suite 01 — GET /api/cafes (7 cases)

| ID | Endpoint | Scenario | Expected Status | Notes |
|----|----------|----------|-----------------|---------|
| TC-01-01 | `GET /api/cafes` | Basic list: status, data array, pagination fields | 200 | `data` is an array; pagination fields exist |
| TC-01-02 | `GET /api/cafes?q=workspace` | Text search | 200 | Every result contains `workspace` in name or description |
| TC-01-03 | `GET /api/cafes?district=Ba+Dinh` | District filter | 200 | Every result belongs to the requested district |
| TC-01-04 | `GET /api/cafes?minRating=4` | Rating filter | 200 | Every result has `averageRating >= 4` |
| TC-01-05 | `GET /api/cafes?tags=wifi` | Single tag filter | 200 | Every result contains `wifi` |
| TC-01-06 | `GET /api/cafes?tags=wifi,outlets` | Multi-tag AND filter | 200 | Every result contains both `wifi` and `outlets` |
| TC-01-07 | `GET /api/cafes?page=2&limit=5` | Pagination | 200 | pagination.page=2, pagination.limit=5 |

### Suite 02 — GET /api/cafes/:id (3 cases)

| ID | Endpoint | Scenario | Expected Status | Notes |
|----|----------|----------|-----------------|---------|
| TC-02-01 | `GET /api/cafes/:id` | Valid existing id | 200 | data._id match |
| TC-02-02 | `GET /api/cafes/000000000000000000000000` | Non-existent valid ObjectId | 404 | Error message includes `not found` |
| TC-02-03 | `GET /api/cafes/abc` | Invalid id format | 500 | Known issue. See the note below. |

### Suite 03 — POST /api/cafes (6 cases)

| ID | Endpoint | Scenario | Expected Status | Notes |
|----|----------|----------|-----------------|---------|
| TC-03-01 | `POST /api/cafes` | Valid body | 201 | `data._id` exists; suites 04 and 05 reuse the id |
| TC-03-02 | `POST /api/cafes` | Missing `name.vi` | 400 | ValidationError |
| TC-03-03 | `POST /api/cafes` | Missing `openingHours.open` | 400 | ValidationError |
| TC-03-04 | `POST /api/cafes` | `openingHours.open = "25:00"` | 400 | regex `^([01]\d|2[0-3]):[0-5]\d$` fail |
| TC-03-05 | `POST /api/cafes` | `hashtags = ["invalid_tag"]` | 400 | Enum check: wifi,outlets,quiet,japanese,noTimeLimit |
| TC-03-06 | `POST /api/cafes` | `location.coordinates = [200, 21.0]` | 400 | lng > 180 |

### Suite 04 — PATCH /api/cafes/:id (4 cases)

| ID | Endpoint | Scenario | Expected Status | Notes |
|----|----------|----------|-----------------|---------|
| TC-04-01 | `PATCH /api/cafes/:id` | Valid partial update (description) | 200 | Response contains the updated field |
| TC-04-02 | `PATCH /api/cafes/not-a-valid-id` | Invalid ObjectId | 400 | `mongoose.isValidObjectId()` guard |
| TC-04-03 | `PATCH /api/cafes/000000000000000000000000` | Non-existent id | 404 | NotFoundError |
| TC-04-04 | `PATCH /api/cafes/:id` body `{_id, averageRating: 9.9}` | Immutable fields stripped | 200 | `_id` and `averageRating` do not change |

### Suite 05 — DELETE /api/cafes/:id (3 cases)

| ID | Endpoint | Scenario | Expected Status | Notes |
|----|----------|----------|-----------------|---------|
| TC-05-01 | `DELETE /api/cafes/:id` | Delete existing | 204 | Empty body |
| TC-05-02 | `DELETE /api/cafes/:id` | Delete the same cafe twice | 404 | NotFoundError |
| TC-05-03 | `DELETE /api/cafes/bad-id-xyz` | Invalid ObjectId | 400 | `mongoose.isValidObjectId()` guard |

---

## Known Issue

### FINDING-01: `GET /api/cafes/:id` does not validate ObjectId format

**Severity:** Low  
**File:** `backend/src/controllers/cafeController.ts`, function `getCafeById` (line 77–89)

`updateCafe` and `deleteCafe` validate ObjectId format before querying MongoDB. `getCafeById` does not. A request such as `GET /api/cafes/abc` triggers a Mongoose `CastError`, so the error handler returns `500` instead of `400`.

**Expected behavior:** 400 Bad Request with a clear message  
**Actual behavior from code review:** 500 Internal Server Error  

**Recommendation:** Add `if (!mongoose.isValidObjectId(id)) throw new ValidationError("Invalid cafe id")` to `getCafeById`.  
**Action:** Document only. Do not change production code in this QA task.

---

## Execution Results

> The QA agent did not run the suite because the backend was not running.
> The scripts were reviewed against `cafeController.ts`, `Cafe.ts`, `errorHandler.ts`, and `errors.ts`.
> Run the scripts on a local environment before the Sprint Review.

Run this command when the backend is available:
```bash
bash qa/be-crud-tests/run-all.sh 2>&1 | tee qa/be-crud-tests/execution-log.txt
```

| Suite | Test count | Status |
|-------|-----------|--------|
| 01-get-list | 7 | Manual review only |
| 02-get-by-id | 3 | Manual review only |
| 03-create | 6 | Manual review only |
| 04-update | 4 | Manual review only |
| 05-delete | 3 | Manual review only |
| **Total** | **23** | **Pending execution** |

---

## File Structure

```
qa/be-crud-tests/
├── README.md                  # This file
├── run-all.sh                 # Runs suites 01 through 05
├── lib/
│   └── assert.sh              # Shared assertions
├── 01-get-list.sh             # GET list with filters and pagination
├── 02-get-by-id.sh            # GET by id
├── 03-create.sh               # POST create and validation cases
├── 04-update.sh               # PATCH update cases
├── 05-delete.sh               # DELETE cases
└── fixtures/
    ├── valid-cafe.json        # Valid POST body
    └── update-cafe.json       # Partial PATCH body
```
