# DormDash

DormDash is a utility and productivity portal for dormitories. It helps residents receive important updates and lets dormitory managers handle day-to-day communication, maintenance, and tenant scores. It is not a full dormitory management system.

## What users can do

| Role | Access |
| --- | --- |
| Student | Sign in, view announcements and image galleries, view their maintenance requests, and view their score information. Student announcement access is read-only. |
| Manager | All student access plus the dashboard, announcement creation/editing/deletion, image upload/removal, student management, maintenance management, and score management. |

The existing application role values are `student` and `manager`. The manager role is the administrator role described throughout this README.

### Announcements

- Everyone signed in can browse announcements, open their details, and click images for a larger preview.
- A card uses the first announcement image as its thumbnail; otherwise it displays a placeholder.
- Managers can create, edit, and delete announcements from **Announcements** in the dashboard.
- Managers can drag and drop images or select them from their device. Each announcement permits up to five JPEG, PNG, or WebP images, with a 5 MB limit per image.
- Managers can keep existing images while editing, add more images, or remove an individual image.

## Quick start

### Prerequisites

- Node.js 20 or newer
- pnpm 9 or newer

Enable pnpm through Corepack if needed:

```bash
corepack enable
```

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure the backend

```bash
cp backend/.env.example backend/.env
```

The default `DATABASE_URL` uses the self-contained SQLite database at `database/prisma/dev.db`. No database server or Docker is required for local development.

### 3. Create and seed the database

For a fresh local database, apply the checked-in SQLite migration, generate the Prisma client, then seed:

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

### 4. Run the application

```bash
pnpm dev
```

Open:

- Application: <http://localhost:3000>
- API: <http://localhost:3001>
- Swagger API documentation: <http://localhost:3001/api>

### Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| Student | `student1@test.com` | `password123` |
| Manager | `admin@dorm.com` | `admin123` |

These credentials are seeded for local development only. Change or remove them outside local environments.

## Developer guide

### Workspace layout

```text
backend/                 NestJS API
  src/auth/              Existing JWT authentication, guards, and roles
  src/announcements/     Announcement CRUD and image upload endpoints
  src/prisma/            Prisma service
database/
  prisma/schema.prisma   Shared SQLite schema
  prisma/seed.ts         Development seed data
frontend/                Next.js dashboard
  src/app/               App Router pages
  src/features/          Feature UI components
  src/services/          API clients
  src/types/             Shared frontend types
```

### Useful commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Run all workspaces in development mode. |
| `pnpm dev:backend` | Run only the NestJS API. |
| `pnpm dev:frontend` | Run only the Next.js frontend. |
| `pnpm build` | Build backend and frontend. |
| `pnpm lint` | Run workspace lint commands. |
| `pnpm db:generate` | Regenerate the Prisma client after schema changes. |
| `pnpm db:seed` | Seed local development data. |
| `pnpm db:studio` | Open Prisma Studio. |

### Announcement API

All announcement endpoints require the existing JWT bearer token.

| Method | Path | Role | Purpose |
| --- | --- | --- | --- |
| `GET` | `/announcements` | Student or manager | List announcements with images. |
| `GET` | `/announcements/:id` | Student or manager | Get an announcement and its gallery. |
| `POST` | `/announcements` | Manager | Create an announcement. |
| `PUT` | `/announcements/:id` | Manager | Update title or content. |
| `DELETE` | `/announcements/:id` | Manager | Delete an announcement and its images. |
| `POST` | `/announcements/:id/images` | Manager | Upload `images` as multipart form data. |
| `DELETE` | `/announcements/:id/images/:imageId` | Manager | Delete one image. |

Uploaded announcement images are stored in `backend/uploads/announcements` during local development and served at `/uploads/announcements/<filename>`. Ensure the uploads directory is backed by persistent storage in production.

### Adding a feature

1. Reuse `JwtAuthGuard`, `RolesGuard`, and `@Roles('manager')` for manager-only API changes. Do not create a parallel authentication or role system.
2. Update `database/prisma/schema.prisma`, generate the Prisma client, and add a migration whenever persistent data changes.
3. Keep the backend module, controller, service, DTO, frontend service, types, and page/component changes together for a feature.
4. Keep student interfaces read-only. Backend authorization remains the source of truth even when controls are hidden in the frontend.
5. Add or update Swagger decorators for externally consumed API endpoints.

### Environment variables

| Variable | Used by | Description |
| --- | --- | --- |
| `DATABASE_URL` | Backend / Prisma | SQLite connection URL; defaults to `file:./dev.db`. |
| `PORT` | Backend | API port; defaults to `3001`. |
| `FRONTEND_URL` | Backend | Allowed CORS origin; defaults to `http://localhost:3000`. |
| `JWT_SECRET` | Backend | JWT signing secret. Set a strong unique value outside development. |
| `NEXT_PUBLIC_API_URL` | Frontend | Public backend URL; defaults to `http://localhost:3001`. |
| `NEXT_PUBLIC_SOCKET_IO_URL` | Frontend | Public Socket.IO URL. |

## Deployment notes

- Set a strong `JWT_SECRET` and the exact public `FRONTEND_URL`.
- Persist `backend/uploads` outside the container filesystem or move uploads to object storage before deploying multiple backend instances.
- Persist `database/prisma/dev.db` if the deployment uses the bundled SQLite database. SQLite is suitable for a single backend instance; use PostgreSQL before scaling to multiple instances.
- Run schema changes through reviewed Prisma migrations rather than `prisma db push`.
- Restrict the CORS origin to the deployed frontend URL.
