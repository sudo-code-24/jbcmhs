# Public High School Website — Phase 1

A simple, mobile-first school site with Next.js (App Router) and Express.

## Tech Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend:** Node.js, Express.js, TypeScript
- **Data Store:** Google Sheets API
- **Image Store:** Google Drive API
- **Containers:** Docker + Docker Compose

## Prerequisites

- Docker and Docker Compose installed

## Setup

### Google setup (required)

Before running the server, complete the Google Sheets + Drive setup guide:

- [Google Sheets and Drive Setup](docs/google-sheets-drive-setup.md)

### 1. Start all services

```bash
docker-compose up --build
```

Wait until the `server` and `client` containers are running.

### 2. Access the app

- **Frontend:** http://localhost:3000  
- **Backend API:** http://localhost:5005  
- **API health:** http://localhost:5005/api/health  

## Phase 1 Features

- **Homepage:** School name, history, mission/vision, contact info, office hours (from API). Latest 3 announcements and upcoming events.
- **Announcements:** List and detail pages; data from `/api/announcements`.
- **Calendar:** Events grouped by month; “Download as PDF” is a placeholder.
- **Admin:** Simple CRUD for announcements and events (no auth in Phase 1).

## Project Structure

```
/client     → Next.js app (port 3000)
/server     → Express API (Google Sheets + Drive) (port 5005)
/docs       → Setup and project documentation
docker-compose.yml
```

## API Endpoints

- `GET/PUT /api/school-info` — School info (single record)
- `GET/POST /api/announcements` — List / create (query: `?limit=n`)
- `GET/PUT/DELETE /api/announcements/:id`
- `GET/POST /api/events` — List / create
- `GET/PUT/DELETE /api/events/:id`

## Run without Docker

Complete Google setup first (see docs link above), then ensure `server/.env` and `client/.env` are configured.

1. **Server:**
   ```bash
   cd server && npm install && npm run dev
   ```
2. **Client** (in another terminal):
   ```bash
   cd client && npm install && npm run dev
   ```
3. Open http://localhost:3000 (API at http://localhost:5005).

## Development

- Hot reload is enabled for both client and server via mounted volumes.
- Sheet schema changes are managed directly in the Google Sheet tabs and headers.

## Stopping

```bash
docker-compose down
```

Use `docker-compose down -v` if you also want to remove attached volumes.
