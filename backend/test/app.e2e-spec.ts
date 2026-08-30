/**
 * End-to-end tests for the demo login flow plus the health endpoint.
 *
 * These tests use a dedicated SQLite file (database/prisma/test.db) that is
 * migrated and seeded before the app boots, so they never touch dev.db.
 */
import { execSync } from 'node:child_process';
import { existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app/app.module';

const TEST_DB = 'file:./test.db';

process.env.DATABASE_URL = TEST_DB;
process.env.JWT_SECRET = 'test-secret';
process.env.FRONTEND_URL = 'http://localhost:3000';

async function prepareTestDatabase() {
  const databaseDir = join(__dirname, '..', '..', 'database');
  for (const file of ['test.db', 'test.db-journal', 'test.db-wal', 'test.db-shm']) {
    const path = join(databaseDir, 'prisma', file);
    if (existsSync(path)) rmSync(path);
  }

  const env = { ...process.env, DATABASE_URL: TEST_DB };
  execSync('pnpm exec prisma migrate deploy', {
    cwd: databaseDir,
    env,
    stdio: 'inherit',
  });
  execSync('pnpm exec ts-node prisma/seed.ts', {
    cwd: databaseDir,
    env,
    stdio: 'inherit',
  });
}

describe('Demo login flow (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    await prepareTestDatabase();

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('logs in student101 / student101', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'student101', password: 'student101' })
      .expect(201);

    expect(res.body.token).toBeDefined();
    expect(res.body.user.username).toBe('student101');
    expect(res.body.user.role).toBe('student');
  });

  it('logs in manager01 / manager01', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'manager01', password: 'manager01' })
      .expect(201);

    expect(res.body.user.username).toBe('manager01');
    expect(res.body.user.role).toBe('manager');
  });

  it('rejects a wrong password with 401', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'student101', password: 'incorrect-password' })
      .expect(401);
  });

  it('rejects an authenticated endpoint without a token', async () => {
    await request(app.getHttpServer()).get('/auth/profile').expect(401);
  });

  it('rejects an invalid JWT with 401', async () => {
    await request(app.getHttpServer())
      .get('/auth/profile')
      .set('Authorization', 'Bearer not-a-valid-token')
      .expect(401);
  });

  it('accepts a valid JWT for the profile endpoint', async () => {
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'student101', password: 'student101' })
      .expect(201);

    const res = await request(app.getHttpServer())
      .get('/auth/profile')
      .set('Authorization', `Bearer ${login.body.token}`)
      .expect(200);

    expect(res.body.username).toBe('student101');
  });

  it('reports the demo database as connected via /health', async () => {
    const res = await request(app.getHttpServer()).get('/health').expect(200);
    expect(res.body).toEqual({ status: 'ok', database: 'connected' });
  });

  it('keeps the legacy /api/health endpoint working', async () => {
    const res = await request(app.getHttpServer()).get('/api/health').expect(200);
    expect(res.body.status).toBe('ok');
  });
});