/**
 * Domain errors thrown by services and mapped to HTTP by the API's
 * centralized exception filter. Status defaults to 400; domain code
 * determines the machine-readable `error.code` in responses.
 */
export class DomainError extends Error {
  constructor(
    message: string,
    public readonly code: string = 'DOMAIN_ERROR',
    public readonly status: number = 400,
  ) {
    super(message);
    this.name = 'DomainError';
  }
}

/** Failed request validation (Zod). */
export class ValidationError extends DomainError {
  constructor(
    message: string,
    public readonly details: { field: string; message: string }[] = [],
  ) {
    super(message, 'VALIDATION_FAILED', 400);
    this.name = 'ValidationError';
  }
}

/** Resource exists or a uniqueness constraint would be violated. */
export class ConflictError extends DomainError {
  constructor(message: string) {
    super(message, 'CONFLICT', 409);
    this.name = 'ConflictError';
  }
}

/** Authenticated identity missing/expired. */
export class UnauthenticatedError extends DomainError {
  constructor(message = 'You must be signed in.') {
    super(message, 'UNAUTHENTICATED', 401);
    this.name = 'UnauthenticatedError';
  }
}

/** Authenticated but lacking permission. */
export class ForbiddenError extends DomainError {
  constructor(message = 'You do not have permission to do that.') {
    super(message, 'FORBIDDEN', 403);
    this.name = 'ForbiddenError';
  }
}

/** Resource not found. Never leaks existence of sensitive resources. */
export class NotFoundError extends DomainError {
  constructor(message = 'Resource not found.') {
    super(message, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}