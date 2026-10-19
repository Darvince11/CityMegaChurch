import { SetMetadata, type CustomDecorator } from '@nestjs/common';

export const PERMISSIONS_KEY = 'PERMISSIONS';

/**
 * Declares the permission keys a handler requires. Wildcard role grants
 * (`*`) resolve on the server side; the client never sends permissions.
 * Example: `@Permissions('events.create', 'events.update')`
 */
export const Permissions = (...permissions: string[]): CustomDecorator<string> =>
  SetMetadata(PERMISSIONS_KEY, permissions);