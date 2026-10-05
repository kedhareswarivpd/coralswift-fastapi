const rawConfiguredUrl = (import.meta.env.VITE_API_URL || '/api/v1').trim().replace(/\/+$/, '');
const API_URL = rawConfiguredUrl && !rawConfiguredUrl.endsWith('/api/v1')
  ? `${rawConfiguredUrl}/api/v1`
  : (rawConfiguredUrl || '/api/v1');

// Cookie-based auth (CoralSwift self-auth): cf_access_token/cf_refresh_token
// are httpOnly and never touched by JS. cf_csrf_token is the one readable
// cookie — its value must be echoed back as X-CSRF-Token on every
// state-changing request (double-submit CSRF check, see backend
// app/core/csrf.py). There is no Authorization/Bearer header in this
// architecture; every request relies on `credentials: 'include'` instead.
const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const AUTH_PATHS_EXEMPT_FROM_REFRESH = new Set(['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout']);

export class ApiRequestError extends Error {
  constructor(message, status, errors = []) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.errors = errors;
  }
}

function readCookie(name) {
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function handleUnauthorizedState() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('coralswift:unauthorized'));
  const path = window.location.pathname || '/';
  if (!path.startsWith('/login')) {
    try {
      window.location.href = '/login';
    } catch {
      // jsdom can reject navigation attempts in unit tests; real browsers
      // still perform the redirect and the auth state is already cleared.
    }
  }
}

async function parseResponseBody(response) {
  if (typeof response?.json === 'function') {
    try {
      return await response.json();
    } catch {
      // Some mocked fetch responses only expose .text() or plain data.
    }
  }

  if (typeof response?.text === 'function') {
    const bodyText = await response.text().catch(() => '');
    if (!bodyText) return null;
    try {
      return JSON.parse(bodyText);
    } catch {
      return bodyText;
    }
  }

  return null;
}

// A 401 from many in-flight requests must trigger exactly one refresh call,
// not one per request (refresh storm) — every caller awaits this same
// in-flight promise instead of starting its own.
let refreshPromise = null;

function refreshSession() {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'X-CSRF-Token': readCookie('cf_csrf_token') || '' },
    }).finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

/**
 * Low-level request helper. Returns the parsed `{ success, data, message, meta }`
 * envelope the FastAPI backend sends back (see app/utils/responses.py).
 * When `body` is a FormData instance it is sent as-is (multipart) — the browser
 * sets the boundary, so no Content-Type is forced.
 */
export async function apiRequest(path, { method = 'GET', body, headers, signal, _isRetry = false } = {}) {
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  const upperMethod = method.toUpperCase();
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      credentials: 'include',
      headers: {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...(MUTATING_METHODS.has(upperMethod) ? { 'X-CSRF-Token': readCookie('cf_csrf_token') || '' } : {}),
        ...headers,
      },
      body: isFormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (networkError) {
    throw new ApiRequestError(
      'Could not reach the CoralSwift API. Is the backend running?',
      0,
      [{ field: null, message: networkError.message }]
    );
  }

  // Single retry after a silent refresh — never for the auth endpoints
  // themselves, which would otherwise refresh-loop.
  if (response.status === 401 && !_isRetry && !AUTH_PATHS_EXEMPT_FROM_REFRESH.has(path)) {
    try {
      const refreshResponse = await refreshSession();
      if (refreshResponse.ok) {
        return apiRequest(path, { method, body, headers, signal, _isRetry: true });
      }
    } catch {
      // Refresh itself unreachable — fall through to normal 401 handling below.
    }
  }

  const contentType = response.headers?.get?.('content-type') || '';
  const explicitlyJson = contentType.includes('application/json') || contentType.includes('+json');

  if (!response.ok) {
    let errorBody = null;
    if (explicitlyJson || typeof response.json === 'function') {
      errorBody = await parseResponseBody(response);
    } else {
      const fallbackText = typeof response.text === 'function' ? await response.text().catch(() => '') : '';
      errorBody = fallbackText || null;
    }

    if (response.status === 401 && path !== '/auth/me') {
      handleUnauthorizedState();
    }

    const message =
      errorBody && typeof errorBody === 'object' && errorBody.message
        ? errorBody.message
        : typeof errorBody === 'string' && errorBody.trim()
          ? errorBody
          : response.statusText || `Request failed with status ${response.status}`;

    throw new ApiRequestError(
      message,
      response.status,
      errorBody && typeof errorBody === 'object' ? (errorBody.errors || []) : []
    );
  }

  if (!explicitlyJson && typeof response.json === 'function') {
    try {
      return await response.json();
    } catch {
      // Fall through to HTML/non-JSON detection below for real responses that
      // do not actually return JSON despite exposing .json().
    }
  }

  if (!explicitlyJson) {
    const bodyText = typeof response.text === 'function' ? await response.text().catch(() => '') : '';
    throw new ApiRequestError(
      `Expected JSON from ${API_URL}${path} but got ${contentType || 'non-JSON'} (HTTP ${response.status}). ` +
        (bodyText.trim().startsWith('<!doctype') || bodyText.trim().startsWith('<html')
          ? 'The SPA fallback (index.html) was returned instead of the API — check that VITE_API_URL is unset/"/api/v1" on the host and that the /api/v1 proxy rewrite is active.'
          : `Body preview: ${bodyText.slice(0, 200)}`),
      response.status,
      []
    );
  }

  const parsedBody = await parseResponseBody(response);
  return parsedBody;
}

/** Builds a query string from an object, skipping null/undefined/empty values. */
export function toQueryString(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') search.set(key, value);
  });
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

export { API_URL };
