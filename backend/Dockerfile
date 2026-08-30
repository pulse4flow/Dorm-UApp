FROM node:20-alpine

RUN corepack enable && corepack prepare pnpm@11.11.0 --activate

WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY backend/package.json backend/
COPY frontend/package.json frontend/
COPY database/package.json database/

RUN pnpm install --frozen-lockfile

COPY backend/ ./backend/
COPY database/ ./database/

ENV DATABASE_URL="file:./dev.db"

RUN cd backend && pnpm run prisma:generate

RUN cd backend && pnpm run build

EXPOSE 3001

CMD ["pnpm", "--filter", "backend", "run", "start:prod"]