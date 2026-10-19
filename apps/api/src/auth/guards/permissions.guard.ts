import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ForbiddenError, UnauthenticatedError } from '@cdp/shared';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import type { RequestWithUser } from '../interfaces/request-with-user';

/**
 * Enforces `@Permissions(...)` on a handler. Runs after AuthGuard so the
 * request always carries a fresh `AuthUser`. A handler with no permissions
 * only requires authentication.
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  private readonly reflector = new Reflector();

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[] | undefined>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!required || required.length === 0) return true;

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;
    if (!user) {
      throw new UnauthenticatedError('You must be signed in.');
    }

    const granted = new Set<string>(user.permissions);
    const missing = required.filter((permission) => !granted.has(permission));
    if (missing.length > 0) {
      throw new ForbiddenError('You do not have permission to do that.');
    }
    return true;
  }
}