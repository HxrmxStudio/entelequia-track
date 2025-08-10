# Entelequia Track

A comprehensive delivery tracking system with backend API, internal panel, and courier mobile app.

## Project Structure

```
entelequia-track/
├─ backend/        # Rails API (Postgres/PostGIS, Redis, Sidekiq, S3)
├─ panel/          # Next.js (TS) panel interno
└─ courier-app/    # Expo (TS) app repartidor
```

## Quick Start

### Prerequisites

- Ruby 3.4+
- Node.js 18+
- PostgreSQL with PostGIS extension
- Redis
- Docker & Docker Compose (optional)

### Development Setup

1. **Backend (Rails API)**
   ```bash
   cd backend
   bundle install
   rails db:create db:migrate
   rails server
   ```

2. **Panel (Next.js)**
   ```bash
   cd panel
   npm install
   npm run dev
   ```

3. **Courier App (Expo)**
   ```bash
   cd courier-app
   npm install
   npm run web  # or npm run android/ios
   ```

### Using Docker Compose (databases & storage)

```bash
docker compose up -d db redis minio create-bucket
```

This will start:
- PostgreSQL with PostGIS (host 127.0.0.1:5433)
- Redis (host 127.0.0.1:6380)
- MinIO (S3-compatible) API `http://127.0.0.1:9000` and Console `http://127.0.0.1:9001`

## Environment Variables

Create `.env` files in each component directory:

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

## Features

- **Backend**: RESTful API with spatial data support, background job processing, and file storage (MinIO)
- **Panel**: Internal management interface for tracking deliveries and managing couriers
- **Courier App**: Mobile application for delivery drivers with real-time tracking

## Tech Stack

- **Backend**: Rails 8, PostgreSQL/PostGIS, Redis, Sidekiq, AWS S3
- **Panel**: Next.js 15, TypeScript, Tailwind CSS
- **Mobile**: Expo, React Native, TypeScript 

## Database access (DBeaver)

- Host: 127.0.0.1
- Port: 5433
- Database: entelequia
- User: postgres
- Password: postgres
- JDBC: `jdbc:postgresql://127.0.0.1:5433/entelequia`

Check PostGIS:

```sql
SELECT PostGIS_Full_Version();
```