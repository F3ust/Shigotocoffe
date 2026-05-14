# UAT Execution Log / 実行ログ
## 検索フロー — Sprint 1 Task ID 14

---

## Header / ヘッダー

| 項目 | 値 |
|------|----|
| 実行日時 / Ngày thực thi | 2026-05-14 |
| 実行者 / Người thực thi | QA agent Sonnet 4.6 (Quốc Khánh) / WSL Ubuntu |
| Branch | `feature/sprint-1-qa-completion` |
| Base commit | `b3a0a89` (Tester A: test(env): capture actual env-verification script execution output) |
| Scope | Task ID 14 — 検索フロー全体の受入テスト (UAT) |
| 実行ステータス / Trạng thái | **SKIPPED — Backend not running** |

---

## Execution Status / Trạng thái thực thi

**Execution chưa thực hiện tại môi trường QA agent vì backend không đang chạy.**

Health check result:
```
curl -fsS http://localhost:5000/api/health
→ curl: (7) Failed to connect to localhost port 5000 after 1 ms
```

Mọi expected behavior được verify qua **code review production code** (`getCafes` trong `backend/src/controllers/cafeController.ts`) và đối chiếu với seed data (`backend/src/seeds/cafeSeedData.ts`).

Tester được hướng dẫn chạy lại trên máy local trước Sprint Review:
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

## Scenario Results / Kết quả từng scenario

| ID | Scenario | Status | Ghi chú |
|----|----------|--------|---------|
| UAT-S-01 | Default cafe list (12 cafes, default pagination) | SKIPPED-env-not-ready | Static analysis: `getCafes` với no params trả toàn bộ 12 docs, page=1, limit=12 |
| UAT-S-02 | JP keyword search "コーヒー" | SKIPPED-env-not-ready | Static: regex `/コーヒー/i` match name.ja/description.ja; confirmed 2+ cafes match |
| UAT-S-03 | VI keyword search "yên tĩnh" | SKIPPED-env-not-ready | Static: regex `/yên tĩnh/i` match description.vi "Quán cà phê yên tĩnh" (Tranquil Coffee) |
| UAT-S-04 | No-match keyword → empty state | SKIPPED-env-not-ready | Static: no match → `data=[]`, `total=0`, HTTP 200 (not 404) |
| UAT-S-05 | District filter "Ba Đình" | SKIPPED-env-not-ready | Static: `filter.district = "Ba Đình"` → 4 docs (confirmed from seed) |
| UAT-S-06 | minRating=4 filter | SKIPPED-env-not-ready | Static: `filter.averageRating = { $gte: 4.0 }` → 11 docs (Green Bamboo 3.9 excluded) |
| UAT-S-07 | Single tag wifi | SKIPPED-env-not-ready | Static: all 12 seed cafes have "wifi" in hashtags → 12 results |
| UAT-S-08 | AND-match tags wifi+outlets | SKIPPED-env-not-ready | Static: `$all: ["wifi","outlets"]` → 7 cafes confirmed from seed |
| UAT-S-09 | Pagination page=2&limit=5 | SKIPPED-env-not-ready | Static: skip=5, limit=5, total=12, totalPages=ceil(12/5)=3 |
| UAT-S-10 | Compound search (q+district+tags) | SKIPPED-env-not-ready | Static: filters compose correctly via separate `filter` object fields; AND-combined by MongoDB |
| UAT-S-11 | Sort order averageRating desc | SKIPPED-env-not-ready | Static: `.sort({ averageRating: -1, createdAt: -1 })` confirmed in controller line 58 |
| UAT-S-12 | UI: Click card → detail page | SKIPPED-known-limitation | POT合意済み: Detail page out of Sprint 1 scope |

**PASS: 0 | FAIL: 0 | SKIPPED-env-not-ready: 11 | SKIPPED-known-limitation: 1**

---

## Findings / 発見事項

### UAT-F-01: FilterPanel — tag checkboxes 未実装 / Chưa có tag checkboxes trong FilterPanel

**Mức độ:** Medium (UX) — API hoạt động đúng, UI còn thiếu  
**File:** `frontend/src/components/cafe/FilterPanel.tsx`

**Mô tả:**  
Spec yêu cầu filter theo "Wi-Fiが強い、コンセントが多い、時間制限なし、日本系" (P_ID 4.0, Screen 3/5).  
`FilterPanel.tsx` render UI cho distance filter và rating filter, nhưng **không render checkbox nào cho hashtag tags** (wifi, outlets, quiet, noTimeLimit, japanese).

`selectedTags` state được khai báo là `const [selectedTags] = useState<string[]>([])` — không có setter — nên user không thể chọn tag qua UI.

Backend API hỗ trợ `tags=wifi,outlets` và hoạt động đúng (confirmed từ controller code review).

**Impact:** UAT-S-07 và UAT-S-08 chỉ có thể verify qua API trực tiếp, không thể verify qua UI FilterPanel.

**Khuyến nghị:** Sprint 2: thêm tag checkboxes và kết nối với `selectedTags` setter.  
**Action:** Document only — KHÔNG sửa production code.

---

### UAT-F-02: FilterPanel — distance filter UI-only, không gửi lên API

**Mức độ:** Low (known from spec context)  
**File:** `frontend/src/components/cafe/FilterPanel.tsx`

**Mô tả:**  
`selectedDistances` state được toggle khi user click checkbox, nhưng `handleApply` chỉ gửi `{ minRating, tags: selectedTags }` — không bao gồm `selectedDistances`.  
Backend `getCafes` không có distance filter parameter (không có geospatial `$near` query).

Distance filter (距離フィルター) là **known limitation per Sprint 1 scope** — geolocation feature chưa implement.

**Action:** Document only.

---

### UAT-F-03: Regex "i" flag không normalize Unicode diacritics

**Mức độ:** Info  
**File:** `backend/src/controllers/cafeController.ts` line 29

**Mô tả:**  
`new RegExp(q, "i")` trong MongoDB sử dụng case-insensitive flag nhưng không normalize Unicode.  
Search `yên tinh` (thiếu dấu `˜` trên ĩ) sẽ KHÔNG match "yên tĩnh". Đây là behavior chuẩn của regex; người dùng phải nhập đúng dấu tiếng Việt.

**Impact:** Minimal cho target user (người Nhật thường không nhập tiếng Việt có dấu; người Việt biết nhập đúng dấu).  
**Action:** Document only.

---

## Sprint 1 Acceptance Verdict / Sprint 1 受入判定

### P_ID 1.0 — 店舗一覧表示 (Danh sách quán)

**Verdict: CONDITIONAL PASS**

**根拠 / Lý do:**
- API logic xác nhận qua code review: `getCafes` trả đúng cấu trúc response (status, data, pagination), sort đúng theo averageRating desc
- Response format đúng với FE type definition (`CafeListResponse`)
- FE `HomePage.tsx` render card grid, loading state, empty state đúng theo spec
- CafeCard component render ảnh, tên, địa chỉ, rating, tags
- **Condition:** Cần chạy `run-search-uat.sh` trên môi trường local để confirm runtime behavior trước Sprint Review

### P_ID 3.0 — 多言語対応 (Đa ngôn ngữ)

**Verdict: CONDITIONAL PASS**

**根拠 / Lý do:**
- `i18n.ts` + `vi.json` + `ja.json` đều tồn tại và có đầy đủ key
- `LanguageToggle` component render dropdown để switch JP/VI
- Backend text search sử dụng `$or` across `name.ja`, `name.vi`, `description.ja`, `description.vi` — bilingual search hoạt động đúng về architecture
- Seed data có đầy đủ cả JP và VI text cho tất cả 12 cafes
- **Condition:** Cần verify UI language switch thực tế trên browser (toggle JP↔VI và kiểm tra label thay đổi)

### P_ID 4.0 — 絞り込み検索 (Lọc & tìm kiếm)

**Verdict: CONDITIONAL PASS**

**根拠 / Lý do:**
- API hỗ trợ đầy đủ: `q` (keyword), `district`, `minRating`, `tags` (AND-match), `page`/`limit`
- Tất cả filter logic trong `getCafes` đúng với spec (code review confirmed)
- SearchBar gửi `q` + `district` lên đúng params
- FilterPanel gửi `minRating` đúng
- **Known gap (UAT-F-01):** Tag filter checkboxes chưa có trong FilterPanel UI → user không thể filter by tag qua UI. API hoạt động đúng. Sprint 2 fix.
- **Condition:** Cần runtime test + UI tag filter fix

---

## Tóm tắt / まとめ

Tất cả 11 API-testable scenarios được verify qua static code review với kết quả phân tích expected PASS (không phát hiện logic error trong production code). 1 scenario (UAT-S-12) là known limitation theo Sprint 1 scope. Script `run-search-uat.sh` sẵn sàng để chạy trên môi trường có backend running.

**Next action:** Chạy `bash qa/uat-search-flow/run-search-uat.sh` trên local trước Sprint Review để confirm runtime results và cập nhật bảng này với actual PASS/FAIL.
