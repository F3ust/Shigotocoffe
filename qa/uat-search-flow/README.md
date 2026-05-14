# UAT 検索フロー / UAT Luồng Tìm Kiếm
## 仕事コーヒー (Shigoto Coffee) — Sprint 1

---

## 概要 / Tổng quan

| 項目 | 値 |
|------|----|
| Sprint | Sprint 1 |
| Task ID | 14 |
| タスク名 / Tên task | `[QA] 検索フロー全体の受入テスト（UAT）` |
| QA担当 / QA phụ trách | Quốc Khánh (QA Tester B, Sonnet 4.6) |
| 見積もり / Ước tính | 3h |

検索フロー全体（キーワード検索・エリアフィルター・評価フィルター・タグフィルター・ページネーション・ソート）を対象とした受入テスト（UAT）です。  
Kiểm thử chấp nhận (UAT) cho toàn bộ luồng tìm kiếm bao gồm: tìm kiếm từ khóa song ngữ, lọc theo khu vực / đánh giá / hashtag, phân trang và thứ tự sắp xếp.

---

## Phạm vi / スコープ

**Product Backlog liên quan:**
- **P_ID 1** — 店舗一覧表示 (Danh sách quán dạng card)
- **P_ID 3** — 多言語対応 (Hỗ trợ JP/VI)
- **P_ID 4** — 絞り込み検索 (Lọc và tìm kiếm)

**参照画面 / Màn hình tham chiếu:** Screen 3 — ホーム（ゲストユーザー向け店舗一覧）

**Out of scope (Sprint 1):**
- P_ID 5 — 店舗詳細 (detail page, UAT-S-12: known limitation)
- Geolocation / distance filter (API chưa implement)
- Tag checkboxes trong FilterPanel UI (UAT-F-01: finding documented)

---

## Cấu trúc folder / フォルダー構造

```
qa/uat-search-flow/
├── README.md              ← Tài liệu này
├── scenarios.md           ← 12 UAT scenarios chi tiết (song ngữ JP/VI)
├── execution-log.md       ← Kết quả thực thi, findings, Sprint 1 verdict
├── run-search-uat.sh      ← Script chạy auto UAT-S-01 → UAT-S-11 qua API
└── lib/
    └── extra-assert.sh    ← Helper functions bổ sung (collection-level checks)
```

---

## Cách chạy / 実行方法

### Pre-conditions

1. **MongoDB đang chạy:**
   ```bash
   docker compose up -d
   ```
2. **Backend đang chạy** (port 5000):
   ```bash
   cd backend && npm run dev
   ```
3. **DB đã được seed:**
   ```bash
   cd backend && npm run seed
   ```
4. **`jq` đã cài:**
   ```bash
   # Ubuntu/WSL
   sudo apt-get install -y jq
   ```

### Chạy UAT script

```bash
# Từ root repo
bash qa/uat-search-flow/run-search-uat.sh

# Capture output
bash qa/uat-search-flow/run-search-uat.sh 2>&1 | tee qa/uat-search-flow/execution-output.txt

# Override base URL
API_BASE=http://localhost:5000/api bash qa/uat-search-flow/run-search-uat.sh
```

### Chạy trong WSL (Windows)

```powershell
wsl -d Ubuntu -- bash -c "cd '/mnt/d/仕事コーヒー' && bash qa/uat-search-flow/run-search-uat.sh"
```

---

## Tham chiếu Tester A / Tester A 参照

Script này sử dụng assert helpers từ Tester A (Ngọc Quý, Task ID 9):

```
qa/be-crud-tests/lib/assert.sh
```

Functions tái sử dụng: `assert_status_code`, `assert_json_field`, `assert_json_not_null`, `assert_json_array_not_empty`, `assert_json_number_gte`, `print_summary`.

`lib/extra-assert.sh` trong folder này bổ sung các helpers dành cho collection-level checks (không sửa file của Tester A):
- `assert_json_array_length` — check exact count
- `assert_json_array_length_gte` — check minimum count
- `assert_all_field_equal` — verify all items have same field value
- `assert_all_field_gte` — verify all items have numeric field >= min
- `assert_all_contain_tag` — verify all items have specific hashtag
- `assert_sorted_desc` — verify array sorted descending by field
- `assert_text_match_any` — verify all items match keyword in bilingual text fields

---

## Liên hệ / 関連情報

| Mục | Chi tiết |
|-----|----------|
| Product Backlog P_ID 1, 3, 4 | Sprint 1 acceptance criteria |
| Screen 3 (spec) | ホーム ゲストユーザー向け店舗一覧 |
| Tester A artifacts | `qa/be-crud-tests/` (Task ID 9, Ngọc Quý) |
| BE logic | `backend/src/controllers/cafeController.ts` → `getCafes` |
| Seed data | `backend/src/seeds/cafeSeedData.ts` (12 cafes) |
| FE search | `frontend/src/pages/HomePage.tsx`, `SearchBar.tsx`, `FilterPanel.tsx` |
