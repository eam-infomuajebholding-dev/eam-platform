import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const E2E_DIR = path.dirname(fileURLToPath(import.meta.url));
const BACKEND_DIR = path.resolve(E2E_DIR, '../../../backend');
const PROJECT_ENV = path.resolve(E2E_DIR, '../../../../.env');
const BACKEND_URL = process.env.E2E_BACKEND_URL ?? 'http://127.0.0.1:8000';

/** Read JWT_SECRET_KEY from env or project `.env` (names only — never log value). */
export function resolveE2eJwtSecret(): string {
  if (process.env.E2E_JWT_SECRET_KEY?.trim()) {
    return process.env.E2E_JWT_SECRET_KEY.trim();
  }
  if (process.env.JWT_SECRET_KEY?.trim()) {
    return process.env.JWT_SECRET_KEY.trim();
  }

  for (const envPath of [PROJECT_ENV, path.join(BACKEND_DIR, '.env')]) {
    if (!fs.existsSync(envPath)) continue;
    for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#') || !trimmed.startsWith('JWT_SECRET_KEY=')) {
        continue;
      }
      const value = trimmed.slice('JWT_SECRET_KEY='.length).trim();
      if (value) return value.replace(/^["']|["']$/g, '');
    }
  }

  return 'e2e-local-jwt-secret';
}

export function mintAdminToken(): string {
  const jwtSecret = resolveE2eJwtSecret();
  return execSync('python scripts/mint_admin_jwt.py', {
    cwd: BACKEND_DIR,
    encoding: 'utf8',
    env: {
      ...process.env,
      JWT_SECRET_KEY: jwtSecret,
      JWT_EXPIRE_MINUTES: process.env.JWT_EXPIRE_MINUTES ?? '60',
      JWT_ALGORITHM: process.env.JWT_ALGORITHM ?? 'HS256',
    },
  }).trim();
}

/** Fail fast when running backend JWT config does not match test minting. */
export async function assertBackendAcceptsAdminToken(token: string): Promise<void> {
  const response = await fetch(`${BACKEND_URL}/api/v1/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (response.ok) return;

  throw new Error(
    [
      `E2E auth preflight failed (HTTP ${response.status}).`,
      'Ensure the running backend uses the same JWT_SECRET_KEY as E2E minting.',
      'Set E2E_JWT_SECRET_KEY or restart uvicorn after aligning app/.env.',
      'See docs/engineering/E2E_TEST_AUTH.md',
    ].join(' '),
  );
}
