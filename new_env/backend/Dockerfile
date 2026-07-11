FROM node:20-alpine

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY backend/package.json backend/

RUN pnpm install --frozen-lockfile

COPY backend/ ./backend/

RUN cd backend && pnpm run prisma:generate

RUN cd backend && pnpm run build

EXPOSE 3001

CMD ["pnpm", "--filter", "backend", "run", "start:prod"]
