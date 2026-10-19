import type { FastifyReply } from 'fastify';

/**
 * Shared cookie helpers used by the auth service. Kept thin on purpose:
 * cookie semantics live here, session semantics live in the auth service.
 */
export interface SessionCookieOptions {
  name: string;
  value: string;
  maxAgeSeconds: number;
  secure: boolean;
  sameSite: 'lax' | 'strict' | 'none';
  httpOnly: boolean;
  path: string;
}

export function sessionCookieOptions(env: {
  COOKIE_NAME: string;
  COOKIE_SECURE: boolean;
  SESSION_TTL_HOURS: number;
}): Pick<SessionCookieOptions, 'name' | 'maxAgeSeconds' | 'secure' | 'sameSite' | 'httpOnly' | 'path'> {
  return {
    name: env.COOKIE_NAME,
    maxAgeSeconds: env.SESSION_TTL_HOURS * 60 * 60,
    secure: env.COOKIE_SECURE,
    sameSite: 'lax',
    httpOnly: true,
    path: '/',
  };
}

/** Remove the session cookie from the reply by setting it to an expired value. */
export function clearSessionCookie(reply: FastifyReply, name: string): void {
  void reply.setCookie(name, '', {
    maxAge: 0,
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
  });
}