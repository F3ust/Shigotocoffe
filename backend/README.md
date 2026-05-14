# Backend — 仕事コーヒー API

Express + Mongoose + TypeScript.

## Setup

```bash
npm install
npm run seed   # populate 12 sample cafes
npm run dev    # http://localhost:5000
```

Requires MongoDB running (see root `docker-compose.yml`).

## Scripts

| Script | What it does |
|--------|-------------|
| `npm run dev` | Start with ts-node-dev (hot reload) |
| `npm run seed` | Seed database with sample cafes |
| `npm run build` | Compile to `dist/` |
| `npm start` | Run compiled output |
| `npm run typecheck` | Type-check without emitting |

## Architecture

```
Routes → Controllers → Models (Mongoose)
```

Sprint 1 uses flat MVC. Sprint 2 adds a service layer for auth and review logic.

## Models

**Cafe** — Bilingual name/description/address (`{ja, vi}`), district, opening hours, hashtags (`wifi`, `outlets`, `quiet`, `japanese`, `noTimeLimit`), average rating, geo coordinates.

**User** (skeleton) — Name, email, hashed password, role (`user`/`owner`), favorites array.

**Review** (skeleton) — User ref, cafe ref, rating (1-5), comment. Unique compound index on `user + cafe`.

## Error Handling

Custom error classes (`AppError`, `NotFoundError`, `ValidationError`) feed into a global error handler. All async route handlers use `asyncHandler` to catch promise rejections.
