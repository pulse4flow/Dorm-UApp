#!/usr/bin/env node
/**
 * demo:reset — wipe the demo SQLite database and restore a fresh known state.
 *
 *   1. Deletes the local SQLite database file (database/prisma/dev.db)
 *   2. Applies Prisma migrations
 *   3. Seeds the known demo accounts
 */
import { existsSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');
const databaseDir = join(rootDir, 'database');
const prismaDir = join(databaseDir, 'prisma');

const DATABASE_URL = 'file:./dev.db';

const dbFiles = ['dev.db', 'dev.db-journal', 'dev.db-wal', 'dev.db-shm']
  .map((f) => join(prismaDir, f))
  .filter((f) => existsSync(f));

for (const file of dbFiles) {
  rmSync(file, { force: true });
  console.log(`→ Removed ${file}`);
}

function run(cmd, args, opts) {
  const result = spawnSync(cmd, args, { stdio: 'inherit', cwd: databaseDir, ...opts });
  if (result.status !== 0) {
    console.error(`✗ Command failed: ${cmd} ${args.join(' ')}`);
    process.exit(result.status ?? 1);
  }
}

const env = { ...process.env, DATABASE_URL };

console.log('\n⚙️  Generating Prisma Client...');
run('pnpm', ['exec', 'prisma', 'generate'], { env });

console.log('\n📦 Applying Prisma migrations...');
run('pnpm', ['exec', 'prisma', 'migrate', 'deploy'], { env });

console.log('\n🌱 Seeding demo data...');
run('pnpm', ['exec', 'ts-node', 'prisma/seed.ts'], { env });

console.log('\n✅ Demo database reset complete.');
console.log('   Demo accounts: student101 / student101, manager01 / manager01');