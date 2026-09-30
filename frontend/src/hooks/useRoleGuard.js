import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const ROLE_SETS = {
  admin: ['admin', 'super_admin'],
  super_admin: ['super_admin'],
  employee: ['employee', 'developer', 'sales', 'marketing', 'project_manager', 'qa', 'support', 'finance', 'hr', 'admin', 'super_admin'],
  client: ['client'],
  partner: ['partner'],
};

/**
 * Client-side route guard for portal routes. The backend remains the source
 * of truth (every protected endpoint re-checks the role via `require_roles`
 * against the session cookie — never a frontend-supplied value); this hook
 * only improves UX by redirecting unauthenticated or clearly-wrong-role
 * visitors immediately instead of rendering an empty portal shell. Missing
 * or null roles are denied — the backend must confirm the role before the
 * portal renders.
 */
export function useRoleGuard(portalKey, redirectTo = '/login') {
  const { user, role, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const allowed = ROLE_SETS[portalKey] || [];
  const unauthenticated = Boolean(!isLoading && !user);
  const wrongRole = Boolean(!isLoading && user && !allowed.includes(role));
  const denied = unauthenticated || wrongRole;

  useEffect(() => {
    if (unauthenticated) {
      const returnTo = `${location.pathname}${location.search}`;
      navigate(`/login?returnTo=${encodeURIComponent(returnTo)}`, { replace: true });
    } else if (wrongRole) {
      navigate(redirectTo, { replace: true });
    }
    // NOTE: `location` is deliberately excluded from the dependency array.
    // Including it would cause navigate() → location change → effect re-run →
    // navigate() → infinite loop, crashing the vitest worker (and degrading
    // real-user performance).  The returnTo path is captured from `location`
    // at the moment the redirect fires, which is the desired behavior.
  }, [unauthenticated, wrongRole, navigate, redirectTo]);

  return { role, denied, isAllowed: !denied };
}
