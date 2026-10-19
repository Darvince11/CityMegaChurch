import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { eq, and, isNull, gt } from 'drizzle-orm';
import { UnauthenticatedError, type AuthUser } from '@cdp/shared';
import type { Database } from '@cdp/database';
import { churchPositions, profiles, roles, sessions, userRoles, rolePermissions, permissions, users } from '@cdp/database';
import { DATABASE } from '../../database/database.module';
import type { Env } from '../../config/env';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { sha256 } from '../crypto.util';
import type { RequestWithUser } from '../interfaces/request-with-user';

/**
 * Validates the session cookie against `sessions` (source of truth) and
 * attaches the enriched `AuthUser` to the request. Skip with @Public().
 */
@Injectable()
export class AuthGuard implements CanActivate {
  private readonly reflector = new Reflector();

  constructor(
    @Inject(DATABASE) private readonly db: Database,
    @Inject('ENV') private readonly env: Env,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean | undefined>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const token = request.cookies?.[this.env.COOKIE_NAME];
    if (!token) {
      throw new UnauthenticatedError('You must be signed in.');
    }

    const tokenHash = sha256(token);
    const now = new Date();
    const [session] = await this.db
      .select()
      .from(sessions)
      .where(
        and(
          eq(sessions.tokenHash, tokenHash),
          isNull(sessions.revokedAt),
          gt(sessions.expiresAt, now),
        ),
      )
      .limit(1);

    if (!session) {
      throw new UnauthenticatedError('Your session has expired. Please sign in again.');
    }

    request.user = await this.buildAuthUser(session.userId);
    return true;
  }

  /** Assemble the lean session payload the client is allowed to see. */
  private async buildAuthUser(userId: string): Promise<AuthUser> {
    const [user] = await this.db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) {
      throw new UnauthenticatedError('Account no longer exists.');
    }
    if (user.status !== 'active') {
      throw new UnauthenticatedError('This account is inactive.');
    }

    const roleRows = await this.db
      .select({ slug: roles.slug })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(userRoles.userId, userId));

    const permissionRows = await this.db
      .selectDistinct({ key: permissions.key })
      .from(userRoles)
      .innerJoin(rolePermissions, eq(userRoles.roleId, rolePermissions.roleId))
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(eq(userRoles.userId, userId));

    const [profile] = await this.db
      .select({ position: churchPositions.name })
      .from(profiles)
      .leftJoin(churchPositions, eq(profiles.churchPositionId, churchPositions.id))
      .where(eq(profiles.userId, userId))
      .limit(1);

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone ?? null,
      status: user.status === 'active' ? 'active' : 'inactive',
      twoFactorEnabled: user.twoFactorEnabled,
      roles: roleRows.map((row: { slug: string }) => row.slug),
      permissions: permissionRows.map((row: { key: string }) => row.key),
      churchPosition: profile?.position ?? null,
    };
  }
}