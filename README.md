# DormDash

A lightweight, demo-ready app for university **dorm life** — announcements, maintenance requests, dorm info, and a personal (device-local) task/bookmark tracker. No student accounts needed; only the admin area is protected.

Built on Next.js 15 (App Router) + TypeScript + Prisma + SQLite. Announcements, repairs, categories, tags, and admins live in SQLite; tasks, bookmarks, and read-state are stored per-browser in `localStorage`.

## Quick start

```bash
npm install
cp .env.example .env          # then fill in AUTH_SECRET and ADMIN_REGISTRATION_KEY (see below)
npm run demo:setup            # applies migrations + seeds demo data
npm run dev                   # http://localhost:3000
```

### Environment variables (`.env`)

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | SQLite path, e.g. `file:./dev.db` |
| `AUTH_SECRET` | ≥ 32 chars — signs the admin JWT session cookie |
| `ADMIN_REGISTRATION_KEY` | Required to create an admin account at `/admin/register` |

```
AUTH_SECRET=$(openssl rand -hex 32)
ADMIN_REGISTRATION_KEY=$(openssl rand -hex 16)
```

### Demo account

Seeding creates one admin:

```
email:    admin@dormpoon.example
password: dormdash-admin-1234
```

Sign in at `/admin/login`.

## What's here

### Public (students — no account)
- `/` — dashboard: quick utilities, latest announcements, upcoming events with countdowns, and your device-local tasks & bookmarks
- `/announcements` — browse/filter announcements; `/search?q=` searches title/summary/content/tags
- `/announcements/[id]` — full announcement; bookmark / mark-read are stored locally
- `/maintenance` — submit a maintenance request (room + category + description) and see recent public requests
- `/dorm-info` — contacts, office hours, facilities, rules, Wi-Fi
- `/tasks`, `/bookmarks` — per-browser local state

### Admin (login required)
- `/admin` — dashboard with announcement stats
- `/admin/announcements` + `/new` + `[id]/edit` — full CRUD (status, priority, publish/expire/event dates, category, tags)
- `/admin/categories`, `/admin/tags` — manage taxonomy
- `/admin/repairs` — filter repair requests by status/category and update their status

### API
- `/api/announcements` (GET public, GET `?admin=true`, POST admin)
- `/api/announcements/[id]` (GET public/admin, PATCH/DELETE admin)
- `/api/repairs` (GET public, POST public) — no login needed to report an issue
- `/api/repairs/[id]` (GET public, PATCH admin status only)
- `/api/categories`, `/api/tags`, `/api/uploads`, `/api/auth/login|register|logout`

## Demo scripts

- `npm run demo:setup` — apply migrations, then seed (safe to re-run; seed uses upserts).
- `npm run demo:reset` — **drop and recreate** the database (all data lost), then re-seed. Stop the dev server first.

`npm run prisma:seed` reseeds without touching the schema.

## Data model

`Admin`, `Announcement` (status/priority/publishAt/expiresAt/eventAt/category/tags/attachments), `Category`, `Tag`, `AnnouncementTag`, `Attachment`, and `RepairRequest` (room, requesterName, title, description, category, status: PENDING → IN_PROGRESS → RESOLVED).

## Tech notes

- Admin auth: cookie-based JWT (`dormdash_admin`), bcrypt password hashes, 8-hour sessions.
- Status visibility: only `PUBLISHED`, published-at, and not-expired announcements are shown publicly.
- This is the `demo-v2` branch — a fresh, self-contained demo rework of the earlier demo (no migration history from demo-v1).