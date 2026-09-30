import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../api/auth.js', () => ({
 login: vi.fn(),
 register: vi.fn(),
 logout: vi.fn(),
 fetchCurrentUser: vi.fn(),
}));

import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext.jsx';
import {
 login as loginApi,
 register as registerApi,
 logout as logoutApi,
 fetchCurrentUser,
} from '../../api/auth.js';
import { ApiRequestError } from '../../api/client.js';

describe('useAuth', () => {
 it('returns default values when used outside provider', () => {
  const { result } = renderHook(() => useAuth());
  expect(result.current.user).toBeNull();
  expect(result.current.isAuthenticated).toBe(false);
 });
});

describe('AuthProvider', () => {
 beforeEach(() => {
  vi.clearAllMocks();
 });

 it('hydrates as anonymous when GET /auth/me returns 401 (no session cookie)', async () => {
  fetchCurrentUser.mockRejectedValue(new ApiRequestError('Authentication token missing', 401));

  const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
  const { result } = renderHook(() => useAuth(), { wrapper });

  await act(async () => {
   await new Promise((r) => setTimeout(r, 0));
  });

  expect(result.current.user).toBeNull();
  expect(result.current.isAuthenticated).toBe(false);
 });

 it('hydrates the user from GET /auth/me when a session cookie is already present', async () => {
  const mockUser = { id: 'user-123', email: 'test@example.com', role: 'client' };
  fetchCurrentUser.mockResolvedValue({ data: mockUser });

  const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
  const { result } = renderHook(() => useAuth(), { wrapper });

  await act(async () => {
   await new Promise((r) => setTimeout(r, 0));
  });

  expect(result.current.user).toEqual(mockUser);
  expect(result.current.isAuthenticated).toBe(true);
  expect(result.current.role).toBe('client');
 });

 it('login calls the API (no tokens ever touch JS — cookies are set by the server response)', async () => {
  fetchCurrentUser.mockRejectedValue(new ApiRequestError('Authentication token missing', 401));
  loginApi.mockResolvedValue({ data: { user: { id: '1', role: 'client' } } });

  const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
  const { result } = renderHook(() => useAuth(), { wrapper });

  await act(async () => {
   await new Promise((r) => setTimeout(r, 0));
  });

  let returnedUser;
  await act(async () => {
   returnedUser = await result.current.login('test@example.com', 'password');
  });

  expect(loginApi).toHaveBeenCalledWith('test@example.com', 'password');
  expect(returnedUser).toEqual({ id: '1', role: 'client' });
  expect(result.current.isAuthenticated).toBe(true);
 });

 it('login throws when the response has no user', async () => {
  fetchCurrentUser.mockRejectedValue(new ApiRequestError('Authentication token missing', 401));
  loginApi.mockResolvedValue({ data: {} });

  const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
  const { result } = renderHook(() => useAuth(), { wrapper });

  await act(async () => {
   await new Promise((r) => setTimeout(r, 0));
  });

  await expect(result.current.login('test@example.com', 'password')).rejects.toThrow('Login failed');
 });

 it('login resolves an MFA challenge for MFA-enabled accounts without creating a session', async () => {
  fetchCurrentUser.mockRejectedValue(new ApiRequestError('Authentication token missing', 401));
  loginApi.mockResolvedValue({ data: { mfa_token: 'challenge-token' } });

  const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
  const { result } = renderHook(() => useAuth(), { wrapper });

  await act(async () => {
   await new Promise((r) => setTimeout(r, 0));
  });

  let outcome;
  await act(async () => {
   outcome = await result.current.login('mfa@example.com', 'password');
  });

  // The password step alone must not authenticate the user — the caller
  // completes the flow via verifyMfa() on /verify-mfa.
  expect(outcome).toEqual({ mfaRequired: true, mfaToken: 'challenge-token' });
  expect(result.current.isAuthenticated).toBe(false);
 });

 it('register calls the API and returns the created user', async () => {
  fetchCurrentUser.mockRejectedValue(new ApiRequestError('Authentication token missing', 401));
  registerApi.mockResolvedValue({ data: { id: '1', role: 'client' } });

  const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
  const { result } = renderHook(() => useAuth(), { wrapper });

  await act(async () => {
   await new Promise((r) => setTimeout(r, 0));
  });

  let returned;
  await act(async () => {
   returned = await result.current.register('Test User', 'test@example.com', 'password');
  });

  expect(registerApi).toHaveBeenCalledWith('Test User', 'test@example.com', 'password');
  expect(returned).toEqual({ id: '1', role: 'client' });
 });

 it('logout calls the API and clears local user state even if the API call fails', async () => {
  const mockUser = { id: '1', email: 'test@example.com', role: 'client' };
  fetchCurrentUser.mockResolvedValue({ data: mockUser });
  logoutApi.mockRejectedValue(new Error('network error'));

  const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
  const { result } = renderHook(() => useAuth(), { wrapper });

  await act(async () => {
   await new Promise((r) => setTimeout(r, 0));
  });
  expect(result.current.isAuthenticated).toBe(true);

  await act(async () => {
   await result.current.logout().catch(() => {});
  });

  expect(logoutApi).toHaveBeenCalled();
  expect(result.current.isAuthenticated).toBe(false);
  expect(result.current.user).toBeNull();
 });

 it('clears local user state on a coralswift:unauthorized event (refresh-and-retry exhausted)', async () => {
  const mockUser = { id: '1', email: 'test@example.com', role: 'client' };
  fetchCurrentUser.mockResolvedValue({ data: mockUser });

  const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
  const { result } = renderHook(() => useAuth(), { wrapper });

  await act(async () => {
   await new Promise((r) => setTimeout(r, 0));
  });
  expect(result.current.isAuthenticated).toBe(true);

  await act(async () => {
   window.dispatchEvent(new CustomEvent('coralswift:unauthorized'));
  });

  expect(result.current.isAuthenticated).toBe(false);
  expect(result.current.user).toBeNull();
 });
});
