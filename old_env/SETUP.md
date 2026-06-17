# Setup Guide

This document provides step-by-step instructions for setting up and deploying your full-stack application.

## Local Development Setup

### 1. Prerequisites

Ensure you have installed:
- Node.js 20+ ([Download](https://nodejs.org/))
- PostgreSQL 16+ ([Download](https://www.postgresql.org/download/))
- Git ([Download](https://git-scm.com/))
- Docker & Docker Compose (Optional, for containerized development)

### 2. Clone and Install

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Return to root
cd ..
```

### 3. Database Setup

#### Option A: Manual PostgreSQL Setup
```bash
# Create database
psql -U postgres
CREATE DATABASE pulse_db;
CREATE USER pulse_user WITH PASSWORD 'pulse_password';
ALTER ROLE pulse_user SET client_encoding TO 'utf8';
ALTER ROLE pulse_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE pulse_user SET default_transaction_deferrable TO on;
ALTER ROLE pulse_user SET default_transaction_read_committed TO on;
GRANT ALL PRIVILEGES ON DATABASE pulse_db TO pulse_user;
\q

# Update backend/.env DATABASE_URL
DATABASE_URL=postgresql://pulse_user:pulse_password@localhost:5432/pulse_db
```

#### Option B: Docker Compose (Recommended)
```bash
# Runs PostgreSQL automatically
docker-compose up -d postgres
```

### 4. Backend Setup

```bash
cd backend

# Copy environment file
cp .env.example .env

# Generate Prisma client
npm run prisma:generate

# Create tables (runs migrations)
npm run prisma:migrate

# Start development server
npm run dev
```

Backend will be available at: `http://localhost:3001`

### 5. Frontend Setup

```bash
cd frontend

# Copy environment file
cp .env.example .env.local

# Start development server
npm run dev
```

Frontend will be available at: `http://localhost:3000`

## Docker Compose Development

Run the entire stack with one command:

```bash
# Start all services
docker-compose up

# Stop all services
docker-compose down

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

All services will be automatically configured and connected.

## Production Deployment

### Deploy Backend to Railway

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub"
   - Choose your repository

3. **Add PostgreSQL Database**
   - Click "Add Service"
   - Select "PostgreSQL"
   - Railway creates a database automatically

4. **Configure Environment Variables**
   - Go to Backend Service > Variables
   - Set:
     ```
     NODE_ENV=production
     FRONTEND_URL=https://your-vercel-domain.vercel.app
     ```
   - `DATABASE_URL` is auto-generated from PostgreSQL service

5. **Configure Start Command**
   - In the railway.toml or in Railway dashboard:
     ```
     npm run prisma:migrate:prod && npm run start:prod
     ```

6. **Deploy**
   - Click "Deploy" or push to trigger auto-deploy

### Deploy Frontend to Vercel

1. **Create Vercel Account**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub

2. **Import Project**
   - Click "New Project"
   - Select your GitHub repository
   - Select the `frontend` directory as root

3. **Configure Environment Variables**
   - Add `NEXT_PUBLIC_API_URL`: Your Railway backend URL
   - Example: `https://backend-production-xxxx.railway.app`

4. **Deploy**
   - Vercel auto-deploys on push to main branch

## Environment Variables Reference

### Backend (.env)

```env
# Server
PORT=3001
NODE_ENV=production

# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Frontend
FRONTEND_URL=https://your-frontend.vercel.app
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
NEXT_PUBLIC_SOCKET_IO_URL=https://your-backend.railway.app
```

## Common Commands

### Database Management
```bash
cd backend

# Create new migration
npm run prisma:migrate -- --name descriptive_name

# Open Prisma Studio UI
npm run prisma:studio

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

### Development
```bash
# Backend hot reload
cd backend && npm run dev

# Frontend hot reload
cd frontend && npm run dev

# Run both (in separate terminals)
```

### Production Build
```bash
# Build backend
cd backend && npm run build

# Build frontend
cd frontend && npm run build
```

## Troubleshooting

### Port Already in Use
```bash
# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Find and kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

### Database Connection Failed
```bash
# Check PostgreSQL is running
psql -U postgres -c "SELECT version();"

# Check connection string
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1;"
```

### Socket.io Connection Issues
- Ensure backend is running
- Check CORS settings in backend (app.enableCors)
- Verify Socket.io URL in frontend .env.local
- Check browser console for connection errors

### Prisma Migration Issues
```bash
# Resolve migration conflicts
npx prisma migrate resolve --rolled-back

# Force migration
npx prisma migrate deploy --skip-validate
```

## Next Steps

1. **Create Models**: Add entities to `backend/prisma/schema.prisma`
2. **Generate API Routes**: Create controllers in `backend/src/app`
3. **Build UI Components**: Create React components in `frontend/src`
4. **Add WebSocket Events**: Extend `backend/src/app/events.gateway.ts`
5. **Connect Frontend**: Use `useSocket()` hook in components

## Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Socket.io Documentation](https://socket.io/docs/)
- [Railway Documentation](https://docs.railway.app/)
- [Vercel Documentation](https://vercel.com/docs)

## Support

For issues or questions:
1. Check the main README.md
2. Review documentation links above
3. Check browser console and server logs
4. Create an issue in your repository
