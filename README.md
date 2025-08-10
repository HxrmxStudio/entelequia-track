## Entelequia Track

Modern delivery tracking platform built as a clean, production‑grade monorepo: a robust Rails API, a Next.js internal panel, and an Expo courier app. Designed with scalability, DX, and reliability in mind.

### CI status

[![Backend CI](https://github.com/HxrmxStudio/entelequia-track/actions/workflows/backend-ci.yml/badge.svg?branch=main)](https://github.com/HxrmxStudio/entelequia-track/actions/workflows/backend-ci.yml)
[![Panel CI](https://github.com/HxrmxStudio/entelequia-track/actions/workflows/panel-ci.yml/badge.svg?branch=main)](https://github.com/HxrmxStudio/entelequia-track/actions/workflows/panel-ci.yml)
[![Courier App CI](https://github.com/HxrmxStudio/entelequia-track/actions/workflows/courier-ci.yml/badge.svg?branch=main)](https://github.com/HxrmxStudio/entelequia-track/actions/workflows/courier-ci.yml)

## What it does (in plain words)

- One place to manage deliveries: create/import orders (CSV), assign couriers, track status.
- Live map (stub for now) to see where couriers are and who’s closest.
- CSV import wizard (stub) to bring your existing data on day one.
- Background jobs with Sidekiq so heavy tasks (imports, notifications) don’t block users.
- S3/MinIO storage for things like proof‑of‑delivery.
- API‑first backend to plug into ERP/CRM or internal tools.

## Monorepo layout

```
entelequia-track/
├─ backend/        # Rails API (PostgreSQL/PostGIS, Redis, Sidekiq, S3-compatible)
├─ panel/          # Next.js (TypeScript) internal panel
└─ courier-app/    # Expo (TypeScript) courier mobile app
```

## Why a company would care

- Fewer “where is my order?” tickets thanks to tracking and a clear dashboard.
- Faster onboarding: upload what you already have (CSV) and start operating.
- Scales safely: Postgres + Redis + Sidekiq cover high‑volume days.
- Cloud‑ready but simple local dev with Docker; no vendor lock‑in.
- Friendly for ops teams: simple UI, clear states, room to grow.

## Highlights

- Spatial data with PostGIS for geo‑queries and live‑tracking use cases.
- Sidekiq for async jobs and scheduling.
- S3‑compatible storage (MinIO locally, AWS S3 in prod if needed).
- Next.js App Router for the panel and Expo (React Native) for the courier app.
- GitHub Actions per package (lint, typecheck, build, DB service for API).

## Tech stack

- Backend: Rails 8, PostgreSQL 16 + PostGIS, Redis, Sidekiq, Active Storage
- Panel: Next.js 15, React 18, TypeScript, Tailwind CSS
- Mobile: Expo (React Native), TypeScript
- Tooling: Docker Compose, GitHub Actions, ESLint, Rubocop, Brakeman

## Quick start

### Prerequisites

- Ruby 3.4+
- Node.js 18+
- Docker & Docker Compose

### Boot databases & storage

```bash
docker compose up -d db redis minio create-bucket
```

This starts:
- PostgreSQL + PostGIS (127.0.0.1:5433)
- Redis (127.0.0.1:6380)
- MinIO (API http://127.0.0.1:9000, Console http://127.0.0.1:9001)

### Run apps

1) Backend

```bash
cd backend
bundle install
rails db:create db:migrate
rails server
```

2) Panel

```bash
cd panel
npm install
npm run dev
```

3) Courier app

```bash
cd courier-app
npm install
npm run web   # or: npm run android / npm run ios
```

## Environment

Create `.env` files per app.

### Backend (.env)
```bash
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5433/entelequia
REDIS_URL=redis://127.0.0.1:6380/0
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
AWS_BUCKET=your-bucket
```

### Panel (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Courier App (.env)
```bash
EXPO_PUBLIC_API_URL=http://localhost:3000
```

## DB access (DBeaver)

- Host: 127.0.0.1
- Port: 5433
- Database: entelequia
- User: postgres
- Password: postgres
- JDBC: `jdbc:postgresql://127.0.0.1:5433/entelequia`

PostGIS check:

```sql
SELECT PostGIS_Full_Version();
```

## About the stack & choices

- Keep it simple, then scale: clear boundaries, readable code, and standard tools.
- Per‑package CI and Docker make onboarding and contributions smooth.
- Geo‑capabilities (PostGIS) and background processing (Sidekiq) unlock real‑world logistics features.
- Docs aim to get you running in minutes and leave space for teams to extend.

## Roadmap (next steps)

- AuthN/AuthZ with JWT and role‑based access for panel and API.
- Real‑time location streaming for courier app and live map in panel.
- Import wizard end‑to‑end (CSV mapping → validation → background processing).
- Observability: structured logging and basic metrics.

## Contact

If this project interests you and you’d like to discuss roles or collaboration:

- Email: add-your-email-here
- LinkedIn: add-your-linkedin-here
