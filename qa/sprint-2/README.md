# Sprint 2 API tests

Task #13 — cafe detail, reviews, auth, hashtag filter.

## Preconditions

1. Repo root `.env` from `.env.example`
2. `docker compose -p shigoto-coffee up -d` (Mongo healthy)
3. `cd backend && npm install && npm run seed`
4. `cd backend && npm run dev` (port 5000)
5. `jq` installed in WSL

Run backend and `bash qa/sprint-2/...` in the **same** environment (WSL recommended on Windows).

## Run

```bash
bash qa/sprint-2/run-all.sh
```

Override API URL:

```bash
bash qa/sprint-2/run-all.sh --base-url http://localhost:5000/api
```
