import { describe, expect, it, vi } from 'vitest';
import type { ArgumentsHost } from '@nestjs/common';
import { RegisterRequestSchema, UnauthenticatedError } from '@cdp/shared';
import { AllExceptionsFilter } from './all-exceptions.filter';

describe('API error contract', () => {
  function capture(error: unknown) {
    const send = vi.fn();
    const status = vi.fn(() => ({ send }));
    const host = { switchToHttp: () => ({ getResponse: () => ({ status }) }) } as unknown as ArgumentsHost;
    new AllExceptionsFilter().catch(error, host);
    return { status, send };
  }

  it('returns 401 with the envelope consumed by the frontend', () => {
    const { status, send } = capture(new UnauthenticatedError('Invalid email or password.'));
    expect(status).toHaveBeenCalledWith(401);
    expect(send).toHaveBeenCalledWith({ error: { code: 'UNAUTHENTICATED', message: 'Invalid email or password.' } });
  });

  it('returns field errors for invalid registration input', () => {
    const result = RegisterRequestSchema.safeParse({ email: 'invalid', password: 'short', fullName: '' });
    if (result.success) throw new Error('Expected invalid input');
    const { status, send } = capture(result.error);
    expect(status).toHaveBeenCalledWith(400);
    expect(send.mock.calls[0]?.[0].error.details).toEqual(expect.arrayContaining([
      expect.objectContaining({ field: 'email' }),
      expect.objectContaining({ field: 'password' }),
    ]));
  });
});
