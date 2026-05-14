# 環境検証チェックリスト / Danh mục kiểm tra môi trường

> **Sprint 1 — Task ID 10**  
> QA担当 / Phụ trách QA: Ngọc Quý (QA Tester A)  
> Branch: `feature/sprint-1-qa-completion`

---

## 目的 / Mục tiêu

本チェックリストは、チームメンバー全員のローカル開発環境が仕事コーヒープロジェクトの要件を満たしていることを検証するためのものです。

Danh mục này dùng để xác minh rằng môi trường phát triển cục bộ của mọi thành viên đều đáp ứng yêu cầu của dự án 仕事コーヒー.

---

## 前提条件 / Pre-requisites

| 項目 | 要件 |
|------|------|
| OS | Windows 10/11 with WSL2 Ubuntu, macOS 13+, Ubuntu 22.04+ |
| Node.js | **>= 18.x** (LTS recommended) |
| npm | >= 9.x (bundled with Node) |
| Docker Desktop | Latest stable, with **WSL2 integration** enabled (Windows) |
| Ports free | 27017 (MongoDB), 8081 (Mongo Express), **5000** (Backend), **5173** (Frontend) |
| Shell | bash / zsh (WSL Ubuntu on Windows) |

---

## 自動検証スクリプト / Script tự động

```bash
# Từ root repo (WSL / macOS / Linux)
bash qa/env-verification.sh

# Windows: WSL経由で実行
wsl -d Ubuntu -- bash -c "cd '/mnt/d/仕事コーヒー' && bash qa/env-verification.sh"
```

---

## チェック一覧 / Bảng kiểm tra

| # | 項目 (JP) | Mục (VI) | Cách kiểm tra | 期待結果 | 確認者 | 確認日 | ステータス |
|---|-----------|-----------|---------------|----------|--------|--------|------------|
| 1 | Node.js バージョン >= 18 | Node.js phiên bản >= 18 | `node --version` | `v18.x.x` 以上 | | | ☐ |
| 2 | npm が利用可能 | npm khả dụng | `npm --version` | `9.x.x` 以上 | | | ☐ |
| 3 | Docker CLI が利用可能 | Docker CLI khả dụng | `docker --version` | バージョン表示 / Hiện version | | | ☐ |
| 4 | Docker Compose V2 | Docker Compose V2 | `docker compose version` | `v2.x.x` 表示 | | | ☐ |
| 5 | `.env` ファイル存在 | File `.env` tồn tại | `ls .env` at repo root | ファイルあり / Tồn tại | | | ☐ |
| 6 | MongoDB コンテナ起動中 | Container MongoDB chạy | `docker ps \| grep shigoto-coffee-db` | `Up` 表示 | | | ☐ |
| 7 | MongoDB 接続確認 | Kết nối MongoDB OK | `docker exec shigoto-coffee-db mongosh --eval "db.runCommand({ping:1})" -u admin -p admin123 --authenticationDatabase admin` | `{ ok: 1 }` | | | ☐ |
| 8 | `backend/node_modules` 存在 | `backend/node_modules` tồn tại | `ls backend/node_modules` | ディレクトリあり / Thư mục tồn tại | | | ☐ |
| 9 | TypeScript 型検査 | Kiểm tra kiểu TypeScript | `cd backend && npm run typecheck` | エラーなし / Không lỗi | | | ☐ |
| 10 | `frontend/node_modules` 存在 | `frontend/node_modules` tồn tại | `ls frontend/node_modules` | ディレクトリあり / Thư mục tồn tại | | | ☐ |
| 11 | ポート 5000 / 5173 | Cổng 5000 / 5173 | `ss -tlnp \| grep -E '5000\|5173'` | 空き / Rảnh (または正しいプロセス) | | | ☐ |

**ステータス凡例 / Ký hiệu trạng thái:** `✓ PASS` / `✗ FAIL` / `⚠ SKIP` / `☐ 未確認`

---

## セットアップ手順 / Hướng dẫn thiết lập (nếu chưa sẵn sàng)

```bash
# 1. Copy .env from example
cp .env.example .env

# 2. Start MongoDB (Docker)
docker compose up -d

# 3. Install backend dependencies
cd backend && npm install

# 4. Install frontend dependencies
cd ../frontend && npm install

# 5. Seed database
cd ../backend && npm run seed

# 6. Start backend (port 5000)
npm run dev

# 7. Start frontend (new terminal, port 5173)
cd ../frontend && npm run dev
```

---

## トラブルシューティング / Xử lý sự cố

### 問題 1 / Vấn đề 1: Port conflict (ポート競合)

**現象 / Triệu chứng:** `Error: listen EADDRINUSE :::5000` hoặc `:::5173`  
**原因 / Nguyên nhân:** Một process khác đang dùng port  
**解決策 / Giải pháp:**
```bash
# Tìm process đang dùng port (Linux/WSL)
ss -tlnp | grep 5000
# Hoặc trên Windows PowerShell
netstat -ano | findstr :5000
# Kill process theo PID
kill -9 <PID>   # Linux/WSL
taskkill /PID <PID> /F   # Windows
```

---

### 問題 2 / Vấn đề 2: MongoDB auth failure

**現象 / Triệu chứng:** `MongoServerError: Authentication failed` hoặc `connection refused`  
**原因 / Nguyên nhân:** `.env` chưa được copy, hoặc credentials sai  
**解決策 / Giải pháp:**
```bash
# Kiểm tra .env tồn tại và đúng giá trị
cat .env | grep MONGO

# Giá trị mặc định từ .env.example:
# MONGO_ROOT_USER=admin
# MONGO_ROOT_PASSWORD=admin123
# MONGODB_URI=mongodb://admin:admin123@localhost:27017/shigoto_coffee?authSource=admin

# Nếu container đã chạy với cấu hình cũ, reset:
docker compose down -v   # XÓA VOLUME — mất data!
docker compose up -d
```

---

### 問題 3 / Vấn đề 3: Docker Compose V1 vs V2

**現象 / Triệu chứng:** `docker-compose: command not found` hoặc `unknown flag: --project-name`  
**原因 / Nguyên nhân:** Dùng `docker-compose` (V1) thay vì `docker compose` (V2)  
**解決策 / Giải pháp:**
```bash
# Kiểm tra phiên bản
docker compose version   # V2 — ĐÚNG
docker-compose --version # V1 — CŨ

# Nâng cấp Docker Desktop lên bản mới nhất (>= 3.6 đã bundle Compose V2)
# Hoặc cài compose plugin thủ công:
sudo apt-get install docker-compose-plugin
```

---

### 問題 4 / Vấn đề 4: WSL path mount (Windows)

**現象 / Triệu chứng:** `No such file or directory` khi chạy từ WSL với đường dẫn Windows  
**原因 / Nguyên nhân:** Windows path (`D:\`) cần được mount thành `/mnt/d/` trong WSL  
**解決策 / Giải pháp:**
```bash
# ĐÚNG — dùng WSL path
wsl -d Ubuntu -- bash -c "cd '/mnt/d/仕事コーヒー' && bash qa/env-verification.sh"

# SAI — không dùng Windows path trực tiếp trong WSL
# wsl -d Ubuntu -- bash -c "cd 'D:\仕事コーヒー' && ..."

# Kiểm tra mount
wsl -d Ubuntu -- ls /mnt/d/
```

---

### 問題 5 / Vấn đề 5: node_modules missing / npm install fails

**現象 / Triệu chứng:** `Cannot find module 'express'` hoặc `sh: ts-node-dev: not found`  
**原因 / Nguyên nhân:** Dependencies chưa được cài  
**解決策 / Giải pháp:**
```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd ../frontend
rm -rf node_modules package-lock.json
npm install

# Kiểm tra lại
ls backend/node_modules | grep express
ls frontend/node_modules | grep vite
```

---

## 検証ログ / Verification Log

> Điền vào sau khi chạy `bash qa/env-verification.sh`.  
> スクリプト実行後に記入してください。

### 実行記録 1 / Lần chạy 1

| 項目 | 内容 |
|------|------|
| 実行日時 / Ngày chạy | 2026-05-14 |
| 実行者 / Người chạy | QA agent (WSL Ubuntu — tự động bởi CI QA pipeline) |
| 実行環境 / Môi trường | WSL Ubuntu on Windows 10/11 (QA agent environment) |
| スクリプト / Script | `bash qa/env-verification.sh` |
| 結果ファイル / File kết quả | `qa/env-verification-output.txt` |

**結果詳細 / Chi tiết kết quả (実行日: 2026-05-14 13:37:45):**

| # | 項目 | ステータス | Ghi chú |
|---|------|------------|---------|
| 1 | Node.js >= 18 | ✓ PASS | Node.js v20.20.2 |
| 2 | npm available | ✓ PASS | npm v10.8.2 |
| 3 | Docker CLI | ✓ PASS | Docker 2 found |
| 4 | Docker Compose V2 | ✗ FAIL | `docker compose` plugin not found in WSL — Docker Desktop compose plugin not wired into WSL PATH |
| 5 | .env file | ✓ PASS | `.env` exists at repo root |
| 6 | MongoDB container | ✗ FAIL | Container `shigoto-coffee-db` not running — `docker compose up -d` not executed |
| 7 | MongoDB ping | ⚠ SKIP | Skipped — container not running (depends on Check 6) |
| 8 | backend/node_modules | ✓ PASS | 141 packages |
| 9 | TypeScript typecheck | ✓ PASS | `npm run typecheck` — no errors |
| 10 | frontend/node_modules | ✓ PASS | 67 packages |
| 11 | Port 5000/5173 | ✓ PASS | Both ports free |

**総合 / Tổng kết:** Total: 12 | Pass: 9 | Fail: 2 | Skip: 1

> **注意 / Lưu ý:** Kết quả chi tiết được lưu trong `qa/env-verification-output.txt`.  
> Thành viên hãy điền lại bảng này sau khi chạy trên môi trường cục bộ của mình.

**Phát hiện / 発見事項:** Check 4 FAIL là do Docker Desktop Compose plugin chưa được đăng ký vào WSL PATH trong môi trường QA agent. Trên máy developer thực tế có Docker Desktop đầy đủ, `docker compose` V2 sẽ hoạt động bình thường. Check 6 FAIL vì `docker compose up -d` chưa được chạy trong phiên QA này.

---

### 実行記録テンプレート / Template cho các lần chạy tiếp theo

```
実行日時: ____-__-__ __:__
実行者  : _______________
環境    : OS/WSL version
結果    : Pass: __ / Fail: __ / Skip: __
備考    : 
```
