# UAT Scenarios: Search Flow

> Sprint 1, Task ID 14  
> Owner: Quoc Khanh, QA Tester B  
> Product Backlog: P_ID 1 (Cafe List Display), P_ID 3 (Japanese and Vietnamese Support), P_ID 4 (Search and Filters)  
> Reference screen: Screen 3, Guest Home Cafe List

## Seed Data Baseline

The test suite assumes the default 12 cafes from `backend/src/seeds/cafeSeedData.ts`.

Baseline counts:
- Target district cafes: 4
- Cafes with `outlets`: 7
- Cafes with `averageRating >= 4`: 11
- Cafes with `wifi`: 12

## Preconditions

- MongoDB is running.
- Backend is running at `http://localhost:5000`.
- The database contains the default 12 seed cafes.
- For UI checks, the frontend is running at `http://localhost:5173`.

## Scenario Template

Each scenario includes persona, backlog mapping, steps, expected result, and verification method.

## UAT-S-01: Guest opens the default cafe list

**Persona:** Guest user looking for a work-friendly cafe.  
**Related backlog:** P_ID 1.0  
**Steps:**
1. Open `http://localhost:5173`, or call `GET /api/cafes`.
2. Do not enter a keyword.
3. Do not select filters.

**Expected Result:**
- API returns HTTP 200.
- `data` contains 12 cafes.
- `pagination.page` is `1`.
- `pagination.limit` is `12`.
- Each item has `name`, `district`, `averageRating`, and `hashtags`.

**Verification:** API and UI.

## UAT-S-02: Search with a Japanese keyword

**Persona:** Japanese guest user.  
**Related backlog:** P_ID 3.0, P_ID 4.0  
**Steps:**
1. Search with a Japanese cafe-related keyword from the seed data.
2. Submit the search.

**Expected Result:**
- API returns HTTP 200.
- Each result contains the keyword in `name.ja`, `name.vi`, `description.ja`, or `description.vi`.
- At least one cafe matches.

**Verification:** API and UI.

## UAT-S-03: Search with a Vietnamese keyword

**Persona:** Guest user using Vietnamese labels.  
**Related backlog:** P_ID 3.0, P_ID 4.0  
**Steps:**
1. Search with a Vietnamese quiet-cafe keyword from the seed data.
2. Submit the search.

**Expected Result:**
- API returns HTTP 200.
- At least one cafe matches.
- Matching uses the bilingual name and description fields.

**Verification:** API and UI.

## UAT-S-04: Search with no matching keyword

**Persona:** Guest user.  
**Related backlog:** P_ID 4.0  
**Steps:**
1. Search for `xyz_nomatch_9999_uat`.
2. Submit the search.

**Expected Result:**
- API returns HTTP 200.
- `data` is an empty array.
- `pagination.total` is `0`.
- UI shows the empty state.

**Verification:** API and UI.

## UAT-S-05: Filter by district

**Persona:** Guest user searching in a specific district.  
**Related backlog:** P_ID 4.0  
**Steps:**
1. Select the target district used by `run-search-uat.sh`.
2. Submit the search.

**Expected Result:**
- API returns HTTP 200.
- Exactly 4 cafes return.
- Every item has the selected district.

**Verification:** API and UI.

## UAT-S-06: Filter by minimum rating

**Persona:** Guest user looking for high-rated cafes.  
**Related backlog:** P_ID 4.0  
**Steps:**
1. Select minimum rating `4`.
2. Apply filters.

**Expected Result:**
- API returns HTTP 200.
- Every item has `averageRating >= 4`.
- The seed data returns 11 cafes.

**Verification:** API and UI.

## UAT-S-07: Filter by a single tag

**Persona:** Guest user looking for Wi-Fi.  
**Related backlog:** P_ID 4.0  
**Steps:**
1. Call `GET /api/cafes?tags=wifi`.

**Expected Result:**
- API returns HTTP 200.
- Every item includes `wifi` in `hashtags`.
- The seed data returns 12 cafes.

**Verification:** API. UI tag checkboxes are a documented gap.

## UAT-S-08: Filter by multiple tags with AND matching

**Persona:** Guest user looking for Wi-Fi and outlets.  
**Related backlog:** P_ID 4.0  
**Steps:**
1. Call `GET /api/cafes?tags=wifi,outlets`.

**Expected Result:**
- API returns HTTP 200.
- Every item contains both `wifi` and `outlets`.
- The seed data returns 7 cafes.

**Verification:** API. UI tag checkboxes are a documented gap.

## UAT-S-09: Check pagination

**Persona:** Guest user browsing the second page.  
**Related backlog:** P_ID 1.0  
**Steps:**
1. Call `GET /api/cafes?page=2&limit=5`.

**Expected Result:**
- API returns HTTP 200.
- `pagination.page` is `2`.
- `pagination.limit` is `5`.
- `data` contains 5 cafes.
- `pagination.totalPages` is `3`.

**Verification:** API.

## UAT-S-10: Combine keyword, district, and tag filters

**Persona:** Guest user refining a search.  
**Related backlog:** P_ID 4.0  
**Steps:**
1. Call `GET /api/cafes` with keyword, district, and `wifi` tag filters.

**Expected Result:**
- API returns HTTP 200.
- Every result matches all three conditions.
- Results match the requested district, include `wifi`, and match the keyword.

**Verification:** API.

## UAT-S-11: Check sort order

**Persona:** Guest user expects the best-rated cafes first.  
**Related backlog:** P_ID 1.0  
**Steps:**
1. Call `GET /api/cafes?limit=12`.

**Expected Result:**
- API returns HTTP 200.
- Results sort by `averageRating` descending.
- The first item has `averageRating = 4.8`.

**Verification:** API.

## UAT-S-12: Click a cafe card

**Persona:** Guest user wants cafe details.  
**Related backlog:** P_ID 1.0, P_ID 5.0  
**Steps:**
1. Open the home page.
2. Click a cafe card.

**Expected Result:**
- Sprint 1 records this as a known limitation.
- The cafe detail page is outside Sprint 1 scope.
- Do not mark this scenario as failed for Sprint 1.

**Verification:** Manual UI note.
