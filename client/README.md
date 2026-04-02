# JBCMHS Next.js client

Public school website and **editor/admin UI** backed by **Strapi 5**, not the legacy Express + Google Sheets stack.

## Prerequisites

- **Node.js** 18+ (project uses Next.js 14)
- Running **Strapi** instance and configured `.env` (see below)

## Setup

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

App: [http://localhost:3000](http://localhost:3000)

## Environment variables

Copy from `.env.example` and fill in:

| Variable | Required | Description |
|----------|----------|-------------|
| `STRAPI_URL` | Yes | Strapi origin, e.g. `http://localhost:1337` (no trailing slash) |
| `STRAPI_JWT_SECRET` or `JWT_SECRET` | Yes | Must **exactly match** Strapi’s `JWT_SECRET` — used to verify Users & Permissions JWTs (middleware, `/api/auth/*`). **Not** the API token. |
| `STRAPI_API_TOKEN` | Yes (for CMS reads/writes) | Strapi **API token** (Settings → API Tokens) with access to content types you use from Next |
| `STRAPI_DEFAULT_RESET_PASSWORD` | Optional | Default password when an admin resets a user from the dashboard |

Legacy or ancillary keys may still exist in `.env` (e.g. `NEXT_PUBLIC_*`, `ADMIN_SESSION_TOKEN`); **school auth and CMS traffic go through Strapi** for this branch.

## How the app talks to Strapi

- **Server components & server `fetch`:** `lib/strapi/strapiFetch.ts` calls Strapi directly with `Authorization: Bearer STRAPI_API_TOKEN` where appropriate.
- **Browser reads:** Same module uses **`/api/strapi-proxy/...`**, a Next Route Handler that forwards **GET** to Strapi with the token kept on the server. Allowed roots are listed in `lib/strapi/strapiProxyAllowlist.ts`.
- **Public auth (faculty/admin dashboard):** `POST /api/auth/login` exchanges credentials with Strapi `/api/auth/local` and sets an **httpOnly** cookie (`hs_strapi_jwt`). Middleware protects `/admin/*` by verifying that JWT with `STRAPI_JWT_SECRET`.
- **Content mutations:** Dedicated routes under `app/api/announcements`, `app/api/events`, `app/api/faculty-board`, etc., call Strapi using the API token and transformers in `lib/strapi/`.

### Strapi 5 routing reminder

Single type **School profile** is fetched at **`/api/school-profile`** (singular). Collection types use plural names (e.g. `/api/announcements`).

## Auth & admin

- **Login:** `/login` (redirects to `/admin` or `?next=` when successful).
- **Admin:** `/admin` — requires valid Strapi user JWT and Strapi roles **`admin`** or **`faculty`** (see Strapi bootstrap for role names).
- **`GET /api/auth/me`** — Returns session summary for the header; must send cookies (`credentials: 'include'` from the client).

If login “succeeds” but you bounce back to login or see **401** on `/api/auth/me`, check: **JWT secret alignment**, **service worker** (see below), and that cookies are sent on same-origin requests.

## PWA / service worker

`next-pwa` is configured in `next.config.js`:

- In **development**, the service worker is **disabled** so `/api/auth/*` and session cookies are not intercepted.
- In **production**, caching rules **exclude** `/api/auth/` from Workbox handlers.

If you previously enabled a SW on localhost, unregister it in DevTools → Application → Service workers.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Next dev server |
| `npm run build` | Production build |
| `npm run start` | Run production build |
| `npm run lint` | ESLint |

## Deployment

Typical setup: deploy **Strapi** separately (e.g. VPS, Railway, Render) and **Next** (e.g. Netlify with `@netlify/plugin-nextjs`). Set the same env vars in the Next host; **`STRAPI_URL`** must be reachable from the Next **server** (serverless functions), not only the browser—avoid `http://localhost:1337` in production unless you use a tunnel.

## Project layout (high level)

```
app/           App Router pages and Route Handlers (`app/api/*`)
components/    UI
lib/api.ts     Public data helpers (announcements, events, school info, faculty board)
lib/strapi/    Strapi client, transformers, proxy allowlist, CMS writes
lib/auth/      Strapi JWT session helpers
middleware.ts  Protects /admin
```

For CMS installation and data import, see **`my-strapi-backend/README.md`** (sibling path is often `../cms/my-strapi-backend/` from the `hs` repo root—adjust for your clone).
