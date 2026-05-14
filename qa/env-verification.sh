#!/usr/bin/env bash
# env-verification.sh — Shigoto Coffee ローカル環境検証スクリプト
# Kiểm tra môi trường phát triển cục bộ cho dự án 仕事コーヒー
#
# Usage: bash qa/env-verification.sh
# Exit code: 0 = all hard checks passed, 1 = one or more hard checks failed

set -uo pipefail

# ── Colors ──────────────────────────────────────────────────────────────────
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# ── Counters ─────────────────────────────────────────────────────────────────
PASS_COUNT=0
FAIL_COUNT=0
SKIP_COUNT=0
HARD_FAIL=0   # Exit code driver — only incremented for blocking failures

pass()  { PASS_COUNT=$((PASS_COUNT+1));  echo -e "  ${GREEN}✓ PASS${NC}  $1"; }
fail()  { FAIL_COUNT=$((FAIL_COUNT+1));  echo -e "  ${RED}✗ FAIL${NC}  $1"; echo -e "         ${YELLOW}→ $2${NC}"; }
skip()  { SKIP_COUNT=$((SKIP_COUNT+1));  echo -e "  ${YELLOW}⚠ SKIP${NC}  $1"; echo -e "         $2"; }
hfail() { FAIL_COUNT=$((FAIL_COUNT+1)); HARD_FAIL=$((HARD_FAIL+1)); echo -e "  ${RED}✗ FAIL${NC}  $1"; echo -e "         ${YELLOW}→ $2${NC}"; }

# ── Header ───────────────────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║   仕事コーヒー — Environment Verification Script             ║${NC}"
echo -e "${CYAN}║   Kiểm tra môi trường phát triển cục bộ                      ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo "  Date    : $(date '+%Y-%m-%d %H:%M:%S')"
echo "  Host    : $(hostname)"
echo "  Shell   : $BASH_VERSION"
echo ""

# ── Resolve repo root ────────────────────────────────────────────────────────
# Script lives at qa/env-verification.sh; repo root = one level up
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
echo "  Repo    : ${REPO_ROOT}"
echo ""

# ────────────────────────────────────────────────────────────────────────────
# CHECK 1 — Node.js >= 18
# ────────────────────────────────────────────────────────────────────────────
echo "──────────────────────────────────────────────────────────────"
echo " [1/11] Node.js >= 18"
if command -v node &>/dev/null; then
  NODE_VER=$(node --version 2>/dev/null | sed 's/v//')
  NODE_MAJOR=$(echo "$NODE_VER" | cut -d. -f1)
  if [ "$NODE_MAJOR" -ge 18 ] 2>/dev/null; then
    pass "Node.js v${NODE_VER} (>= 18 required)"
  else
    hfail "Node.js v${NODE_VER} is too old" "Install Node.js 18+: https://nodejs.org/ or use nvm"
  fi
else
  hfail "Node.js not found" "Install Node.js 18+: https://nodejs.org/ or nvm install 18"
fi

# ────────────────────────────────────────────────────────────────────────────
# CHECK 2 — npm available
# ────────────────────────────────────────────────────────────────────────────
echo ""
echo "──────────────────────────────────────────────────────────────"
echo " [2/11] npm available"
if command -v npm &>/dev/null; then
  NPM_VER=$(npm --version 2>/dev/null)
  pass "npm v${NPM_VER} found"
else
  hfail "npm not found" "npm comes bundled with Node.js — reinstall Node.js"
fi

# ────────────────────────────────────────────────────────────────────────────
# CHECK 3 — Docker CLI available
# ────────────────────────────────────────────────────────────────────────────
echo ""
echo "──────────────────────────────────────────────────────────────"
echo " [3/11] Docker CLI available"
if command -v docker &>/dev/null; then
  DOCKER_VER=$(docker --version 2>/dev/null | grep -oP '[\d.]+' | head -1)
  pass "Docker ${DOCKER_VER} found"
else
  hfail "docker CLI not found" "Install Docker Desktop: https://www.docker.com/products/docker-desktop"
fi

# ────────────────────────────────────────────────────────────────────────────
# CHECK 4 — Docker Compose V2
# ────────────────────────────────────────────────────────────────────────────
echo ""
echo "──────────────────────────────────────────────────────────────"
echo " [4/11] Docker Compose V2 (docker compose)"
if docker compose version &>/dev/null 2>&1; then
  DC_VER=$(docker compose version 2>/dev/null | grep -oP '[\d.]+' | head -1)
  pass "docker compose v${DC_VER} (V2) found"
else
  fail "docker compose V2 not found" \
    "Use 'docker compose' (V2), not 'docker-compose' (V1). Upgrade Docker Desktop."
fi

# ────────────────────────────────────────────────────────────────────────────
# CHECK 5 — .env file exists at repo root
# ────────────────────────────────────────────────────────────────────────────
echo ""
echo "──────────────────────────────────────────────────────────────"
echo " [5/11] .env file at repo root"
if [ -f "${REPO_ROOT}/.env" ]; then
  pass ".env found at ${REPO_ROOT}/.env"
else
  fail ".env not found" \
    "Run: cp ${REPO_ROOT}/.env.example ${REPO_ROOT}/.env  (then fill in your values)"
fi

# ────────────────────────────────────────────────────────────────────────────
# CHECK 6 — MongoDB container running
# Container name from docker-compose.yml: shigoto-coffee-db
# ────────────────────────────────────────────────────────────────────────────
echo ""
echo "──────────────────────────────────────────────────────────────"
MONGO_CONTAINER="shigoto-coffee-db"
echo " [6/11] MongoDB container '${MONGO_CONTAINER}' running"
if command -v docker &>/dev/null; then
  if docker ps --format '{{.Names}}' 2>/dev/null | grep -q "^${MONGO_CONTAINER}$"; then
    MONGO_STATUS=$(docker ps --filter "name=^${MONGO_CONTAINER}$" --format '{{.Status}}' 2>/dev/null)
    pass "Container '${MONGO_CONTAINER}' is running (${MONGO_STATUS})"
  else
    fail "Container '${MONGO_CONTAINER}' is not running" \
      "Start MongoDB: cd ${REPO_ROOT} && docker compose up -d"
  fi
else
  skip "Docker not available" "Cannot check container status — install Docker Desktop first"
fi

# ────────────────────────────────────────────────────────────────────────────
# CHECK 7 — MongoDB connection (ping via mongosh)
# ────────────────────────────────────────────────────────────────────────────
echo ""
echo "──────────────────────────────────────────────────────────────"
echo " [7/11] MongoDB connection ping"
if command -v docker &>/dev/null && docker ps --format '{{.Names}}' 2>/dev/null | grep -q "^${MONGO_CONTAINER}$"; then
  PING_RESULT=$(docker exec "${MONGO_CONTAINER}" \
    mongosh --quiet --eval "db.runCommand({ping:1})" \
    -u admin -p admin123 --authenticationDatabase admin 2>&1 || true)
  if echo "$PING_RESULT" | grep -q '"ok".*1\|ok:.*1'; then
    pass "MongoDB ping OK (authenticated as admin)"
  else
    fail "MongoDB ping failed" \
      "Check MONGO_ROOT_USER/MONGO_ROOT_PASSWORD in .env. Got: ${PING_RESULT}"
  fi
else
  skip "MongoDB container not running" "Run Check 6 first: docker compose up -d"
fi

# ────────────────────────────────────────────────────────────────────────────
# CHECK 8 — backend/node_modules exists
# ────────────────────────────────────────────────────────────────────────────
echo ""
echo "──────────────────────────────────────────────────────────────"
echo " [8/11] backend/node_modules installed"
if [ -d "${REPO_ROOT}/backend/node_modules" ]; then
  NM_COUNT=$(ls "${REPO_ROOT}/backend/node_modules" | wc -l | tr -d ' ')
  pass "backend/node_modules found (${NM_COUNT} packages)"
else
  fail "backend/node_modules not found" \
    "Run: cd ${REPO_ROOT}/backend && npm install"
fi

# ────────────────────────────────────────────────────────────────────────────
# CHECK 9 — TypeScript typecheck passes
# ────────────────────────────────────────────────────────────────────────────
echo ""
echo "──────────────────────────────────────────────────────────────"
echo " [9/11] TypeScript typecheck (npm run typecheck)"
if [ -d "${REPO_ROOT}/backend/node_modules" ] && command -v node &>/dev/null; then
  TC_OUTPUT=$(cd "${REPO_ROOT}/backend" && npm run typecheck 2>&1)
  TC_EXIT=$?
  if [ $TC_EXIT -eq 0 ]; then
    pass "TypeScript typecheck passed (npm run typecheck)"
  else
    fail "TypeScript typecheck FAILED" \
      "Errors:\n$(echo "$TC_OUTPUT" | grep 'error TS' | head -5 | sed 's/^/         /')"
  fi
else
  skip "Skipping typecheck" "Requires Node.js (Check 1) and backend/node_modules (Check 8)"
fi

# ────────────────────────────────────────────────────────────────────────────
# CHECK 10 — frontend/node_modules exists
# ────────────────────────────────────────────────────────────────────────────
echo ""
echo "──────────────────────────────────────────────────────────────"
echo " [10/11] frontend/node_modules installed"
if [ -d "${REPO_ROOT}/frontend/node_modules" ]; then
  FNM_COUNT=$(ls "${REPO_ROOT}/frontend/node_modules" | wc -l | tr -d ' ')
  pass "frontend/node_modules found (${FNM_COUNT} packages)"
else
  fail "frontend/node_modules not found" \
    "Run: cd ${REPO_ROOT}/frontend && npm install"
fi

# ────────────────────────────────────────────────────────────────────────────
# CHECK 11 — Port availability (5000 backend, 5173 frontend)
# ────────────────────────────────────────────────────────────────────────────
echo ""
echo "──────────────────────────────────────────────────────────────"
echo " [11/11] Port availability (5000 / 5173)"

check_port() {
  local port="$1"
  local label="$2"
  if command -v ss &>/dev/null; then
    PROC=$(ss -tlnp "sport = :${port}" 2>/dev/null | grep ":${port}" | head -1)
  elif command -v netstat &>/dev/null; then
    PROC=$(netstat -tlnp 2>/dev/null | grep ":${port} " | head -1)
  else
    PROC=""
  fi

  if [ -z "$PROC" ]; then
    pass "Port ${port} (${label}) is free"
  else
    # Extract process name if possible
    PID_INFO=$(echo "$PROC" | grep -oP 'pid=\K[^,)]+' || echo "?")
    echo -e "  ${YELLOW}⚠ SKIP${NC}  Port ${port} (${label}) is in use (pid=${PID_INFO})"
    echo "         → This may be OK if the expected process is already running."
    SKIP_COUNT=$((SKIP_COUNT+1))
  fi
}

check_port 5000 "backend"
check_port 5173 "frontend (Vite)"

# ────────────────────────────────────────────────────────────────────────────
# Summary
# ────────────────────────────────────────────────────────────────────────────
TOTAL=$((PASS_COUNT + FAIL_COUNT + SKIP_COUNT))
echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                     RESULTS SUMMARY                         ║${NC}"
echo -e "${CYAN}╠══════════════════════════════════════════════════════════════╣${NC}"
printf "${CYAN}║${NC}  Total: %-3d | ${GREEN}Pass: %-3d${NC} | ${RED}Fail: %-3d${NC} | ${YELLOW}Skip: %-3d${NC}     ${CYAN}║${NC}\n" \
  "$TOTAL" "$PASS_COUNT" "$FAIL_COUNT" "$SKIP_COUNT"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"

if [ "$HARD_FAIL" -gt 0 ]; then
  echo -e "  ${RED}✗ ${HARD_FAIL} hard failure(s) — environment is NOT ready.${NC}"
  echo ""
  exit 1
elif [ "$FAIL_COUNT" -gt 0 ]; then
  echo -e "  ${YELLOW}⚠ ${FAIL_COUNT} soft failure(s) — some services may not be running.${NC}"
  echo -e "  ${YELLOW}  Start Docker services and re-run to resolve.${NC}"
  echo ""
  exit 1
else
  echo -e "  ${GREEN}✓ All checks passed (or skipped) — environment looks ready!${NC}"
  echo ""
  exit 0
fi
