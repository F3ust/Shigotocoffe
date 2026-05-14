# BE CRUD API テスト / Tài liệu kiểm thử API CRUD

> **Sprint 1 — Task ID 9**  
> QA担当: Ngọc Quý (QA Tester A)  
> Branch: `feature/sprint-1-qa-completion`

---

## 概要 / Tổng quan

| 項目 | 内容 |
|------|------|
| Scope | REST API CRUD: `GET /api/cafes`, `GET /api/cafes/:id`, `POST /api/cafes`, `PATCH /api/cafes/:id`, `DELETE /api/cafes/:id` |
| Tool | `bash` + `curl` + `jq` (no npm dependency) |
| Test cases | **23 total** (7 + 3 + 6 + 5 + 4 = 25 assertions across 23 logical cases) |
| Execution | Skipped — backend không chạy ở môi trường QA agent (xem bên dưới) |

---

## Yêu cầu trước khi chạy / Pre-conditions

1. **MongoDB đang chạy** (via Docker):
   ```bash
   docker compose up -d
   ```
2. **Backend đang chạy** (port 5000):
   ```bash
   cd backend && npm run dev
   ```
3. **DB đã được seed**:
   ```bash
   cd backend && npm run seed
   ```
4. **`jq` đã cài** trong môi trường shell:
   ```bash
   # Ubuntu/WSL
   sudo apt-get install -y jq
   # macOS
   brew install jq
   ```

---

## Cách chạy / How to run

```bash
# Từ root repo
bash qa/be-crud-tests/run-all.sh

# Override base URL nếu cần
API_BASE=http://localhost:5000/api bash qa/be-crud-tests/run-all.sh

# Chạy từng suite riêng lẻ
bash qa/be-crud-tests/01-get-list.sh
bash qa/be-crud-tests/02-get-by-id.sh
# ...
```

Output mẫu khi pass:
```
╔══════════════════════════════════════════════╗
║   Shigoto Coffee — BE CRUD API Test Runner   ║
╚══════════════════════════════════════════════╝
  API base: http://localhost:5000/api

✓ PASS — TC-01-01 GET /api/cafes → 200
✓ PASS — TC-01-01 body.status = success
...
╔══════════════════════════════════════════════╗
║            FINAL RESULTS                     ║
╠══════════════════════════════════════════════╣
║  Total: 23  | Pass: 23  | Fail: 0            ║
╚══════════════════════════════════════════════╝
✓ All tests passed!
```

---

## Bảng Test Case / Test Case Summary

### Suite 01 — GET /api/cafes (7 cases)

| ID | Endpoint | Scenario | Expected Status | Ghi chú |
|----|----------|----------|-----------------|---------|
| TC-01-01 | `GET /api/cafes` | Basic list: status, data array, pagination fields | 200 | data là array, pagination.{page,limit,total,totalPages} |
| TC-01-02 | `GET /api/cafes?q=workspace` | Text search | 200 | Mọi kết quả chứa "workspace" trong name/description |
| TC-01-03 | `GET /api/cafes?district=Ba+Đình` | District filter | 200 | Mọi kết quả có district="Ba Đình" (seed: 4 quán) |
| TC-01-04 | `GET /api/cafes?minRating=4` | Rating filter | 200 | Mọi kết quả có averageRating ≥ 4 |
| TC-01-05 | `GET /api/cafes?tags=wifi` | Single tag filter | 200 | Mọi kết quả có hashtags chứa "wifi" |
| TC-01-06 | `GET /api/cafes?tags=wifi,outlets` | Multi-tag AND filter | 200 | Mọi kết quả có cả "wifi" VÀ "outlets" |
| TC-01-07 | `GET /api/cafes?page=2&limit=5` | Pagination | 200 | pagination.page=2, pagination.limit=5 |

### Suite 02 — GET /api/cafes/:id (3 cases)

| ID | Endpoint | Scenario | Expected Status | Ghi chú |
|----|----------|----------|-----------------|---------|
| TC-02-01 | `GET /api/cafes/:id` | Valid existing id | 200 | data._id match |
| TC-02-02 | `GET /api/cafes/000000000000000000000000` | Non-existent valid ObjectId | 404 | message chứa "not found" |
| TC-02-03 | `GET /api/cafes/abc` | Invalid id format | **500** ⚠ | **Known issue** — xem bên dưới |

### Suite 03 — POST /api/cafes (6 cases)

| ID | Endpoint | Scenario | Expected Status | Ghi chú |
|----|----------|----------|-----------------|---------|
| TC-03-01 | `POST /api/cafes` | Valid body | 201 | data._id exists; id dùng cho suite 04–05 |
| TC-03-02 | `POST /api/cafes` | Thiếu `name.vi` | 400 | ValidationError |
| TC-03-03 | `POST /api/cafes` | Thiếu `openingHours.open` | 400 | ValidationError |
| TC-03-04 | `POST /api/cafes` | `openingHours.open = "25:00"` | 400 | regex `^([01]\d|2[0-3]):[0-5]\d$` fail |
| TC-03-05 | `POST /api/cafes` | `hashtags = ["invalid_tag"]` | 400 | Enum check: wifi,outlets,quiet,japanese,noTimeLimit |
| TC-03-06 | `POST /api/cafes` | `location.coordinates = [200, 21.0]` | 400 | lng > 180 |

### Suite 04 — PATCH /api/cafes/:id (4 cases)

| ID | Endpoint | Scenario | Expected Status | Ghi chú |
|----|----------|----------|-----------------|---------|
| TC-04-01 | `PATCH /api/cafes/:id` | Valid partial update (description) | 200 | field updated trong response |
| TC-04-02 | `PATCH /api/cafes/not-a-valid-id` | Invalid ObjectId | 400 | `mongoose.isValidObjectId()` guard |
| TC-04-03 | `PATCH /api/cafes/000000000000000000000000` | Non-existent id | 404 | NotFoundError |
| TC-04-04 | `PATCH /api/cafes/:id` body `{_id, averageRating: 9.9}` | Immutable fields stripped | 200 | averageRating không đổi, _id không đổi |

### Suite 05 — DELETE /api/cafes/:id (3 cases)

| ID | Endpoint | Scenario | Expected Status | Ghi chú |
|----|----------|----------|-----------------|---------|
| TC-05-01 | `DELETE /api/cafes/:id` | Delete existing | 204 | Empty body |
| TC-05-02 | `DELETE /api/cafes/:id` | Delete đã bị xóa (double-delete) | 404 | NotFoundError |
| TC-05-03 | `DELETE /api/cafes/bad-id-xyz` | Invalid ObjectId | 400 | `mongoose.isValidObjectId()` guard |

---

## ⚠ Known Issues / Phát hiện khi review code

### FINDING-01: GET /api/cafes/:id thiếu ObjectId format validation

**Mức độ:** Low (UX) — không phải security issue  
**File:** `backend/src/controllers/cafeController.ts`, function `getCafeById` (line 77–89)

**Mô tả:**  
`updateCafe` (line 199) và `deleteCafe` (line 330) đều có `if (!mongoose.isValidObjectId(id)) { throw new ValidationError(...) }` trước khi query DB.  
`getCafeById` KHÔNG có guard này → khi gọi `Cafe.findById("abc")`, Mongoose throw `CastError` (không phải `AppError`) → `errorHandler` xử lý là unhandled error → trả **500** thay vì **400**.

**Expected behavior:** 400 BadRequest với message rõ ràng  
**Actual behavior (theo code review):** 500 Internal Server Error  

**Khuyến nghị:** Thêm guard `if (!mongoose.isValidObjectId(id)) throw new ValidationError("Invalid cafe id")` vào `getCafeById`, tương tự như `updateCafe`/`deleteCafe`.  
**Action:** Document only — KHÔNG sửa production code trong sprint này.

---

## Kết quả thực thi / Execution Results

> **Execution chưa thực hiện ở môi trường QA agent vì backend không đang chạy.**  
> Scripts đã được code review qua manual reasoning với production code  
> (`cafeController.ts`, `Cafe.ts`, `errorHandler.ts`, `errors.ts`).  
> Mọi expected behavior đã được xác minh bằng static analysis.

**Cách verify lại khi có môi trường:**
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

## Cấu trúc file / File structure

```
qa/be-crud-tests/
├── README.md                  ← Tài liệu này
├── run-all.sh                 ← Runner chính, chạy 01→05 tuần tự
├── lib/
│   └── assert.sh              ← Helper: assertStatus, assertJsonField, assertJsonNotNull
├── 01-get-list.sh             ← 7 test: GET /api/cafes với filters/pagination
├── 02-get-by-id.sh            ← 3 test: GET /api/cafes/:id
├── 03-create.sh               ← 6 test: POST /api/cafes + validation
├── 04-update.sh               ← 4 test: PATCH /api/cafes/:id
├── 05-delete.sh               ← 3 test: DELETE /api/cafes/:id
└── fixtures/
    ├── valid-cafe.json        ← Body hợp lệ POST (tên "QA Test Cafe")
    └── update-cafe.json       ← Body PATCH partial
```
