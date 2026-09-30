import { apiRequest } from './client.js';

// Partner Portal self-service (backend/app/routers/partner_account.py) —
// deliberately distinct from api/cms.js's `partnersApi`, which manages the
// unrelated public "our partners" logo listing (backend Partner/`/partners`
// CMS model). Naming them differently (partnerAccounts.js vs. cms.js's
// partnersApi) is intentional so the two are never confused at an import site.

export const fetchMyProfile = () => apiRequest('/partner-accounts/me/profile', {});
export const updateMyProfile = (body) => apiRequest('/partner-accounts/me/profile', { method: 'PUT', body });
export const fetchMyFiles = () => apiRequest('/partner-accounts/me/files', {});
export const fetchMyTickets = () => apiRequest('/partner-accounts/me/tickets', {});
export const createTicket = (body) => apiRequest('/partner-accounts/me/tickets', { method: 'POST', body });
