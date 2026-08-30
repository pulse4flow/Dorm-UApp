import { ConfigService } from '@nestjs/config';

/**
 * Single source of truth for the JWT secret.
 *
 * The secret must be provided via the JWT_SECRET environment variable.
 * There is intentionally NO hardcoded fallback — if it is missing the
 * application fails fast with a clear message instead of silently
 * signing tokens with a known secret.
 */
export function getJwtSecret(configService: ConfigService): string {
  const secret = configService.get<string>('JWT_SECRET')?.trim();
  if (!secret) {
    throw new Error(
      'JWT_SECRET is not set. Add JWT_SECRET to backend/.env (see backend/.env.example), ' +
        'or run `pnpm demo:setup` to create it from the example.',
    );
  }
  return secret;
}