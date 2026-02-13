# Waroeng Project

Vue + Vite frontend with an Express API and PostgreSQL database for inventory.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy env file and set your database credentials:
```bash
# macOS/Linux
cp .env.example .env

# Windows (PowerShell)
Copy-Item .env.example .env
```

3. Make sure PostgreSQL is running and the database in `PGDATABASE` exists.

## Run

Run frontend + backend together:
```bash
npm run dev:fullstack
```

Or separately:
```bash
npm run dev:server
npm run dev:client
```

## API Endpoints

- `GET /health`
- `GET /inventory`
- `POST /inventory`
- `PUT /inventory/:id`
- `DELETE /inventory/:id`
