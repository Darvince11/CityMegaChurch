import { SetMetadata, type CustomDecorator } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'IS_PUBLIC';

/** Marks a route as reachable without a session (docs/API.md §auth). */
export const Public = (): CustomDecorator<string> => SetMetadata(IS_PUBLIC_KEY, true);