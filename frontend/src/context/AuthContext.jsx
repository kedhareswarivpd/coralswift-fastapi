import { createContext, useContext, useEffect, useCallback, useMemo, useState } from 'react';
import {
 login as loginApi,
 register as registerApi,
 logout as logoutApi,
 fetchCurrentUser,
 mfaVerifyLogin as mfaVerifyLoginApi,
} from '../api/auth.js';

const AuthContext = createContext(null);

// CoralSwift self-auth: the backend owns identity/session/credentials via
// httpOnly `cs_access_token`/`cs_refresh_token` cookies (see
// backend/app/core/cookies.py) — this app never sees, stores, or reads
// either token. Session state is reconstructed purely from GET /auth/me on
// boot; there is no Supabase Auth, no localStorage/sessionStorage token, and
// no Authorization: Bearer header anywhere in this codebase.
//
// There used to be an `accessToken` compatibility shim here (a non-secret
// sentinel string) so legacy components could gate on `if (!accessToken)`
// and thread a value into api/*.js functions that accepted a `token`
// argument. Both call sites have since been removed — components gate on
// `status`/`user` directly, and api/*.js functions no longer accept a
// token argument at all — so the shim is gone.

export function AuthProvider({ children }) {
 const [user, setUser] = useState(null);
 const [status, setStatus] = useState('loading'); // 'loading' | 'authenticated' | 'anonymous' | 'error'

 const hydrate = useCallback(async () => {
  try {
   const res = await fetchCurrentUser();
   setUser(res?.data ?? null);
   setStatus(res?.data ? 'authenticated' : 'anonymous');
  } catch (err) {
   if (err?.status === 401) {
    setUser(null);
    setStatus('anonymous');
   } else {
    // Network/server error distinct from "not logged in" — don't claim
    // anonymous, since that would be indistinguishable from a real logout.
    setUser(null);
    setStatus('error');
   }
  }
 }, []);

 useEffect(() => {
  hydrate();
 }, [hydrate]);

 // A request that survived one silent refresh attempt and still came back
 // 401 (api/client.js) means the session is truly gone — clear local state
 // so the UI reflects it without waiting for the next /auth/me poll.
 useEffect(() => {
  const onUnauthorized = () => {
   setUser(null);
   setStatus('anonymous');
  };
  window.addEventListener('coralswift:unauthorized', onUnauthorized);
  return () => window.removeEventListener('coralswift:unauthorized', onUnauthorized);
 }, []);

 const register = useCallback(async (name, email, password) => {
  const res = await registerApi(name, email, password);
  return res?.data ?? null;
 }, []);

 const login = useCallback(async (email, password) => {
  const res = await loginApi(email, password);
  const data = res?.data;
  if (data?.mfa_token) {
   // Password was correct but the account has MFA enabled — no session
   // cookies are set yet. The caller (LoginPage) navigates to /verify-mfa
   // with this token so the flow can be completed via verifyMfa() below.
   return { mfaRequired: true, mfaToken: data.mfa_token };
  }
  if (!data?.user) {
   throw new Error('Login failed. Please try again.');
  }
  setUser(data.user);
  setStatus('authenticated');
  return data.user;
 }, []);

 const verifyMfa = useCallback(async (mfaToken, code) => {
  const res = await mfaVerifyLoginApi(mfaToken, code);
  const data = res?.data;
  if (!data?.user) {
   throw new Error('Verification failed. Please try again.');
  }
  setUser(data.user);
  setStatus('authenticated');
  return data.user;
 }, []);

 const logout = useCallback(async () => {
  try {
   await logoutApi();
  } finally {
   setUser(null);
   setStatus('anonymous');
  }
 }, []);

 const value = useMemo(
  () => ({
   user,
   status,
   isAuthenticated: status === 'authenticated',
   isLoading: status === 'loading',
   initializing: status === 'loading',
   role: user?.role ?? null,
   login,
   logout,
   register,
   verifyMfa,
   refresh: hydrate,
  }),
  [user, status, login, logout, register, verifyMfa, hydrate]
 );

 return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
 const ctx = useContext(AuthContext);
 if (!ctx) {
  return {
   user: null,
   status: 'anonymous',
   isAuthenticated: false,
   isLoading: false,
   initializing: false,
   role: null,
   login: async () => null,
   logout: async () => {},
   register: async () => null,
   verifyMfa: async () => null,
   refresh: async () => {},
  };
 }
 return ctx;
}
