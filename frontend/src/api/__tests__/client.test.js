import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiRequest, toQueryString, ApiRequestError, API_URL } from '../client.js';

describe('ApiRequestError', () => {
  it('creates error with message, status, and errors', () => {
    const error = new ApiRequestError('Not found', 404, [{ field: 'id', message: 'Invalid' }]);
    expect(error.message).toBe('Not found');
    expect(error.status).toBe(404);
    expect(error.errors).toEqual([{ field: 'id', message: 'Invalid' }]);
    expect(error.name).toBe('ApiRequestError');
  });

  it('creates error with default empty errors', () => {
    const error = new ApiRequestError('Error', 500);
    expect(error.errors).toEqual([]);
  });
});

describe('apiRequest', () => {
  let mockFetch;
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    mockFetch = vi.fn();
    Object.defineProperty(globalThis, 'fetch', {
      value: mockFetch,
      writable: true,
      configurable: true,
    });
    // Clear any cs_csrf_token cookie left over from a previous test.
    document.cookie = 'cs_csrf_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  });

  afterEach(() => {
    Object.defineProperty(globalThis, 'fetch', {
      value: originalFetch,
      writable: true,
      configurable: true,
    });
    document.cookie = 'cs_csrf_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  });

  it('returns payload on successful request', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: { id: 1 } }),
    });

    const result = await apiRequest('/test');
    expect(result).toEqual({ success: true, data: { id: 1 } });
  });

  it('sends GET request by default', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    await apiRequest('/test');
    expect(mockFetch).toHaveBeenCalledWith(
      `${API_URL}/test`,
      expect.objectContaining({ method: 'GET' })
    );
  });

  it('sends POST request when specified', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    await apiRequest('/test', { method: 'POST', body: { name: 'test' } });
    expect(mockFetch).toHaveBeenCalledWith(
      `${API_URL}/test`,
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('never sends an Authorization header — auth is cookie-based, a passed `token` is ignored', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    await apiRequest('/test', { token: 'legacy-prop-should-be-ignored' });
    const callArgs = mockFetch.mock.calls[0][1];
    expect(callArgs.headers.Authorization).toBeUndefined();
  });

  it('always sends credentials: "include" so the httpOnly session cookies are attached', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    await apiRequest('/test');
    expect(mockFetch).toHaveBeenCalledWith(
      `${API_URL}/test`,
      expect.objectContaining({ credentials: 'include' })
    );
  });

  it('attaches X-CSRF-Token (read from the cs_csrf_token cookie) on mutating requests', async () => {
    document.cookie = 'cs_csrf_token=my-csrf-value; path=/;';
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });

    await apiRequest('/test', { method: 'POST', body: { a: 1 } });
    expect(mockFetch).toHaveBeenCalledWith(
      `${API_URL}/test`,
      expect.objectContaining({
        headers: expect.objectContaining({ 'X-CSRF-Token': 'my-csrf-value' }),
      })
    );
  });

  it('does not attach X-CSRF-Token on a plain GET', async () => {
    document.cookie = 'cs_csrf_token=my-csrf-value; path=/;';
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });

    await apiRequest('/test');
    const callArgs = mockFetch.mock.calls[0][1];
    expect(callArgs.headers['X-CSRF-Token']).toBeUndefined();
  });

  it('on a 401, calls POST /auth/refresh once and retries the original request', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({ message: 'expired' }) })
      .mockResolvedValueOnce({ ok: true, status: 200 }) // POST /auth/refresh
      .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true, data: { id: 1 } }) }); // retried request

    const result = await apiRequest('/protected');

    expect(mockFetch).toHaveBeenCalledTimes(3);
    expect(mockFetch.mock.calls[1][0]).toBe(`${API_URL}/auth/refresh`);
    expect(result).toEqual({ success: true, data: { id: 1 } });
  });

  it('shares a single in-flight refresh across concurrent 401s (no refresh storm)', async () => {
    let refreshCalls = 0;
    const seenPaths = new Set();
    mockFetch.mockImplementation((url) => {
      if (url === `${API_URL}/auth/refresh`) {
        refreshCalls += 1;
        return new Promise((resolve) => setTimeout(() => resolve({ ok: true, status: 200 }), 5));
      }
      // First fetch for a given path is a 401; the post-refresh retry of that
      // same path succeeds.
      if (!seenPaths.has(url)) {
        seenPaths.add(url);
        return Promise.resolve({ ok: false, status: 401, json: async () => ({}) });
      }
      return Promise.resolve({ ok: true, json: async () => ({ success: true }) });
    });

    await Promise.all([apiRequest('/a'), apiRequest('/b'), apiRequest('/c')]);
    expect(refreshCalls).toBe(1);
  });

  it('dispatches coralswift:unauthorized when refresh itself fails to recover the session', async () => {
    const handler = vi.fn();
    window.addEventListener('coralswift:unauthorized', handler);
    mockFetch
      .mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({ message: 'expired' }) })
      .mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({}) }); // refresh also 401s

    await apiRequest('/protected').catch(() => {});
    expect(handler).toHaveBeenCalledTimes(1);
    window.removeEventListener('coralswift:unauthorized', handler);
  });

  it('does not attempt a refresh loop for /auth/login itself', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({ message: 'bad credentials' }) });

    const error = await apiRequest('/auth/login', { method: 'POST', body: {} }).catch((e) => e);
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(error).toBeInstanceOf(ApiRequestError);
  });

  it('throws ApiRequestError on non-ok response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: async () => ({ message: 'Resource not found' }),
    });

    const error = await apiRequest('/missing').catch((e) => e);
    expect(error).toBeInstanceOf(ApiRequestError);
    expect(error.status).toBe(404);
    expect(error.message).toBe('Resource not found');
  });

  it('throws ApiRequestError with statusText when no JSON body', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: async () => { throw new Error('No JSON'); },
    });

    await expect(apiRequest('/error')).rejects.toThrow(ApiRequestError);
  });

  it('throws ApiRequestError on network failure', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const error = await apiRequest('/test').catch((e) => e);
    expect(error).toBeInstanceOf(ApiRequestError);
    expect(error.status).toBe(0);
  });

  it('handles empty response body', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => null,
    });

    const result = await apiRequest('/test');
    expect(result).toBeNull();
  });

  it('stringifies body when provided', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    await apiRequest('/test', { method: 'POST', body: { key: 'value' } });
    const callArgs = mockFetch.mock.calls[0][1];
    expect(callArgs.body).toBe(JSON.stringify({ key: 'value' }));
  });

  it('does not stringify body when undefined', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    await apiRequest('/test');
    const callArgs = mockFetch.mock.calls[0][1];
    expect(callArgs.body).toBeUndefined();
  });

  it('sends FormData as-is without forcing Content-Type', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    const formData = new FormData();
    formData.append('full_name', 'Jane Doe');
    await apiRequest('/careers/123/apply', { method: 'POST', body: formData });
    const callArgs = mockFetch.mock.calls[0][1];
    expect(callArgs.body).toBe(formData);
    expect(callArgs.headers['Content-Type']).toBeUndefined();
  });
});

describe('toQueryString', () => {
  it('returns empty string for empty params', () => {
    expect(toQueryString({})).toBe('');
  });

  it('builds query string from params', () => {
    const result = toQueryString({ page: 1, limit: 20 });
    expect(result).toBe('?page=1&limit=20');
  });

  it('skips null values', () => {
    const result = toQueryString({ page: 1, search: null });
    expect(result).toBe('?page=1');
  });

  it('skips undefined values', () => {
    const result = toQueryString({ page: 1, search: undefined });
    expect(result).toBe('?page=1');
  });

  it('skips empty string values', () => {
    const result = toQueryString({ page: 1, search: '' });
    expect(result).toBe('?page=1');
  });

  it('handles mixed valid and invalid values', () => {
    const result = toQueryString({ page: 1, search: null, sort: '-created_at' });
    expect(result).toContain('page=1');
    expect(result).toContain('sort=-created_at');
    expect(result).not.toContain('search');
  });
});
