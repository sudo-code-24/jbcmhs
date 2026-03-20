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
- **Backend API:** https://jbcmhs.onrender.com  
- **API health:** https://jbcmhs.onrender.com/api/health  

## Phase 1 Features

- **Homepage:** School name, history, mission/vision, contact info, office hours (from API). Latest 3 announcements and upcoming events.
- **Announcements:** List and detail pages; data from `/api/announcements`.
- **Calendar:** Events grouped by month; “Download as PDF” is a placeholder.
- **Admin:** CRUD for announcements and events, protected by login.

## Admin Login Config

Admin routes are protected. Set these variables for the Next.js client:

- `ADMIN_SESSION_TOKEN` (recommended; used for session cookie)

Credentials are validated by the backend (`/api/auth/login`) against the `users` Google Sheet.
For local non-Docker runs, add the token in `client/.env`.
For Docker, it is read from `docker-compose.yml` (with development defaults).

Server auth environment variables:

- `GOOGLE_SHEET_USERS` (default: `users`)
- `CORS_ALLOWED_ORIGINS` (comma-separated origins allowed to call API)
- `DEFAULT_ADMIN_EMAIL` (default: `admin@jbcmhs.local`)
- `DEFAULT_ADMIN_PASSWORD` (default: `+`)
- `DEFAULT_RESET_PASSWORD` (default: `jbcmhs_local`)
- `BCRYPT_SALT_ROUNDS` (default: `12`)
- `JWT_SECRET` (required)
- `JWT_EXPIRES_IN_SECONDS` (default: `3600`)
- `UPSTASH_REDIS_REST_URL` (recommended for shared session storage)
- `UPSTASH_REDIS_REST_TOKEN` (recommended for shared session storage)

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
- `POST /api/auth/signup` — Create user (email + bcrypt hash)
- `POST /api/auth/login` — Validate credentials, return JWT + sessionId
- `POST /api/auth/logout` — Revoke active session
- `POST /api/auth/change-password` — Update password
- `GET /api/auth/users` — Protected list users (requires JWT + sessionId)
- `DELETE /api/auth/users/:username` — Protected delete user
- `POST /api/auth/users/:username/reset-password` — Protected reset password

If a user signs in with the configured default admin password, login is blocked until password is changed.
For production, configure Upstash Redis so session validation works across restarts/instances.

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
3. Open http://localhost:3000 (API at https://jbcmhs.onrender.com).

## Development

- Hot reload is enabled for both client and server via mounted volumes.
- Sheet schema changes are managed directly in the Google Sheet tabs and headers.

## Stopping

```bash
docker-compose down
```

Use `docker-compose down -v` if you also want to remove attached volumes.
