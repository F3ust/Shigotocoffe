# UAT シナリオ / Tình huống kiểm thử UAT
## 検索フロー全体の受入テスト — Kiểm thử chấp nhận toàn bộ luồng tìm kiếm

> **Sprint 1 · Task ID 14**  
> QA担当 / QA phụ trách: Quốc Khánh (QA Tester B)  
> Branch: `feature/sprint-1-qa-completion`  
> Product Backlog: P_ID 1 (店舗一覧表示), P_ID 3 (多言語対応), P_ID 4 (絞り込み検索)  
> 参照画面 / Màn hình tham chiếu: Screen 3 (ホーム ゲストユーザー向け店舗一覧)

---

## Seed Data Baseline / Dữ liệu mẫu cơ sở

DB seeded with 12 cafes. Key facts used in scenarios:

| # | Name (JP) | Name (VI) | District | Rating | Hashtags |
|---|-----------|-----------|----------|--------|---------|
| 1 | トランクイル・コーヒー | Tranquil Coffee | Hoàn Kiếm | 4.5 | wifi, quiet, noTimeLimit |
| 2 | ザ・ワークスペース | The Workspace | Ba Đình | 4.8 | wifi, outlets, quiet, japanese, noTimeLimit |
| 3 | カフェ・フォーン | Café Phương | Hoàn Kiếm | 4.2 | wifi, quiet |
| 4 | コンマ・コーヒー | Comma Coffee | Đống Đa | 4.6 | wifi, outlets, noTimeLimit |
| 5 | サクラ・カフェ | Sakura Café | Ba Đình | 4.3 | wifi, japanese, quiet |
| 6 | レイクサイド・ブリュー | Lakeside Brew | Tây Hồ | 4.0 | wifi, outlets |
| 7 | フォーカス・ラボ | Focus Lab | Cầu Giấy | 4.7 | wifi, outlets, quiet, noTimeLimit |
| 8 | グリーン・バンブー | Green Bamboo | Hai Bà Trưng | 3.9 | wifi, quiet |
| 9 | ノマド・ハブ | Nomad Hub | Đống Đa | 4.4 | wifi, outlets, noTimeLimit |
| 10 | モーニング・グローリー | Morning Glory | Ba Đình | 4.1 | wifi, outlets, quiet |
| 11 | ザ・リーディング・ルーム | The Reading Room | Đống Đa | 4.6 | wifi, quiet, noTimeLimit |
| 12 | ベトジャパン・カフェ | VietJapan Café | Ba Đình | 4.4 | wifi, outlets, japanese |

**Ba Đình cafes (4):** The Workspace, Sakura Café, Morning Glory, VietJapan Café  
**Cafes with outlets (7):** The Workspace, Comma Coffee, Lakeside Brew, Focus Lab, Nomad Hub, Morning Glory, VietJapan Café  
**Cafes with averageRating ≥ 4 (11):** All except Green Bamboo (3.9)

---

### UAT-S-01 — ゲストが店舗一覧を表示する / Khách mở danh sách quán mặc định

**Persona:** Guest user / Khách vãng lai (người Nhật làm việc remote tại Hà Nội)  
**P_ID liên quan:** P_ID 1.0 店舗一覧表示

**Pre-condition:**
- MongoDB đang chạy
- Backend dev đã start tại port 5000
- DB đã seed 12 quán mặc định (chưa modify)

**Acceptance Criteria (từ spec):**
- Danh sách quán hiển thị dưới dạng card
- Mỗi card có ảnh, tên quán, địa chỉ, điểm đánh giá trung bình, tags
- Default: tối đa 12 quán mỗi trang, phân trang được cung cấp

**Test Steps:**
1. Mở `http://localhost:5173` (hoặc gọi `GET /api/cafes`)
2. Không nhập keyword, không chọn filter nào
3. Xem danh sách hiển thị

**Expected Result:**
- HTTP 200
- `data` array có đúng 12 items
- `pagination.total = 12`, `pagination.page = 1`, `pagination.limit = 12`
- `status = "success"`
- Mỗi item có `name`, `district`, `averageRating`, `hashtags`

**Verification method:**
- API: `curl http://localhost:5000/api/cafes`
- UI: Mở http://localhost:5173, đếm số card hiển thị

**Status:** SKIPPED-env-not-ready

---

### UAT-S-02 — 日本語キーワード検索 / Tìm kiếm từ khóa tiếng Nhật

**Persona:** Guest user / Người Nhật làm việc remote tại Hà Nội  
**P_ID liên quan:** P_ID 4.0 絞り込み検索; P_ID 3.0 多言語対応

**Pre-condition:**
- MongoDB đang chạy, backend port 5000, DB seed 12 quán

**Acceptance Criteria (từ spec):**
- Có thể tìm kiếm theo từ khóa (キーワードによる検索が可能)
- Chỉ hiển thị quán phù hợp với điều kiện

**Test Steps:**
1. Nhập keyword `コーヒー` vào search bar
2. Nhấn "検索" (Search button)
3. Xem kết quả

**Expected Result:**
- HTTP 200
- Tất cả items trong `data` phải match `コーヒー` trong ít nhất một trong 4 trường: `name.ja`, `name.vi`, `description.ja`, `description.vi`
- Cụ thể: "トランクイル・コーヒー" (name.ja), "グリーン・バンブー" (description.ja: "オーガニックコーヒー")
- `pagination.total` chính xác với số kết quả thực tế

**Verification method:**
- API: `curl "http://localhost:5000/api/cafes?q=%E3%82%B3%E3%83%BC%E3%83%92%E3%83%BC"`
- UI: nhập "コーヒー" → kiểm tra tên quán hiển thị

**Status:** SKIPPED-env-not-ready

---

### UAT-S-03 — ベトナム語キーワード検索 / Tìm kiếm từ khóa tiếng Việt

**Persona:** Guest user / Người Việt hoặc người Nhật dùng chế độ tiếng Việt  
**P_ID liên quan:** P_ID 4.0 絞り込み検索; P_ID 3.0 多言語対応

**Pre-condition:**
- MongoDB đang chạy, backend port 5000, DB seed 12 quán

**Acceptance Criteria (từ spec):**
- Tìm kiếm theo từ khóa hoạt động với cả tiếng Việt
- Kết quả chứa keyword ở bất kỳ trường text nào

**Test Steps:**
1. Nhập keyword `yên tĩnh` vào search bar
2. Nhấn "Tìm kiếm"
3. Xem kết quả

**Expected Result:**
- HTTP 200
- Tất cả items match "yên tĩnh" trong name.ja / name.vi / description.ja / description.vi
- Cụ thể: Tranquil Coffee (description.vi: "Quán cà phê yên tĩnh bên Hồ Hoàn Kiếm")
- Regex case-insensitive, không phân biệt dấu theo implementation (lưu ý: `new RegExp("yên tĩnh", "i")` — regex "i" trong JS không normalize Unicode diacritics)

**Verification method:**
- API: `curl "http://localhost:5000/api/cafes?q=y%C3%AAn+t%C4%A9nh"`

**Status:** SKIPPED-env-not-ready

---

### UAT-S-04 — 一致なし → 空の結果 / Keyword không match → empty state

**Persona:** Guest user  
**P_ID liên quan:** P_ID 4.0 絞り込み検索

**Pre-condition:**
- MongoDB đang chạy, backend port 5000, DB seed 12 quán

**Acceptance Criteria (từ spec):**
- 「該当する店舗が存在しない場合、該当なしのメッセージが表示される」
- Nếu không có kết quả, hiển thị thông báo không tìm thấy

**Test Steps:**
1. Nhập keyword `xyz_nomatch_9999_uat` (không thể tồn tại)
2. Nhấn Search
3. Xem kết quả

**Expected Result:**
- API: HTTP 200 (không phải 404 — không có quán là valid state)
- `data = []` (empty array)
- `pagination.total = 0`
- UI: Hiển thị empty state component với text `t("cafe.no_results")` ("Không tìm thấy quán nào" / "カフェが見つかりませんでした")

**Verification method:**
- API: `curl "http://localhost:5000/api/cafes?q=xyz_nomatch_9999_uat"`
- UI: kiểm tra icon ☕ + message xuất hiện

**Status:** SKIPPED-env-not-ready

---

### UAT-S-05 — エリアフィルター「Ba Đình」/ Filter theo quận Ba Đình

**Persona:** Guest user muốn tìm quán gần khu vực cụ thể  
**P_ID liên quan:** P_ID 4.0 絞り込み検索

**Pre-condition:**
- MongoDB đang chạy, backend port 5000, DB seed 12 quán

**Acceptance Criteria (từ spec):**
- 「選択した地域で店舗一覧を絞り込みます」
- Lọc theo district, chỉ hiển thị quán thuộc district đó

**Test Steps:**
1. Chọn "Ba Đình" từ district dropdown trong SearchBar
2. Nhấn Search (không nhập keyword, không filter khác)
3. Xem kết quả

**Expected Result:**
- HTTP 200
- Đúng 4 quán: The Workspace, Sakura Café, Morning Glory, VietJapan Café
- Tất cả items có `district = "Ba Đình"`
- `pagination.total = 4`

**Verification method:**
- API: `curl "http://localhost:5000/api/cafes?district=Ba+%C4%90%C3%ACnh"`

**Status:** SKIPPED-env-not-ready

---

### UAT-S-06 — 評価フィルター（minRating=4）/ Filter theo đánh giá ≥ 4 sao

**Persona:** Guest user muốn tìm quán chất lượng cao  
**P_ID liên quan:** P_ID 4.0 絞り込み検索

**Pre-condition:**
- MongoDB đang chạy, backend port 5000, DB seed 12 quán

**Acceptance Criteria (từ spec):**
- 「Wi-Fi環境、コンセントの有無、静かさ、長時間滞在の可否などの条件で絞り込みが可能」
- Filter "4つ星以上" / "4 sao trở lên" hoạt động đúng

**Test Steps:**
1. Mở Filter Panel (click nút ▼)
2. Chọn checkbox "4つ星以上" (rating_4, value="4")
3. Nhấn "適用" / "Áp dụng"
4. Xem kết quả

**Expected Result:**
- HTTP 200
- 11 quán (Green Bamboo với 3.9 bị loại trừ)
- Tất cả items có `averageRating >= 4`
- `pagination.total = 11`

**Verification method:**
- API: `curl "http://localhost:5000/api/cafes?minRating=4"`

**Status:** SKIPPED-env-not-ready

---

### UAT-S-07 — 単一タグフィルター「wifi」/ Filter single tag wifi

**Persona:** Guest user cần Wi-Fi để làm việc  
**P_ID liên quan:** P_ID 4.0 絞り込み検索

**Pre-condition:**
- MongoDB đang chạy, backend port 5000, DB seed 12 quán

**Acceptance Criteria (từ spec):**
- 「Wi-Fiが強い ... などの条件で絞り込みが可能」

**Test Steps:**
1. Gọi API với `tags=wifi`
2. (UI: tick checkbox "Wi-Fi mạnh" → Apply)

**Expected Result:**
- HTTP 200
- 12 quán (tất cả đều có wifi trong seed)
- Tất cả items có `"wifi"` trong `hashtags`
- `pagination.total = 12`

**Verification method:**
- API: `curl "http://localhost:5000/api/cafes?tags=wifi"`

**Status:** SKIPPED-env-not-ready

---

### UAT-S-08 — 複数タグAND検索（wifi + outlets）/ AND-match filter wifi + outlets

**Persona:** Guest user cần cả Wi-Fi lẫn ổ cắm để sạc máy tính  
**P_ID liên quan:** P_ID 4.0 絞り込み検索

**Pre-condition:**
- MongoDB đang chạy, backend port 5000, DB seed 12 quán

**Acceptance Criteria (từ spec):**
- Tags filter là AND-match: tất cả tags phải có mặt (implementation: `$all` operator)

**Test Steps:**
1. Gọi API với `tags=wifi,outlets`
2. (UI: nếu tag checkboxes được render cho filter — hiện tại FilterPanel chưa render tag checkboxes, xem finding UAT-F-01)

**Expected Result:**
- HTTP 200
- 7 quán có cả wifi VÀ outlets: The Workspace, Comma Coffee, Lakeside Brew, Focus Lab, Nomad Hub, Morning Glory, VietJapan Café
- Tất cả items có cả `"wifi"` và `"outlets"` trong `hashtags`
- `pagination.total = 7`

**Verification method:**
- API: `curl "http://localhost:5000/api/cafes?tags=wifi%2Coutlets"`

**Status:** SKIPPED-env-not-ready

---

### UAT-S-09 — ページネーション（page=2, limit=5）/ Phân trang

**Persona:** Guest user browse nhiều quán  
**P_ID liên quan:** P_ID 1.0 店舗一覧表示

**Pre-condition:**
- MongoDB đang chạy, backend port 5000, DB seed 12 quán

**Acceptance Criteria (từ spec):**
- Danh sách phân trang chính xác

**Test Steps:**
1. Gọi `GET /api/cafes?page=2&limit=5`
2. Kiểm tra response

**Expected Result:**
- HTTP 200
- `pagination.page = 2`, `pagination.limit = 5`
- `data` có đúng 5 items (items 6-10 theo sort order)
- `pagination.total = 12`
- `pagination.totalPages = 3` (ceil(12/5) = 3)

**Verification method:**
- API: `curl "http://localhost:5000/api/cafes?page=2&limit=5"`

**Status:** SKIPPED-env-not-ready

---

### UAT-S-10 — 複合検索（キーワード + エリア + タグ）/ Tìm kiếm kết hợp

**Persona:** Guest user biết rõ nhu cầu (khu vực + tiện ích + keyword)  
**P_ID liên quan:** P_ID 4.0 絞り込み検索

**Pre-condition:**
- MongoDB đang chạy, backend port 5000, DB seed 12 quán

**Acceptance Criteria (từ spec):**
- 「指定した条件に一致する店舗のみが一覧に表示される」
- Tất cả điều kiện được AND-combine

**Test Steps:**
1. Gọi API với `q=workspace&district=Ba Đình&tags=wifi`
2. Kiểm tra tất cả điều kiện đều được áp dụng đồng thời

**Expected Result:**
- HTTP 200
- Tất cả items phải: chứa "workspace" trong text fields, có district="Ba Đình", có tag "wifi"
- Cụ thể: "The Workspace" / "ザ・ワークスペース" thỏa mãn tất cả (Ba Đình, wifi, name.vi="The Workspace")
- Không có item nào vi phạm bất kỳ điều kiện nào

**Verification method:**
- API: `curl "http://localhost:5000/api/cafes?q=workspace&district=Ba+D%C3%ACnh&tags=wifi"`
  (Note: district "Ba Đình" = "Ba+%C4%90%C3%ACnh" URL-encoded)

**Status:** SKIPPED-env-not-ready

---

### UAT-S-11 — ソート順（averageRating 降順）/ Thứ tự sắp xếp

**Persona:** Guest user muốn thấy quán tốt nhất đầu tiên  
**P_ID liên quan:** P_ID 1.0 店舗一覧表示

**Pre-condition:**
- MongoDB đang chạy, backend port 5000, DB seed 12 quán

**Acceptance Criteria (từ spec):**
- Implementation: `sort({ averageRating: -1, createdAt: -1 })` trong `getCafes`

**Test Steps:**
1. Gọi `GET /api/cafes?limit=12` (lấy tất cả)
2. Kiểm tra thứ tự của `data` array

**Expected Result:**
- Quán đầu tiên: "ザ・ワークスペース" / "The Workspace" với `averageRating = 4.8` (cao nhất)
- Thứ tự tiếp theo (từ seed data, sort by rating desc):
  4.8 → 4.7 → 4.6 / 4.6 → 4.5 → 4.4 / 4.4 → 4.3 → 4.2 → 4.1 → 4.0 → 3.9
- Với tie (4.6: Comma Coffee vs Reading Room; 4.4: Nomad Hub vs VietJapan), thứ tự phụ theo `createdAt` desc (phụ thuộc DB insertion order)
- Toàn bộ array `averageRating` là non-increasing

**Verification method:**
- API: `curl "http://localhost:5000/api/cafes?limit=12" | jq '[.data[].averageRating]'`

**Status:** SKIPPED-env-not-ready

---

### UAT-S-12 — UIカード選択 → 詳細画面遷移 / Click card → chuyển trang chi tiết

**Persona:** Guest user muốn xem chi tiết một quán  
**P_ID liên quan:** P_ID 5.0 店舗詳細表示 (Screen 4 — out of Sprint 1 scope)

**Pre-condition:**
- Frontend dev tại port 5173
- Ít nhất 1 quán hiển thị trong danh sách

**Acceptance Criteria (từ spec):**
- Screen 3 item 4.0: 「各構成要素は画面ID5と同様のロジックで表示・操作される」
- Click card → chuyển sang Screen 4 (店舗詳細画面)

**Test Steps:**
1. Mở http://localhost:5173
2. Click vào bất kỳ CafeCard nào trong danh sách

**Expected Result (theo spec):**
- Chuyển hướng sang trang chi tiết quán (Screen 4)
- Hiển thị thông tin chi tiết: tên, đánh giá, giờ mở cửa, mô tả, hashtags, địa chỉ

**Sprint 1 Actual Behavior:**
- **Known limitation per Sprint 1 scope / POT合意済み**
- CafeCard component chưa implement onClick navigation
- Detail page (Screen 4) chưa được xây dựng trong Sprint 1
- Behavior hiện tại: no-op hoặc placeholder

> ⚠️ **Status: SKIPPED-known-limitation**  
> Không mark FAIL. Theo thỏa thuận Sprint 1, P_ID 5 (店舗詳細表示) nằm ngoài scope của sprint này. Sẽ được implement và test trong Sprint 2.

---

## Tổng hợp / Summary

| ID | Scenario | Type | Status |
|----|----------|------|--------|
| UAT-S-01 | Default list 12 cafes | Happy | SKIPPED-env-not-ready |
| UAT-S-02 | JP keyword search "コーヒー" | Happy bilingual | SKIPPED-env-not-ready |
| UAT-S-03 | VI keyword search "yên tĩnh" | Happy bilingual | SKIPPED-env-not-ready |
| UAT-S-04 | No-match → empty state | Edge | SKIPPED-env-not-ready |
| UAT-S-05 | District filter "Ba Đình" | Happy | SKIPPED-env-not-ready |
| UAT-S-06 | minRating=4 filter | Happy | SKIPPED-env-not-ready |
| UAT-S-07 | Single tag filter "wifi" | Happy | SKIPPED-env-not-ready |
| UAT-S-08 | AND-match tags wifi+outlets | Happy compound | SKIPPED-env-not-ready |
| UAT-S-09 | Pagination page=2&limit=5 | Happy | SKIPPED-env-not-ready |
| UAT-S-10 | Compound search (q+district+tags) | Happy compound | SKIPPED-env-not-ready |
| UAT-S-11 | Sort by averageRating desc | Happy | SKIPPED-env-not-ready |
| UAT-S-12 | UI: Click card → detail page | Known limitation | SKIPPED-known-limitation |
