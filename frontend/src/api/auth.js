import { apiRequest } from './client.js';

export function login(email, password) {
  return apiRequest('/auth/login', { method: 'POST', body: { email, password } });
}

export function mfaVerifyLogin(mfaToken, code) {
  return apiRequest('/auth/mfa/verify-login', { method: 'POST', body: { mfa_token: mfaToken, code } });
}

export function register(name, email, password) {
  return apiRequest('/auth/register', { method: 'POST', body: { name, email, password } });
}

export function fetchCurrentUser() {
  return apiRequest('/auth/me');
}

export function logout() {
  return apiRequest('/auth/logout', { method: 'POST' });
}

export function forgotPassword(email) {
  return apiRequest('/auth/forgot-password', { method: 'POST', body: { email } });
}

export function resetPassword(token, password) {
  return apiRequest('/auth/reset-password', { method: 'POST', body: { token, password } });
}
