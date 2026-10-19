import type { AuthUser } from '@cdp/shared';

/** Fastify request enriched by AuthGuard. */
export interface RequestWithUser {
  user: AuthUser;
  cookies?: Record<string, string | undefined>;
  setCookie: (name: string, value: string, options: Record<string, unknown>) => void;
  clearCookie: (name: string) => void;
}

export interface SessionTokenPair {
  /** Raw opaque token stored in the HttpOnly cookie. */
  token: string;
  /** sha256 of `token` — the only thing persisted in `sessions`. */
  tokenHash: string;
}