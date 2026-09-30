import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Icon from '../components/ui/Icon.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { loginSchema, parseWithSchema } from '../schemas/auth.schema.js';

// Only ever navigate to a same-app relative path from `returnTo` — a bare
// `/foo`, never `//host/foo` (protocol-relative) or `https://...`/`javascript:...`,
// which would otherwise let a crafted `?returnTo=` query param send a logged-in
// user off-site (open redirect).
export function sanitizeReturnTo(raw) {
 if (typeof raw !== 'string' || !raw.startsWith('/') || raw.startsWith('//')) return null;
 return raw;
}

export const ROLE_PORTAL_MAP = {
 client: '/client',
 employee: '/employee',
 developer: '/developer',
 sales: '/sales',
 marketing: '/marketing',
 project_manager: '/project-manager',
 qa: '/qa',
 support: '/support',
 finance: '/finance',
 hr: '/hr',
 admin: '/admin',
 super_admin: '/super-admin',
 partner: '/partner',
};

export default function LoginPage() {
 useDocumentTitle('Sign In | CoralSwift Technologies');
 const { login } = useAuth();
 const navigate = useNavigate();
 const [searchParams] = useSearchParams();
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [error, setError] = useState('');
 const [submitting, setSubmitting] = useState(false);
 const [showPassword, setShowPassword] = useState(false);

 const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');

  const { success, errors } = parseWithSchema(loginSchema, { email, password });
  if (!success) {
   setError(Object.values(errors)[0]);
   return;
  }

  setSubmitting(true);
  try {
   const result = await login(email, password);

   if (result?.mfaRequired) {
    const returnTo = sanitizeReturnTo(searchParams.get('returnTo'));
    navigate('/verify-mfa', { state: { mfaToken: result.mfaToken, returnTo } });
    return;
   }

   const role = result?.role;
   const target = ROLE_PORTAL_MAP[role];
   if (!target) {
    throw new Error('Your account does not have access to any portal.');
   }

   const returnTo = sanitizeReturnTo(searchParams.get('returnTo'));
   navigate(returnTo || target, { replace: true });
  } catch (err) {
   setError(err.message || 'Invalid email or password.');
  } finally {
   setSubmitting(false);
  }
 };

 const inputClass = 'w-full rounded border border-outline-variant dark:border-dark-outline-variant px-4 py-2.5 text-body-md dark:text-dark-ink bg-white dark:bg-dark-surface focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand';

 return (
  <div className="flex min-h-[calc(100dvh-11rem)] items-center justify-center bg-surface-container px-4 py-section-padding dark:bg-dark-surface-container sm:px-6 lg:px-10 xl:px-12">
   <div className="w-full max-w-sm rounded-lg bg-white p-stack-lg shadow-card-hover dark:bg-dark-surface">
    <div className="mb-6 flex items-center gap-3">
     <img src="/logo-icon.png" alt="CoralSwift Emblem" className="h-10 w-auto object-contain shrink-0" />
     <div>
      <h1 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand">Sign In</h1>
      <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">Access your CoralSwift portal</p>
     </div>
    </div>

    <form onSubmit={handleSubmit} className="flex flex-col gap-stack-md">
     <label className="flex flex-col gap-1.5">
      <span className="font-label-caps text-label-caps uppercase text-ink-muted dark:text-dark-ink-muted">Email</span>
      <input
       required
       type="email"
       value={email}
       onChange={(e) => setEmail(e.target.value)}
       placeholder="you@coralswifttech.com"
       autoComplete="username"
       className={inputClass}
      />
     </label>

     <label className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
       <span className="font-label-caps text-label-caps uppercase text-ink-muted dark:text-dark-ink-muted">Password</span>
       <Link to="/forgot-password" className="text-body-sm text-brand hover:underline">Forgot password?</Link>
      </div>
      <div className="relative">
       <input
        required
        type={showPassword ? 'text' : 'password'}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
        autoComplete="current-password"
        className={inputClass}
       />
       <button
        type="button"
        onClick={() => setShowPassword((v) => !v)}
        aria-label={showPassword ? 'Hide password' : 'Show password'}
        className="absolute right-1 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center text-ink-muted hover:text-ink dark:text-dark-ink-muted dark:hover:text-dark-ink"
       >
        <Icon name={showPassword ? 'visibility_off' : 'visibility'} />
       </button>
      </div>
     </label>

     {error && (
      <p className="flex items-start gap-1 text-body-sm text-status-error-text">
       <Icon name="error" className="mt-0.5 shrink-0 text-base" />{error}
      </p>
     )}

     <button
      type="submit"
      disabled={submitting}
      className="h-11 rounded bg-brand font-label-caps text-label-caps uppercase text-white transition-all hover:bg-brand-dark active:scale-95 disabled:opacity-60"
     >
      {submitting ? 'Signing in...' : 'Sign In'}
     </button>

     <p className="text-center text-body-sm text-ink-muted dark:text-dark-ink-muted">
      Don&apos;t have an account?{' '}
      <Link to="/register" className="font-semibold text-brand hover:underline">Create account</Link>
     </p>
    </form>
   </div>
  </div>
 );
}
