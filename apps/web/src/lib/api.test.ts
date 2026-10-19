import { afterEach, describe, expect, it, vi } from 'vitest';
import { api, ApiClientError } from './api';

afterEach(() => vi.unstubAllGlobals());

describe('API client', () => {
  it('does not mark the empty logout request as JSON', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ loggedOut: true }), { status: 201 }));
    vi.stubGlobal('fetch', fetch);
    await api.logout();
    const options = fetch.mock.calls[0]?.[1];
    expect(options.method).toBe('POST');
    expect(options.body).toBeUndefined();
    expect(options.headers).not.toHaveProperty('content-type');
  });
  it('preserves actionable backend validation errors', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      error: { code: 'UNAUTHENTICATED', message: 'Invalid email or password.' },
    }), { status: 401 })));
    await expect(api.login({ email: 'member@church.test', password: 'wrong' })).rejects.toMatchObject({
      status: 401, code: 'UNAUTHENTICATED', message: 'Invalid email or password.',
    });
  });
  it('handles a non-JSON upstream error and includes session credentials', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response('Unavailable', { status: 503 }));
    vi.stubGlobal('fetch', fetch);
    await expect(api.me()).rejects.toBeInstanceOf(ApiClientError);
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/v1/auth/me'), expect.objectContaining({ credentials: 'include' }));
  });
});
