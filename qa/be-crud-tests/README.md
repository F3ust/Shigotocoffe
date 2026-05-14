# BE CRUD API Test Plan

> Sprint 1, Task ID 9 (scripts); Sprint 2, Task ID 13 (verification)  
> Owner: Ngoc Quy, QA  
> Branch under test: `feat/sprint-2-fe`

## Overview

| Item | Value |
|------|-------|
| Scope | Cafe REST API: `GET /api/cafes`, `GET /api/cafes/:id`, `POST /api/cafes`, `PATCH /api/cafes/:id`, `DELETE /api/cafes/:id` |
| Tooling | `bash`, `curl`, `jq` |
| Dependencies | No npm packages |
| Test cases | 70 assertions across 5 suites (see summaries below) |
| Execution status | **Passed** locally — see [Execution results](#execution-results) |

## Preconditions

1. Copy env for the backend (repo root — `backend` loads `../.env`):
   ```bash
   cp .env.example .env
   ```
2. Start MongoDB (from repo root). On Windows, if Compose reports `project name must not be empty`, set a name (PowerShell example):
   ```powershell
   $env:COMPOSE_PROJECT_NAME='shigoto-coffee'; docker compose up -d
   ```
3. **Windows + WSL:** run **`bash qa/...` inside WSL** (project workflow). Start the backend **in that same WSL environment** so `http://localhost:5000` matches `curl` from the scripts. A dev server started only on Windows is often **not** reachable at `localhost:5000` from WSL.
4. Install dependencies and seed:
   ```bash
   cd backend && npm install && npm run seed
   ```
5. Start the backend on port `5000`:
   ```bash
   cd backend && npm run dev
   ```
6. Install **`jq`** in WSL (required for assertions; without it, tests report `jq not installed`):
   ```bash
   sudo apt-get update && sudo apt-get install -y jq
   ```
   Or as root: `wsl -d Ubuntu --user root -- bash -lc 'apt-get update && apt-get install -y jq'`

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
| TC-02-03 | `GET /api/cafes/abc` | Invalid id format | 400 | Resolved: explicit ObjectId validation in `getCafeById` |

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

## Resolved note (historical)

`GET /api/cafes/:id` previously could return `500` for invalid ObjectId strings. The suite now expects **400** with validation messaging; scripts treat this as the desired behavior.

---

## Execution Results

Last run: **2026-05-15** on branch **`feat/sprint-2-fe`**, WSL Ubuntu, API `http://localhost:5000/api` (backend + `npm run seed` executed inside WSL; MongoDB via Docker Desktop).

```bash
wsl -d Ubuntu -- bash -lc "cd '/mnt/d/仕事コーヒー' && bash qa/be-crud-tests/run-all.sh"
```

| Suite | Assertions passed | Status |
|-------|-------------------|--------|
| 01-get-list | 27 | Pass |
| 02-get-by-id | 8 | Pass |
| 03-create | 14 | Pass |
| 04-update | 14 | Pass |
| 05-delete | 7 | Pass |
| **Total** | **70** | **All passed** |

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
