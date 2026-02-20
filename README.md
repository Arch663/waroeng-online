# Waroeng Project

Vue + Vite frontend with an Express API and MongoDB database for inventory.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy env file and set your MongoDB connection:
```bash
# macOS/Linux
cp .env.example .env

# Windows (PowerShell)
Copy-Item .env.example .env
```

3. Make sure MongoDB is running and database in `MONGODB_DB_NAME` is accessible.

## Run

Run frontend + backend together:
```bash
npm run dev:all
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
