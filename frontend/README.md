# Frontend — 仕事コーヒー

React 19 + TypeScript + Vite + Tailwind CSS v4.

## Setup

```bash
npm install
npm run dev   # http://localhost:5173
```

## Scripts

| Script | What it does |
|--------|-------------|
| `npm run dev` | Vite dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve production build locally |

## Component Tree

```
App
├── Header
│   ├── Logo (仕事コーヒー + tagline)
│   ├── Nav (Home link)
│   ├── LanguageToggle (dropdown: VI / JA)
│   └── AccountMenu (guest: login/register, auth: info/logout)
├── HomePage
│   ├── Hero (banner with cafe background + title)
│   ├── SearchBar (district dropdown + keyword input + search button + filter toggle)
│   ├── FilterPanel (distance checkboxes + rating checkboxes)
│   └── CafeCard[] (image, bookmark, name, stars, hours, address, hashtags, view button)
└── Footer (copyright, terms, privacy)
```

## i18n

Two locales: Vietnamese (`vi.json`) and Japanese (`ja.json`). The `LanguageToggle` dropdown in the header switches languages. Preference persists in `localStorage`.

## Tailwind Theme

Custom color palettes in `index.css` via Tailwind v4 `@theme`:

- `sage-50` through `sage-900` — muted greens (primary UI color)
- `cream-50` through `cream-500` — warm backgrounds
- `coffee-50` through `coffee-900` — accent browns

## API Proxy

Vite proxies `/api` to `http://localhost:5000` during development (`vite.config.ts`).
