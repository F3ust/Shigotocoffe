# UAT Execution Log
## Search Flow, Sprint 1 Task ID 14

---

## Run Metadata

| Item | Value |
|------|----|
| Date | 2026-05-14 |
| Runner | QA agent Sonnet 4.6 on WSL Ubuntu |
| Branch | `feature/sprint-1-qa-completion` |
| Base commit | `b3a0a89` (Tester A: test(env): capture actual env-verification script execution output) |
| Scope | Task ID 14, search flow UAT |
| Status | **SKIPPED — backend not running** |

---

## Execution Status

The QA agent did not run the UAT script because the backend was not running.

Health check result:
```
curl -fsS http://localhost:5000/api/health
→ curl: (7) Failed to connect to localhost port 5000 after 1 ms
```

Expected behavior was checked against `getCafes` in `backend/src/controllers/cafeController.ts` and the seed data in `backend/src/seeds/cafeSeedData.ts`.

Run this on a local machine before the Sprint Review:
```bash
# 1. Start infrastructure
docker compose up -d

# 2. Start backend
cd backend && npm run dev

# 3. (Optional) Re-seed
cd backend && npm run seed

# 4. Run UAT script from repo root
bash qa/uat-search-flow/run-search-uat.sh 2>&1 | tee qa/uat-search-flow/execution-output.txt
```

---

## Scenario Results

| ID | Scenario | Status | Notes |
|----|----------|--------|---------|
| UAT-S-01 | Default cafe list (12 cafes, default pagination) | SKIPPED-env-not-ready | Static review: no params returns page 1, limit 12 |
| UAT-S-02 | Japanese keyword search | SKIPPED-env-not-ready | Static review confirms matches against `name.ja` and `description.ja` |
| UAT-S-03 | Vietnamese keyword search | SKIPPED-env-not-ready | Static review confirms matches against `description.vi` |
| UAT-S-04 | No-match keyword → empty state | SKIPPED-env-not-ready | Static: no match → `data=[]`, `total=0`, HTTP 200 (not 404) |
| UAT-S-05 | District filter | SKIPPED-env-not-ready | Static review confirms the requested district returns 4 seed cafes |
| UAT-S-06 | minRating=4 filter | SKIPPED-env-not-ready | Static: `filter.averageRating = { $gte: 4.0 }` → 11 docs (Green Bamboo 3.9 excluded) |
| UAT-S-07 | Single tag wifi | SKIPPED-env-not-ready | Static: all 12 seed cafes have "wifi" in hashtags → 12 results |
| UAT-S-08 | AND-match tags wifi+outlets | SKIPPED-env-not-ready | Static: `$all: ["wifi","outlets"]` → 7 cafes confirmed from seed |
| UAT-S-09 | Pagination page=2&limit=5 | SKIPPED-env-not-ready | Static: skip=5, limit=5, total=12, totalPages=ceil(12/5)=3 |
| UAT-S-10 | Compound search (q+district+tags) | SKIPPED-env-not-ready | Static: filters compose correctly via separate `filter` object fields; AND-combined by MongoDB |
| UAT-S-11 | Sort order averageRating desc | SKIPPED-env-not-ready | Static: `.sort({ averageRating: -1, createdAt: -1 })` confirmed in controller line 58 |
| UAT-S-12 | UI: Click card → detail page | SKIPPED-known-limitation | Detail page is outside Sprint 1 scope |

**PASS: 0 | FAIL: 0 | SKIPPED-env-not-ready: 11 | SKIPPED-known-limitation: 1**

---

## Findings

### UAT-F-01: `FilterPanel` does not render tag checkboxes

**Severity:** Medium  
**File:** `frontend/src/components/cafe/FilterPanel.tsx`

The spec requires filters for Wi-Fi, outlets, no time limit, and Japanese style cafes. `FilterPanel.tsx` renders distance and rating filters but does not render tag checkboxes for `wifi`, `outlets`, `quiet`, `noTimeLimit`, or `japanese`.

`selectedTags` is declared without a setter: `const [selectedTags] = useState<string[]>([])`. Users cannot choose tag filters through the UI.

The backend supports `tags=wifi,outlets`.

**Impact:** UAT-S-07 and UAT-S-08 can only be verified through the API. The current UI cannot drive those tag filters.

**Action:** Document only. Do not change production code in this QA task.

---

### UAT-F-02: `FilterPanel` distance filter does not reach the API

**Severity:** Low  
**File:** `frontend/src/components/cafe/FilterPanel.tsx`

`selectedDistances` changes when a user clicks the checkbox. `handleApply` sends only `{ minRating, tags: selectedTags }`, so it drops the distance value. The backend has no distance parameter or geospatial query.

**Action:** Document only.

---

### UAT-F-03: Regex search does not normalize Vietnamese diacritics

**Severity:** Info  
**File:** `backend/src/controllers/cafeController.ts` line 29

`new RegExp(q, "i")` handles case-insensitive matching but does not normalize Unicode. A keyword without the correct Vietnamese marks may not match the stored text.

**Action:** Document only.

---

## Sprint 1 Acceptance Verdict

### P_ID 1.0: Cafe List Display

**Verdict: CONDITIONAL PASS**

Rationale:
- `getCafes` returns `{ status, data, pagination }`.
- The response shape matches `CafeListResponse`.
- `HomePage.tsx` renders the card grid, loading state, and empty state.
- `CafeCard` renders image, name, address, rating, and tags.
- Condition: run `run-search-uat.sh` locally before Sprint Review.

### P_ID 3.0: Japanese and Vietnamese Support

**Verdict: CONDITIONAL PASS**

Rationale:
- `i18n.ts`, `vi.json`, and `ja.json` exist.
- `LanguageToggle` switches between Japanese and Vietnamese.
- Backend search checks `name.ja`, `name.vi`, `description.ja`, and `description.vi`.
- All 12 seed cafes include Japanese and Vietnamese text.
- Condition: verify the language switch in a browser.

### P_ID 4.0: Search and Filters

**Verdict: CONDITIONAL PASS**

Rationale:
- API supports `q`, `district`, `minRating`, `tags`, `page`, and `limit`.
- `tags` uses AND matching.
- `SearchBar` sends `q` and `district`.
- `FilterPanel` sends `minRating`.
- Known gap: tag filter checkboxes do not exist in `FilterPanel` UI.
- Condition: run the UAT script locally.

---

## Summary

Static review found no logic error in the 11 API-testable scenarios. UAT-S-12 remains a known UI limitation for Sprint 1. `run-search-uat.sh` is ready for a local run when the backend is available.

**Next action:** Run `bash qa/uat-search-flow/run-search-uat.sh` locally before Sprint Review and update this file with actual PASS/FAIL results.
