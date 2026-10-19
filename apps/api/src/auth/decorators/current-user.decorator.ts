import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import type { AuthUser } from '@cdp/shared';
import type { RequestWithUser } from '../interfaces/request-with-user';

/**
 * Injects the authenticated `AuthUser` into a handler parameter.
 * Route must be protected by AuthGuard (i.e. not @Public()).
 */
export const CurrentUser = createParamDecorator(
  (data: keyof AuthUser | undefined, context: ExecutionContext): AuthUser | AuthUser[keyof AuthUser] => {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    if (!request.user) {
      throw new UnauthorizedException('You must be signed in.');
    }
    return data ? request.user[data] : request.user;
  },
);