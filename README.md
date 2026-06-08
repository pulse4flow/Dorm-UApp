# Full-Stack Application

A modern full-stack application with:
- **Frontend**: Next.js 16 + React 19
- **Backend**: NestJS + Express
- **Database**: PostgreSQL with Prisma ORM
- **Realtime**: Socket.io
- **Deployment**: Vercel (Frontend) + Railway (Backend)

## Project Structure

```
├── frontend/          # Next.js frontend application
│   ├── src/
│   ├── public/
│   ├── .env.local    # Local environment variables
│   └── Dockerfile
├── backend/          # NestJS backend application
│   ├── src/
│   ├── prisma/       # Database schema
│   ├── .env          # Local environment variables
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose (optional, for containerized setup)
- PostgreSQL 16+ (if running without Docker)

### Setup with Docker Compose

```bash
# Start all services (PostgreSQL, Backend, Frontend)
docker-compose up -d

# Frontend: http://localhost:3000
# Backend: http://localhost:3001
# PostgreSQL: localhost:5432
```

### Manual Setup

#### 1. Database Setup
```bash
# Create PostgreSQL database
createdb -U user -W pulse_db
```

#### 2. Backend Setup
```bash
cd backend

# Copy environment file
cp .env.example .env

# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Start development server
npm run dev
```

Backend runs on: `http://localhost:3001`

#### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs on: `http://localhost:3000`

## Environment Variables

### Backend (.env)
```env
PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/pulse_db
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SOCKET_IO_URL=http://localhost:3001
```

## Available Scripts

### Backend
```bash
npm run dev              # Development mode with hot reload
npm run build            # Build TypeScript
npm run start:prod       # Production mode
npm run prisma:migrate   # Create database migrations
npm run prisma:studio    # Open Prisma Studio UI
npm run lint             # Run ESLint
```

### Frontend
```bash
npm run dev              # Development mode
npm run build            # Build for production
npm start                # Start production server
npm run lint             # Run ESLint
```

## Database Migrations

### Create a new migration
```bash
cd backend
npm run prisma:migrate -- --name migration_name
```

### Apply migrations in production
```bash
npm run prisma:migrate:prod
```

## Deployment

### Vercel (Frontend)
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables:
   - `NEXT_PUBLIC_API_URL` = Your backend URL
4. Deploy automatically on push to main

### Railway (Backend)
1. Create Railway project
2. Connect GitHub repository
3. Add PostgreSQL database
4. Set environment variables:
   - `DATABASE_URL` = Railway PostgreSQL URL
   - `FRONTEND_URL` = Your Vercel frontend URL
5. Deploy

### Environment Setup for Production

**Backend on Railway:**
```env
PORT=3001
NODE_ENV=production
DATABASE_URL=<railway-postgresql-url>
FRONTEND_URL=<vercel-frontend-url>
```

**Frontend on Vercel:**
```env
NEXT_PUBLIC_API_URL=<railway-backend-url>
NEXT_PUBLIC_SOCKET_IO_URL=<railway-backend-url>
```

## Real-time Communication

Socket.io is configured for real-time features. Server-side WebSocket gateway is in `backend/src/app/events.gateway.ts`.

### Client-side usage example:
```typescript
import { io } from 'socket.io-client';

const socket = io(process.env.NEXT_PUBLIC_SOCKET_IO_URL);

socket.on('connect', () => {
  console.log('Connected!');
});

socket.emit('message', { text: 'Hello' });
socket.on('message', (data) => {
  console.log('Received:', data);
});
```

## API Endpoints

### Health Check
```
GET /api/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2024-05-27T11:40:26.763Z"
}
```

## Troubleshooting

### Port already in use
```bash
# Kill process on port 3000 (Frontend)
lsof -ti:3000 | xargs kill -9

# Kill process on port 3001 (Backend)
lsof -ti:3001 | xargs kill -9
```

### Database connection issues
- Verify PostgreSQL is running
- Check DATABASE_URL in .env
- Ensure database user has correct permissions

### WebSocket connection issues
- Verify CORS settings in backend
- Check that Socket.io URL matches in environment variables
- Ensure backend is running and accessible

## Development Tips

1. **Hot Reload**: Both frontend and backend support hot reload in development mode
2. **Database Explorer**: Use `npm run prisma:studio` to visualize database
3. **TypeScript**: Full type safety across the stack
4. **CORS**: Already configured for development and production

## License

MIT
