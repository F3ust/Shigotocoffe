# AGENTS.md — Shigoto Coffee (仕事コーヒー)

Instructions for AI coding agents. Human-oriented setup: [README.md](README.md).

**Shigoto Coffee** — work-friendly cafe finder in Hanoi. UI languages: **Vietnamese (`vi`) and Japanese (`ja`) only**.

**Stack:** React 19 + TypeScript + Vite + Tailwind v4 · Express + TypeScript · MongoDB 7 (Docker) · react-i18next.

---

## Hard constraints (read first)

- **WSL on Windows:** Run `qa/**/*.sh`, `tools/*.sh`, and `docker compose` from bash inside **WSL**. Repo path example: `/mnt/d/仕事コーヒー` (adjust drive/distro). Prefer a WSL default terminal in Cursor.
- **Git over WSL:** If PowerShell `git push` / `git fetch` fails with `Permission denied (publickey)`, run Git **inside WSL** at the same repo path.
- **No force push:** Never use `git push --force`.
- **Push policy:** `be-developer`, `fe-developer`, and `qa-tester` — **do not push**. `be-leader` / `fe-leader` push only after review when QA is not required; `qa-leader` commits and pushes the branch under test. See [Git workflow](#git-workflow).
- **Commits (team mode):** One commit per **finished feature** (contributors) or per **verification chunk** (QA). Do not bundle unrelated changes.
- **Minimal diff:** Change only files required for the task. No drive-by refactors or extra markdown unless asked.
- **i18n:** UI strings only in `frontend/src/i18n/vi.json` and `ja.json`. Do not add other UI languages unless the spec changes. Cafe copy on the server uses bilingual fields `{ ja, vi }` where applicable.
- **Spec source of truth:** Local `ミシ_システム仕様書（トラム）.xlsx` (gitignored). If missing, use `csv/` + `md/` extracts and regenerate via `tools/` (see [Spec sources](#spec-sources)).
- **Subagent skills:** When using a team subagent role, **Read** every skill path listed in [`.cursor/agents/<role>.md`](.cursor/agents/) (under `.agents/.skills/<id>/SKILL.md`, gitignored). If a file is missing, note once and continue.
- **Leader delegation:** `be-leader` and `fe-leader` **must not** edit `backend/src/` or `frontend/src/` themselves; they **must** spawn **two** parallel Task subagents (`be-developer` / `fe-developer`). Contributors must not spawn subagents. Full rules: [`.cursor/team-subagents.md`](.cursor/team-subagents.md#leader-delegation-task-tool). File-scoped reminders: [`.cursor/rules/team-leader-delegation-*.mdc`](.cursor/rules/) (active when matching paths are in context).

---

## Quick start

Run from **repository root** (contains `docker-compose.yml` and `.env.example`).

```bash
cp .env.example .env
docker compose -p shigoto-coffee up -d

cd backend && npm install && npm run seed && npm run dev
# separate terminal
cd frontend && npm install && npm run dev
```

| Service | URL |
|---------|-----|
| API | `http://localhost:5000` |
| Health | `GET /api/health` (`database.connected` must be `true`) |
| Frontend | `http://localhost:5173` |
| Mongo Express | `http://localhost:8081` |

**Demo user (after seed):** `demo@shigoto.local` / `demo1234`

**Env:** Single `.env` at repo root — backend loads it automatically. If the UI cannot reach the API across WSL/Windows, set `VITE_API_BASE_URL` (see `.env.example`).

**Windows PowerShell:** `Copy-Item .env.example .env`

**WSL one-shot example:**

```bash
wsl -d Ubuntu -- bash -lc "cd '/mnt/d/仕事コーヒー' && docker compose -p shigoto-coffee up -d"
```

---

## Repository structure

| Path | Purpose |
|------|---------|
| `backend/src/` | `config/`, `routes/`, `controllers/`, `models/`, `middleware/`, `services/` (auth/reviews), `seeds/`, `utils/` |
| `frontend/src/` | `pages/`, `components/`, `i18n/`, `services/`, `types/` |
| `qa/` | Bash + `curl` test suites (`be-crud-tests/`, `uat-search-flow/`, `env-verification.sh`) |
| `tools/` | XLSX → CSV → actionable Markdown |
| `csv/`, `md/` | Spec extracts (committed); see `_sheets_index.txt` / `md/_index.txt` |
| `.cursor/agents/` | Subagent definitions (local; may be gitignored) |
| `.cursor/team-subagents.md` | Full team workflow and skill roster |

---

## Code conventions

### Backend

- **Flow:** `Routes → Controllers → Models`. Put non-trivial auth/review logic in `services/`.
- **Async routes:** Wrap handlers with `asyncHandler` from `middleware/errorHandler`.
- **Errors:** Throw `AppError`, `NotFoundError`, `ValidationError`, `UnauthorizedError`, `ConflictError` from `backend/src/utils/errors.ts` — global `errorHandler` formats responses.
- **Bilingual data:** Cafe (and similar) fields use `{ ja, vi }` on Mongoose documents.
- **Verify:** `cd backend && npm run typecheck`

### Frontend

- Functional React components + TypeScript; HTTP via `frontend/src/services/`.
- **Routes** (`frontend/src/App.tsx`): `/`, `/login`, `/register`, `/cafes/:id` — do not assume these are missing.
- **Verify:** `cd frontend && npm run build`

### API surface (current)

| Method | Endpoint |
|--------|----------|
| `GET` | `/api/health` |
| `POST` | `/api/auth/register`, `/api/auth/login` |
| `GET` | `/api/cafes` (query: `q`, `district`, `minRating`, `tags`, `page`, `limit`) |
| `GET` | `/api/cafes/:id`, `/api/cafes/:id/reviews` |
| `POST` / `PATCH` / `DELETE` | `/api/cafes`, `/api/cafes/:id` |

---

## Testing and QA

- Run **`bash qa/...` in WSL** on Windows. Backend must be reachable at the same `localhost` as `curl` (start dev server in WSL if tests run in WSL).
- **Preconditions:** Mongo up, `cd backend && npm run seed`, backend on port `5000`, `jq` installed in WSL.
- **BE CRUD suite:** `bash qa/be-crud-tests/run-all.sh` (optional `--base-url http://host:port/api`). Details: [qa/be-crud-tests/README.md](qa/be-crud-tests/README.md).
- **Env check:** `bash qa/env-verification.sh`
- **Search UAT:** `bash qa/uat-search-flow/run-search-uat.sh`
- **QA roles:** Checkout the branch named for QA; one commit per verification chunk; `qa-leader` pushes that branch when done.

---

## Git workflow

Summary (full detail: [`.cursor/team-subagents.md`](.cursor/team-subagents.md)):

1. **`project-leader`** — Analyze work (`.cursor/sprint-2-handoff.md`, xlsx/md when needed). Assign scoped packages to `be-leader`, `fe-leader`, `qa-leader`. **Does not** create `feat/*` branches.
2. **`be-leader` / `fe-leader`** — Create `feat/<short-slug>`. **Do not implement** under `*/src/`; spawn **two** parallel Task `be-developer` / `fe-developer` agents with disjoint paths. Review, then typecheck/build. Hand **`qa-leader`** the branch + scope, **or** `git push origin feat/<slug>` if QA is not required (from **WSL** when SSH is WSL-only).
3. **`qa-leader`** — `git checkout` the named branch; run `qa/`; prefer two `qa-tester` Task agents for multi-suite scope; commit per chunk; **`git push origin <branch-under-test>`**.
4. **Contributors** (`be-developer`, `fe-developer`, `qa-tester`) — implement/test only assigned scope; **do not spawn** subagents; one commit per unit; **never push** unless the user explicitly overrides.

**Invoke subagents:** `/project-leader`, `/be-leader`, `/fe-leader`, `/qa-leader`, `/be-developer`, `/fe-developer`, `/qa-tester`

---

## Subagents

Definitions: [`.cursor/agents/`](.cursor/agents/) (`model: auto`). Sprint backlog extract (optional): [`.cursor/sprint-2-handoff.md`](.cursor/sprint-2-handoff.md).

| Role | Skill IDs (read `.agents/.skills/<id>/SKILL.md` in order) |
|------|-----------------------------------------------------------|
| `project-leader` | stop-slop, brainstorming, docs-architect, docker-expert, ai-engineer |
| `be-leader` | stop-slop, backend-architect, backend-dev-guidelines, nodejs-backend-patterns, nodejs-best-practices, database, docker-expert |
| `be-developer` | stop-slop, backend-dev-guidelines, backend-development-feature-development, nodejs-backend-patterns, nodejs-best-practices, typescript-expert, database |
| `fe-leader` | stop-slop, typescript-expert, docs-architect, brainstorming, unit-testing-test-generate |
| `fe-developer` | stop-slop, typescript-expert, unit-testing-test-generate |
| `qa-leader` | stop-slop, docs-architect, unit-testing-test-generate, docker-expert, database-admin |
| `qa-tester` | stop-slop, unit-testing-test-generate, docker-expert |

| Stream | Leader | Parallel contributors |
|--------|--------|------------------------|
| Project | `project-leader` | — |
| Backend | `be-leader` | 2× `be-developer` |
| Frontend | `fe-leader` | 2× `fe-developer` |
| QA | `qa-leader` | 2× `qa-tester` |

---

## Spec sources

| Source | When to use |
|--------|-------------|
| `ミシ_システム仕様書（トラム）.xlsx` | Authoritative spec (local only) |
| [csv/_sheets_index.txt](csv/_sheets_index.txt) | Japanese sheet name → CSV file map |
| [md/_index.txt](md/_index.txt) | CSV → Markdown + action counts |
| [md/screen_design_document.md](md/screen_design_document.md) | Screen layout / UI spec |
| [md/screen_transition_diagram.md](md/screen_transition_diagram.md) | Navigation flows |
| [md/sprint_backlog_2.md](md/sprint_backlog_2.md) | Sprint 2 backlog (from CSV) |

**Regenerate extracts (repo root, WSL or any Python 3):**

```bash
python3 tools/xlsx_to_csv.py          # writes csv/ from xlsx at repo root
python3 tools/csv_to_what_to_do_md.py # writes md/ from csv/
python3 tools/extract_sprint_backlog2.py  # sprint 2 rows to stdout / handoff refresh
```

---

## Security

- **Never** commit `.env`, credentials, or production `JWT_SECRET`.
- `JWT_SECRET` is required in production (see README env table).
- Hash passwords on the User model; use existing auth error classes — do not leak stack traces or tokens in responses.
- Do not log secrets, full JWTs, or raw passwords.

---

## Further reading

- [README.md](README.md) — setup, API examples, troubleshooting
- [backend/README.md](backend/README.md) — models, scripts, error handling
- [.cursor/team-subagents.md](.cursor/team-subagents.md) — full team workflow, WSL/Git notes, skill inventory
