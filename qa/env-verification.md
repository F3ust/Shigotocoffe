# Environment Verification Checklist

> Sprint 1, Task ID 10  
> Owner: Ngoc Quy, QA Tester A  
> Branch: `feature/sprint-1-qa-completion`

---

## Purpose

Use this checklist to confirm that each developer can run Shigoto Coffee locally.

---

## Prerequisites

| Item | Requirement |
|------|------|
| OS | Windows 10/11 with WSL2 Ubuntu, macOS 13+, Ubuntu 22.04+ |
| Node.js | **>= 18.x** (LTS recommended) |
| npm | >= 9.x (bundled with Node) |
| Docker Desktop | Latest stable, with **WSL2 integration** enabled (Windows) |
| Ports free | 27017 (MongoDB), 8081 (Mongo Express), **5000** (Backend), **5173** (Frontend) |
| Shell | bash / zsh (WSL Ubuntu on Windows) |

---

## Automated Check

```bash
# From the repo root
bash qa/env-verification.sh

# Windows through WSL
wsl -d Ubuntu -- bash -c "cd '<repo-root>' && bash qa/env-verification.sh"
```

---

## Checklist

| # | Check | Command | Expected Result | Owner | Date | Status |
|---|-------|---------|-----------------|-------|------|--------|
| 1 | Node.js 18 or later | `node --version` | `v18.x.x` or later | | | ☐ |
| 2 | npm installed | `npm --version` | Version prints | | | ☐ |
| 3 | Docker CLI installed | `docker --version` | Version prints | | | ☐ |
| 4 | Docker Compose V2 installed | `docker compose version` | Version prints | | | ☐ |
| 5 | Root `.env` exists | `ls .env` | File exists | | | ☐ |
| 6 | MongoDB container is running | `docker ps \| grep shigoto-coffee-db` | Container status is `Up` | | | ☐ |
| 7 | MongoDB accepts authenticated ping | `docker exec shigoto-coffee-db mongosh --eval "db.runCommand({ping:1})" -u admin -p admin123 --authenticationDatabase admin` | `{ ok: 1 }` | | | ☐ |
| 8 | Backend dependencies installed | `ls backend/node_modules` | Directory exists | | | ☐ |
| 9 | Backend typecheck passes | `cd backend && npm run typecheck` | No TypeScript errors | | | ☐ |
| 10 | Frontend dependencies installed | `ls frontend/node_modules` | Directory exists | | | ☐ |
| 11 | Ports 5000 and 5173 are available or used by the app | `ss -tlnp \| grep -E '5000\|5173'` | Free or owned by backend/frontend | | | ☐ |

Status values: `PASS`, `FAIL`, `SKIP`, `NOT CHECKED`.

---

## Setup Steps

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

## Troubleshooting

### 1. Port conflict

**Symptom:** `Error: listen EADDRINUSE :::5000` or `:::5173`  
**Cause:** Another process already uses the port.  
**Fix:**
```bash
# Find the process on Linux/WSL
ss -tlnp | grep 5000
# Or use Windows PowerShell
netstat -ano | findstr :5000
# Kill the process by PID
kill -9 <PID>   # Linux/WSL
taskkill /PID <PID> /F   # Windows
```

---

### 2. MongoDB auth failure

**Symptom:** `MongoServerError: Authentication failed` or `connection refused`  
**Cause:** `.env` is missing or credentials do not match the running container.  
**Fix:**
```bash
# Check .env
grep MONGO .env

# Defaults from .env.example:
# MONGO_ROOT_USER=admin
# MONGO_ROOT_PASSWORD=admin123
# MONGODB_URI=mongodb://admin:admin123@localhost:27017/shigoto_coffee?authSource=admin

# Reset only local development data:
docker compose down -v
docker compose up -d
```

---

### 3. Docker Compose V1 vs V2

**Symptom:** `docker-compose: command not found` or `unknown flag: --project-name`  
**Cause:** The machine uses Compose V1 instead of Compose V2.  
**Fix:**
```bash
# Check versions
docker compose version
docker-compose --version

# Install the Compose plugin if needed
sudo apt-get install docker-compose-plugin
```

---

### 4. WSL path mount on Windows

**Symptom:** `No such file or directory` when running a command from WSL.  
**Cause:** WSL uses `/mnt/d/...`, not `D:\...`.  
**Fix:**
```bash
# Correct
wsl -d Ubuntu -- bash -c "cd '<repo-root>' && bash qa/env-verification.sh"

# Incorrect
# wsl -d Ubuntu -- bash -c "cd 'D:\path\to\repo' && ..."

# Check the mount
wsl -d Ubuntu -- ls /mnt/d/
```

---

### 5. `node_modules` missing or `npm install` fails

**Symptom:** `Cannot find module 'express'` or `sh: ts-node-dev: not found`  
**Cause:** Dependencies are missing.  
**Fix:**
```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd ../frontend
rm -rf node_modules package-lock.json
npm install

# Recheck
ls backend/node_modules | grep express
ls frontend/node_modules | grep vite
```

---

## Verification Log

Fill this in after running `bash qa/env-verification.sh`.

### Run 1

| Item | Value |
|------|------|
| Run date | 2026-05-14 |
| Runner | QA agent on WSL Ubuntu |
| Environment | WSL Ubuntu on Windows 10/11 |
| Script | `bash qa/env-verification.sh` |
| Output file | `qa/env-verification-output.txt` |

**Result details (2026-05-14 13:37:45):**

| # | Check | Status | Notes |
|---|------|------------|---------|
| 1 | Node.js >= 18 | ✓ PASS | Node.js v20.20.2 |
| 2 | npm available | ✓ PASS | npm v10.8.2 |
| 3 | Docker CLI | ✓ PASS | Docker 2 found |
| 4 | Docker Compose V2 | ✗ FAIL | `docker compose` plugin not found in WSL |
| 5 | .env file | ✓ PASS | `.env` exists at repo root |
| 6 | MongoDB container | ✗ FAIL | Container `shigoto-coffee-db` not running — `docker compose up -d` not executed |
| 7 | MongoDB ping | ⚠ SKIP | Skipped — container not running (depends on Check 6) |
| 8 | backend/node_modules | ✓ PASS | 141 packages |
| 9 | TypeScript typecheck | ✓ PASS | `npm run typecheck` — no errors |
| 10 | frontend/node_modules | ✓ PASS | 67 packages |
| 11 | Port 5000/5173 | ✓ PASS | Both ports free |

**Summary:** Total: 12 | Pass: 9 | Fail: 2 | Skip: 1

Detailed output is stored in `qa/env-verification-output.txt`. Each developer should rerun the script locally and update this log.

**Finding:** Check 4 failed because the Docker Desktop Compose plugin was not available in the QA agent WSL path. Check 6 failed because the QA session did not start Docker services.

---

### Run Template

```
Run date: ____-__-__ __:__
Runner  : _______________
Env     : OS / WSL version
Result  : Pass: __ / Fail: __ / Skip: __
Notes   :
```
