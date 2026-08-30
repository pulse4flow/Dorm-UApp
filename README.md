# DormDash — Dormitory Portal

A dormitory management demo app: students manage repairs, scores, rooms, and notifications; managers administer users.

- **Frontend:** Next.js (React, TypeScript, Tailwind) — port **3000**
- **Backend:** NestJS (TypeScript, Prisma) — port **3001**
- **Database:** SQLite (demo) via Prisma — no PostgreSQL server required

---

## Prerequisites

- **Node.js** ≥ 20 (LTS recommended)
- **pnpm** ≥ 9

Check with:

```bash
node --version  # v20+
pnpm --version  # 9+
```

---

## Fresh setup (demo)

```bash
pnpm install      # install all workspace packages
pnpm demo:setup   # prepare the SQLite database + seed demo accounts
pnpm dev          # start backend (3001) and frontend (3000) together
```

Then open **http://localhost:3000**.

`pnpm demo:setup` is safe to re-run. It:

1. creates `backend/.env` and `database/.env` from the example files if they do not exist,
2. applies the Prisma schema/migrations (creating `database/prisma/dev.db` if needed),
3. seeds deterministic demo data.

It never wipes existing data — use `pnpm demo:reset` for a clean slate.

---

## Demo accounts

| Username      | Password    | Role    |
| ------------- | ----------- | ------- |
| `student101`  | `student101`| Student |
| `student102`  | `student102`| Student |
| `student103`  | `student103`| Student |
| `manager01`   | `manager01` | Manager |
| `manager02`   | `manager02` | Manager |

Passwords equal the username.

---

## Reset

```bash
pnpm demo:reset
```

This deletes the demo SQLite database, recreates the schema, and reseeds — restoring the app to a known demo state. The demo accounts above always work after a reset.

---

## Scripts (run from the repository root)

| Command              | Description                                            |
| -------------------- | ------------------------------------------------------ |
| `pnpm dev`           | Run backend + frontend in watch mode                   |
| `pnpm dev:backend`   | Backend only                                           |
| `pnpm dev:frontend`  | Frontend only                                          |
| `pnpm demo:setup`    | Prepare + seed the demo database                       |
| `pnpm demo:reset`    | Wipe + recreate + reseed the demo database             |
| `pnpm build`         | Build backend and frontend                             |
| `pnpm lint`          | Type-check backend, lint frontend                      |
| `pnpm test`          | Run the backend e2e tests (login flow, health)         |
| `db:studio`          | Open Prisma Studio against the demo database           |
| `db:reset`           | Drop + recreate + reseed the database (`migrate reset`) |

The database is **never** wiped or reseeded automatically during normal backend startup. `demo:setup` / `demo:reset` prepare it explicitly.

---

## Environment variables

All variables are optional in demo mode except `JWT_SECRET`. `pnpm demo:setup` generates `backend/.env` and `database/.env` from the committed example files.

### Backend (`backend/.env` ← `backend/.env.example`)

| Variable     | Demo default            | Description                          |
| ------------ | ----------------------- | ------------------------------------ |
| `PORT`       | `3001`                  | Backend listen port                  |
| `NODE_ENV`   | `development`           | Node environment                     |
| `DATABASE_URL` | `file:./dev.db`       | SQLite file (relative to `database/prisma/schema.prisma`) |
| `JWT_SECRET` | `dorm-demo-secret-change-me` | Secret used to sign/verify JWTs. **Required** — the backend refuses to start without it. Change it for anything beyond a local demo. |
| `FRONTEND_URL` | `http://localhost:3000` | Allowed CORS / WebSocket origin      |

### Database (`database/.env` ← `database/.env.example`)

| Variable     | Demo default            | Description                          |
| ------------ | ----------------------- | ------------------------------------ |
| `DATABASE_URL` | `file:./dev.db`       | SQLite file used by Prisma CLI/seed  |

### Frontend (`frontend/.env.local` ← `frontend/.env.example`)

| Variable                   | Demo default             | Description                                   |
| -------------------------- | ------------------------ | --------------------------------------------- |
| `NEXT_PUBLIC_API_URL`      | `/api`                   | API base URL. `/api` routes through the Next.js proxy to the backend |
| `NEXT_PUBLIC_SOCKET_IO_URL` | `http://localhost:3001` | Socket.IO server for live notifications       |

Frontend env files are optional — the app ships with the dev defaults above.

---

## Ports

| Service  | URL                              |
| -------- | -------------------------------- |
| Frontend | http://localhost:3000            |
| Backend  | http://localhost:3001            |
| Health   | http://localhost:3001/health     |

With the default `NEXT_PUBLIC_API_URL=/api`, the browser talks to `http://localhost:3000/api/...` and Next.js proxies those requests to the backend.

---

## Database

The demo uses a local **SQLite** database stored at `database/prisma/dev.db` (gitignored). The schema models (`User`, `Student`, `Room`, `Repair`, `Notification`, `ScoreHistory`) are unchanged between demo and production.

**PostgreSQL in production:** the backend and seed code are database-agnostic (Prisma only, no raw SQL). To move back to PostgreSQL later:

1. In `database/prisma/schema.prisma` set `provider = "postgresql"` and point `DATABASE_URL` at your server,
2. delete `database/prisma/migrations` and regenerate: `pnpm db:migrate -- --name init` (or `prisma migrate dev`),
3. re-run generate/build.

---

## Docker (optional)

Docker is optional — the primary demo path is plain `pnpm`. If you prefer containers:

```bash
# on the host, prepare the demo database first
pnpm demo:setup

docker compose up -d --build
```

- Runs **backend** (3001) and **frontend** (3000) — **no PostgreSQL service**.
- The SQLite database is persisted to `database/prisma/dev.db` on the host via a bind mount.
- The backend applies migrations on startup but does **not** reseed. If you skipped `pnpm demo:setup`, seed once with:

```bash
docker compose run --rm backend sh -c "cd /app/database && pnpm exec ts-node prisma/seed.ts"
```

---

## Testing

```bash
pnpm test   # runs the backend e2e suite against a throw-away SQLite file
```

Covers: demo login success (student + manager), wrong password → 401, protected endpoint without/invalid JWT → 401, and `GET /health`.

---

## Troubleshooting

**Login fails**
- Make sure `pnpm demo:setup` completed (or run `pnpm demo:reset`). The demo accounts only exist after seeding.
- Confirm the backend is up: `curl http://localhost:3001/health` should return `{"status":"ok","database":"connected"}`.

**Database reset**
- `pnpm demo:reset` fully rebuilds the SQLite database. It is safe to run anytime.

**Port already in use**
- `pnpm dev` needs ports **3000** and **3001** free. If something already listens on them, stop that process first, e.g.:
  ```bash
  lsof -i :3000 -i :3001   # find the PID(s)
  kill <pid>
  ```
- You can also run the services individually with `pnpm dev:backend` and `pnpm dev:frontend`.

**Missing environment variables**
- The backend fails fast with `JWT_SECRET is not set. Add JWT_SECRET to backend/.env ...` if it is missing.
- Fix: run `pnpm demo:setup` (creates `backend/.env` and `database/.env` from the examples) or create the files manually.
- `DATABASE_URL` must point at the SQLite file (`file:./dev.db`) in demo mode.

**Stale / inconsistent database state**
- If data looks wrong after code changes, run `pnpm demo:reset` to restore the known demo state.