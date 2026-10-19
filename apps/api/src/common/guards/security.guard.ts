import { CanActivate, ExecutionContext, ForbiddenException, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { AuthUser } from '@cdp/shared';
import type { Env } from '../../config/env';

type Bucket = { count: number; resetAt: number };
type SecuredRequest = FastifyRequest & { user?: AuthUser; body?: { email?: unknown } };

@Injectable()
export class SecurityGuard implements CanActivate {
  private readonly buckets = new Map<string, Bucket>();
  private requests = 0;
  constructor(@Inject('ENV') private readonly env: Env) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<SecuredRequest>();
    const reply = context.switchToHttp().getResponse<FastifyReply>();
    this.verifyOrigin(request);
    const authRoute = request.url.includes('/auth/login') || request.url.includes('/auth/register');
    const limit = authRoute ? this.env.RATE_LIMIT_AUTH_LIMIT : this.env.RATE_LIMIT_GLOBAL_LIMIT;
    const windowMs = authRoute ? this.env.RATE_LIMIT_AUTH_WINDOW_MS : this.env.RATE_LIMIT_GLOBAL_WINDOW_MS;
    const identity = request.user?.id ?? (typeof request.body?.email === 'string' ? request.body.email.trim().toLowerCase().slice(0, 254) : null);
    const keys = [`ip:${request.ip}`];
    if (identity) keys.push(`identity:${identity}`);
    for (const key of keys) this.consume(`${authRoute ? 'auth' : 'global'}:${key}`, limit, windowMs, reply);
    if (++this.requests % 500 === 0) this.sweep();
    return true;
  }

  private consume(key: string, limit: number, windowMs: number, reply: FastifyReply): void {
    const now = Date.now();
    const current = this.buckets.get(key);
    const bucket = !current || current.resetAt <= now ? { count: 0, resetAt: now + windowMs } : current;
    bucket.count += 1; this.buckets.set(key, bucket);
    const remaining = Math.max(0, limit - bucket.count);
    reply.header('X-RateLimit-Limit', String(limit)); reply.header('X-RateLimit-Remaining', String(remaining)); reply.header('X-RateLimit-Reset', String(Math.ceil(bucket.resetAt / 1000)));
    if (bucket.count > limit) {
      const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
      reply.header('Retry-After', String(retryAfter));
      throw new HttpException('Too many requests. Please try again later.', HttpStatus.TOO_MANY_REQUESTS);
    }
  }

  private verifyOrigin(request: SecuredRequest): void {
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) return;
    const origin = request.headers.origin;
    if (origin && !this.env.CORS_ORIGINS.includes(origin)) throw new ForbiddenException('Request origin is not allowed.');
  }

  private sweep(): void { const now = Date.now(); for (const [key, bucket] of this.buckets) if (bucket.resetAt <= now) this.buckets.delete(key); }
}
