import { createHash, randomBytes } from 'node:crypto';

/** sha256 hex digest — used to persist session tokens (docs/ARCHITECTURE.md §auth). */
export function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

/** RFC 4648 URL-safe base64 without padding. */
export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString('base64url');
}