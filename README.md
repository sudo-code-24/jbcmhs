# Public High School Website — JBCMHS

Mobile-first school site: **Next.js 14** (App Router) + **Strapi 5** CMS. An older **Express + Google Sheets** backend remains in `server/` for reference or gradual cutover but is **not** the source of truth when the Strapi integration is enabled on the client.

## Architecture

```
┌─────────────────┐     Content API + Users-Permissions      ┌──────────────────┐
│  Next.js client │  ──────────────────────────────────────► │  Strapi 5 CMS   │
│  (port 3000)    │  Server: API token + server-side fetch   │  (port 1337)    │
└─────────────────┘  Browser: GET via /api/strapi-proxy     └──────────────────┘
        │                                                           │
        └─ httpOnly session cookie (Strapi JWT) for /admin ─────────┘
```

- **Public pages** load announcements, events, school info, and faculty board through `client/lib/api.ts` and Strapi helpers.
- **Admin dashboard** (`/admin`) uses Strapi for authentication and persists content via Next API routes that write to Strapi.

## Prerequisites

- **Node.js** 20+ recommended (Strapi); Next client runs on Node 18+
- **Strapi:** follow [`../cms/my-strapi-backend/README.md`](../cms/my-strapi-backend/README.md) (or your local path to `my-strapi-backend`) for CMS setup, `.env`, API token, and optional **Excel import**.

## Quick start (Strapi + Next)

1. **Start Strapi**

   ```bash
   cd /path/to/my-strapi-backend
   cp .env.example .env   # configure secrets
   npm install && npm run develop
   ```

2. **Start Next client**

   ```bash
   cd client
   cp .env.example .env
   # Set STRAPI_URL, STRAPI_JWT_SECRET (same as Strapi JWT_SECRET), STRAPI_API_TOKEN
   npm install && npm run dev
   ```

3. Open **http://localhost:3000** (site) and **http://localhost:1337/admin** (CMS).

Frontend-focused details: **[`client/README.md`](client/README.md)**.

## Migration overview (Express / Sheets → Strapi)

| Area | Legacy (`server/`) | Current (Strapi + Next) |
|------|--------------------|-------------------------|
| School info | Google Sheet / Express | Strapi **School profile** single type → `GET /api/school-profile` |
| Announcements / events | Sheets | Strapi collection types; Next BFF at `/api/announcements`, `/api/events` |
| Faculty board | Sheets | Strapi grade levels, board sections, faculty members |
| Admin auth | Express + Redis/session, sheet users | Strapi **Users & Permissions**; Next sets Strapi JWT cookie |
| Public reads from browser | Could hit Express or Netlify | Strapi via **`/api/strapi-proxy/*`** (GET, allowlisted) |

**Importing legacy sheet data:** use Strapi **`npm run import:data`** with `JBCMHS.xlsx` (see Strapi README). Reconcile URLs and env vars so production points at the Strapi host, not the old Render Express URL.

## Docker / Phase 1 note

The original **docker-compose** flow targeted the **Express** API and Google credentials. If you still use Docker, update compose services so the **client** `STRAPI_*` variables point at your Strapi container or external URL, or run Strapi and Next manually as in Quick start. The [`docs/google-sheets-drive-setup.md`](docs/google-sheets-drive-setup.md) guide applies to the legacy stack.

## Repository layout

```
client/          Next.js 14 app (see client/README.md)
server/          Legacy Express API (optional)
docs/            Legacy / shared setup notes
```

## License / contact

Project-specific; see school or maintainer policy.
