
# DormDash

DormDash is a student utility dashboard: official announcements come from the server, while bookmarks, read state, cached announcements, and personal tasks remain in each student's browser. Students never create an account.

## Stack and architecture

- Next.js App Router and TypeScript
- SQLite with Prisma for self-contained local development
- Cookie-based, JWT-backed admin sessions; bcrypt password hashing
- Server-owned `Admin`, announcements, categories, tags, and attachment metadata
- Browser Local Storage for student-specific state only

Public API reads require no authentication. Every content-changing endpoint requires a validated admin session. Uploads accept only PDF, DOCX, XLSX, ZIP, JPEG, PNG, and WebP files, with 5 MB image and 10 MB attachment limits.

## Setup

1. Copy `.env.example` to `.env`. The supplied `file:./dev.db` URL runs locally with no database service.
2. Set a unique `AUTH_SECRET` of at least 32 characters and a private `ADMIN_REGISTRATION_KEY`.
3. Install dependencies: `npm install`
4. Apply the database schema: `npm run prisma:migrate -- --name init`
5. Optionally add the example announcement: `npm run prisma:seed`
6. Start development: `npm run dev`

The first authorized administrator registers at `/admin/register` using the server-only registration key. Then use `/admin/login` to manage content.

Open `http://localhost:3000` after starting the development server.

## Production deployment

Use a hosted PostgreSQL database for deployment. Change `provider` in `prisma/schema.prisma` to `postgresql`, set `DATABASE_URL` to the provider connection string, generate a PostgreSQL migration with `npx prisma migrate dev --name postgres-init`, and deploy it with `npx prisma migrate deploy`.

Set unique production values for `AUTH_SECRET` (at least 32 random characters) and `ADMIN_REGISTRATION_KEY` in the deployment platform's secret manager; do not commit `.env`. Run `npm run build` during CI and `npm run start` on the hosting platform. Persist `public/uploads` with object storage or a persistent volume, because ephemeral server files are not suitable for user uploads.

## Pages

- `/` and `/announcements`: public feed with search, category filtering, sorting, countdowns, and cache fallback
- `/announcements/[id]`: public announcement detail and attachments
- `/bookmarks`, `/tasks`, `/search`: browser-local student workflow
- `/admin`: protected content dashboard
- `/admin/announcements`, `/admin/categories`, `/admin/tags`: protected management pages

## API overview

Public: `GET /api/announcements`, `GET /api/announcements/:id`, `GET /api/categories`, and `GET /api/tags`.

Authenticated administrators can use `POST/PATCH/DELETE` on announcement, category, and tag endpoints, plus `POST /api/uploads`. Authentication routes are `POST /api/auth/register`, `/login`, and `/logout`.

## Local Storage

`bookmarkedAnnouncements`, `readAnnouncements`, `hiddenAnnouncements`, `personalTasks`, and `announcementCache` are scoped to the current browser. No student identity or student-specific server records are created.
