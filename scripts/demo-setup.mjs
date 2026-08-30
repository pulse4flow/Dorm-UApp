#!/usr/bin/env node
/**
 * demo:setup — prepare a clean, deterministic demo database.
 *
 *   1. Copies example env files if missing (backend/.env, database/.env)
 *   2. Applies Prisma migrations (creates the local SQLite file if needed)
 *   3. Seeds the known demo accounts
 *
 * Safe to re-run: existing data is never wiped, only migrated/re-seeded.
 */
import { existsSync, copyFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');
const databaseDir = join(rootDir, 'database');

// SQLite URL is relative to database/prisma/schema.prisma when run from the database package,
// so "file:./dev.db" resolves to database/prisma/dev.db.
const DATABASE_URL = 'file:./dev.db';

function ensureEnvFile(dir) {
  const example = join(dir, '.env.example');
  const target = join(dir, '.env');
  if (existsSync(target)) return;
  if (!existsSync(example)) {
    console.error(`✗ Missing ${example} (required for ${dir}).`);
    process.exit(1);
  }
  copyFileSync(example, target);
  console.log(`→ Created ${join(dir, '.env')} from .env.example`);
}

function run(cmd, args, opts) {
  const result = spawnSync(cmd, args, { stdio: 'inherit', cwd: databaseDir, ...opts });
  if (result.status !== 0) {
    console.error(`✗ Command failed: ${cmd} ${args.join(' ')}`);
    process.exit(result.status ?? 1);
  }
}

ensureEnvFile(databaseDir);
ensureEnvFile(join(rootDir, 'backend'));

const env = { ...process.env, DATABASE_URL };

console.log('\n⚙️  Generating Prisma Client...');
run('pnpm', ['exec', 'prisma', 'generate'], { env });

console.log('\n📦 Applying Prisma migrations...');
run('pnpm', ['exec', 'prisma', 'migrate', 'deploy'], { env });

console.log('\n🌱 Seeding demo data...');
run('pnpm', ['exec', 'ts-node', 'prisma/seed.ts'], { env });

console.log('\n✅ Demo database ready.');
console.log('   Demo accounts: student101 / student101, manager01 / manager01');