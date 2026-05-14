# 仕事コーヒー (Shigoto Coffee)

Cafe finder for remote workers in Hanoi. Search and filter work-friendly cafes with bilingual UI (Vietnamese / Japanese).

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19, TypeScript, Vite |
| Styling | Tailwind CSS v4 |
| Backend | Node.js, Express, TypeScript |
| Database | MongoDB 7.0 (Docker) |
| i18n | react-i18next |

## Prerequisites

- Node.js 18+
- Docker Desktop (WSL integration enabled)

## Quick Start

```bash
# 1. Start MongoDB
docker compose -p shigoto-coffee up -d

# 2. Backend
cd backend
npm install
npm run seed
npm run dev

# 3. Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

Backend runs at `http://localhost:5000`. Frontend at `http://localhost:5173`.

## Project Structure

```
├── backend/
│   └── src/
│       ├── config/         # DB connection, env
│       ├── controllers/    # Route handlers
│       ├── middleware/      # Error handler, async wrapper
│       ├── models/         # Mongoose schemas
│       ├── routes/         # Express routes
│       ├── seeds/          # Sample data
│       └── utils/          # Error classes
├── frontend/
│   └── src/
│       ├── components/     # Header, CafeCard, SearchBar, FilterPanel
│       ├── i18n/           # vi.json, ja.json
│       ├── pages/          # HomePage
│       ├── services/       # API client
│       └── types/          # TypeScript interfaces
├── docker-compose.yml
└── .env.example
```

## API

| Method | Endpoint | Query Params |
|--------|----------|-------------|
| GET | `/api/cafes` | `q`, `district`, `minRating`, `tags`, `page`, `limit` |
| GET | `/api/cafes/:id` | |
| GET | `/api/health` | |

```bash
# Search by keyword
curl "http://localhost:5000/api/cafes?q=workspace"

# Filter by district and tags
curl "http://localhost:5000/api/cafes?district=Ba+Đình&tags=wifi,japanese"

# Filter by minimum rating
curl "http://localhost:5000/api/cafes?minRating=4"
```

## Environment Variables

Copy `.env.example` to `.env`. Defaults work for local development.

| Variable | Default | Purpose |
|----------|---------|---------|
| `MONGODB_URI` | `mongodb://admin:admin123@localhost:27017/shigoto_coffee?authSource=admin` | MongoDB connection |
| `BACKEND_PORT` | `5000` | API server port |
| `MONGO_PORT` | `27017` | MongoDB port |
| `VITE_API_BASE_URL` | `http://localhost:5000/api` | Frontend API target |

Mongo Express runs at `http://localhost:8081` for database inspection.

## Roadmap

- **Sprint 1** ✅ DB, guest cafe listing, search/filter, i18n, UI aligned to spec
- **Sprint 2** Auth (login/signup), reviews, favorites
- **Sprint 3** Shop owner dashboard, profile pages
