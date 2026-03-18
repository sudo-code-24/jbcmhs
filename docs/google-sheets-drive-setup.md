# Google Sheets and Drive Setup

This project now uses Google Sheets as the data store and Google Drive for image references.

## 1) Create a Google Cloud Project

1. Open [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (or select an existing one).
3. Enable these APIs:
   - Google Sheets API
   - Google Drive API
   - Google Calendar API

## 2) Create a Service Account

1. In Google Cloud Console, go to **IAM & Admin > Service Accounts**.
2. Create a service account.
3. Generate a JSON key for that service account.
4. Save the JSON securely (do not commit it).

You need these values from the key:
- `client_email`
- `private_key`

## 3) Create the Spreadsheet

1. Create one Google Sheet file.
2. Add these tabs:
   - `announcements`
   - `events`
   - `school_info`
   - `users`
3. Set row 1 as headers exactly as shown below.

### `announcements` headers

`id,title,content,category,datePosted,imageFileId`

### `events` headers

`id,title,description,date,endDate,type,imageFileId,googleEventId`

### `school_info` headers

`id,name,history,mission,vision,phone,email,address,officeHours,heroImageUrl,schoolImageUrl`

### `users` headers

`username,email,hashedPassword,createdAt`

### Initial `school_info` row example

Use row 2 with `id=1` and your school details:

- `id`: `1`
- `name`: `Jose B. Cardenas Mem HS`
- `history`: your history text
- `mission`: your mission text
- `vision`: your vision text
- `phone`: `(035) 402 0454`
- `email`: `jbcmhs1971.official@gmail.com`
- `address`: `Exodus Avenue, Brgy. Panubigan, Canlaon City, Philippines, 6223`
- `officeHours`: `Monday-Friday: 7:30 AM - 4:00 PM`
- `heroImageUrl`: optional public image URL
- `schoolImageUrl`: optional public image URL

## 4) Share the Spreadsheet with Service Account

1. Open the spreadsheet.
2. Click **Share**.
3. Add the service account email (`client_email`) as **Editor**.

If this step is skipped, the API cannot read/write sheet data.

## 5) Prepare Google Drive Images

For any image used in `imageFileId`, `heroImageUrl`, or `schoolImageUrl`:

1. Upload image to Google Drive.
2. Open image sharing settings.
3. Set access to **Anyone with the link** (Viewer).
4. Copy the public image URL.

The backend uses URL fields for school images, so save the full public URL in the sheet.

## 6) Configure Environment Variables (Server)

Set these in `server/.env`:

```env
PORT=5005
GOOGLE_SPREADSHEET_ID=your_google_spreadsheet_id
GOOGLE_CLIENT_EMAIL=service-account@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_CALENDAR_ID=your_calendar_id@group.calendar.google.com
GOOGLE_SHEET_ANNOUNCEMENTS=announcements
GOOGLE_SHEET_EVENTS=events
GOOGLE_SHEET_SCHOOL_INFO=school_info
GOOGLE_SHEET_USERS=users
DEFAULT_ADMIN_EMAIL=admin@jbcmhs.local
DEFAULT_ADMIN_PASSWORD=admin12345
DEFAULT_RESET_PASSWORD=jbcmhs_local
BCRYPT_SALT_ROUNDS=12
JWT_SECRET=replace_with_strong_secret
JWT_EXPIRES_IN_SECONDS=3600
```

Notes:
- Keep quotes around `GOOGLE_PRIVATE_KEY`.
- Keep `\n` escaped as shown.
- Do not commit real secrets to git.
- Share your Google Calendar with the service account email as **Make changes to events**.
- The server auto-creates a default admin user on startup if not found.

## 7) Start the Server

```bash
cd server
npm install
npm run dev
```

Health check:
- `GET http://localhost:5005/api/health`

## 8) Verify Data Flow

Quick checks:

1. `GET /api/school-info` returns one record (id 1).
2. `GET /api/announcements` returns array from sheet tab.
3. `GET /api/events` returns array from sheet tab.
4. Create/update records via admin UI and confirm sheet updates.
5. `POST /api/auth/signup` creates a user with a bcrypt hash in `users`.
6. `POST /api/auth/login` returns `token` + `sessionId` after bcrypt validation.
7. `POST /api/auth/change-password` updates hashed password after validating current password.
8. Protected routes require:
   - `Authorization: Bearer <jwt>`
   - `x-session-id: <sessionId>`

Security policy:
- If a user logs in using `DEFAULT_ADMIN_PASSWORD`, login is rejected with `requiresPasswordChange`.
- User must change password first before getting a successful login.
- Session revocation on `POST /api/auth/logout` invalidates future requests for that token/session.

## Troubleshooting

- **403 / permission denied**
  - Spreadsheet not shared with service account, or Drive file access is private.
- **429 / rate limit**
  - Reduce request frequency or add caching.
- **"Missing required environment variable"**
  - Check `.env` variable names and restart server.
- **Image not visible**
  - Verify Drive file is shared publicly and file id is correct.
