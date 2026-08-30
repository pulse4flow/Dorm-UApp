#!/usr/bin/env node
/**
 * dev — start the backend first, wait until it is healthy, then start the frontend.
 *
 * `next dev` becomes ready in well under a second, while the Nest backend still
 * needs to compile and boot. Without this gate the Next.js dev proxy (/api/*)
 * would 500 against a backend that has not finished starting yet, which the UI
 * surfaced as "API Error: Internal Server Error". Starting the frontend only
 * after /health reports ok removes that race for good.
 */
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

const HEALTH_URL = 'http://127.0.0.1:3001/health';
const BOOT_TIMEOUT_MS = 45_000;
const POLL_INTERVAL_MS = 500;

let backend = null;
let frontend = null;
let shuttingDown = false;

const sleep = (ms) => new Promise((resolvePromise) => setTimeout(resolvePromise, ms));

async function isBackendHealthy() {
  try {
    const res = await fetch(HEALTH_URL, { signal: AbortSignal.timeout(1500) });
    if (res.status !== 200) return false;
    const body = await res.json().catch(() => ({}));
    return body.status === 'ok' && body.database === 'connected';
  } catch {
    return false;
  }
}

function spawnBackend() {
  console.log('\n▶ Starting backend...');
  backend = spawn('pnpm', ['--filter', 'backend', 'dev'], {
    cwd: rootDir,
    stdio: 'inherit',
  });
  backend.on('exit', (code, signal) => {
    if (!shuttingDown && code !== 0 && signal !== 'SIGTERM') {
      printBackendFailedHints();
    }
  });
}

function spawnFrontend() {
  console.log('\n▶ Backend is healthy — starting frontend...');
  frontend = spawn('pnpm', ['--filter', 'frontend', 'dev'], {
    cwd: rootDir,
    stdio: 'inherit',
  });
}

async function waitForBackend() {
  const deadline = Date.now() + BOOT_TIMEOUT_MS;
  while (Date.now() < deadline) {
    if (backend) {
      const backendExited =
        typeof backend.exitCode === 'number' && backend.exitCode !== null;
      if (backendExited && !shuttingDown) return 'exited';
    }
    if (await isBackendHealthy()) return 'ready';
    await sleep(POLL_INTERVAL_MS);
  }
  return 'timeout';
}

function printBackendFailedHints() {
  console.error(`
✗ The backend exited before becoming ready.

Possible causes:
  - Port 3001 already in use by a stale process: kill it and retry.
      lsof -i :3001          # find the PID
      kill <pid>
  - Environment files missing: create them once with  pnpm demo:setup
  - Database not prepared:                        pnpm demo:setup   (or pnpm demo:reset)
  - See the backend output above for the exact error.
`);
}

function shutdown() {
  shuttingDown = true;
  for (const child of [backend, frontend]) {
    if (child && child.exitCode === null) {
      child.kill('SIGTERM');
    }
  }
}

process.on('SIGINT', () => {
  console.log('\nStopping dev…');
  shutdown();
  process.exit(0);
});
process.on('SIGTERM', () => {
  shutdown();
  process.exit(0);
});

async function main() {
  if (await isBackendHealthy()) {
    console.log('⚠  A healthy backend is already running on :3001 — reusing it.');
    spawnFrontend();
    return;
  }

  spawnBackend();
  const result = await waitForBackend();

  if (result === 'ready') {
    spawnFrontend();
    return;
  }

  if (result === 'exited') {
    printBackendFailedHints();
  } else {
    console.error(`
✗ The backend did not become healthy within ${BOOT_TIMEOUT_MS / 1000}s.

  - Was the database prepared?   pnpm demo:setup   (or a full reset: pnpm demo:reset)
  - Check the backend manually:  curl http://localhost:3001/health
      A "database":"disconnected" response means the SQLite schema is missing.
  - Is another process squatting on :3001 and failing to serve /health?
      lsof -i :3001
`);
  }
  shutdown();
  process.exit(1);
}

main();