import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../api/auth.js';
import Icon from '../components/ui/Icon.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { resetPasswordSchema, parseWithSchema } from '../schemas/auth.schema.js';

export default function ResetPassword() {
 useDocumentTitle('Reset Password | CoralSwift Technologies');
 const navigate = useNavigate();
 const [searchParams] = useSearchParams();
 // The token travels once, in the emailed link's query string — never
 // logged, never persisted, held only in component state for the single
 // POST /auth/reset-password call below.
 const token = searchParams.get('token') || '';

 const [password, setPassword] = useState('');
 const [confirm, setConfirm] = useState('');
 const [error, setError] = useState('');
 const [success, setSuccess] = useState(false);
 const [submitting, setSubmitting] = useState(false);
 const [showPassword, setShowPassword] = useState(false);

 const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  if (!token) { setError('This reset link is missing or invalid. Please request a new one.'); return; }

  const { success, errors } = parseWithSchema(resetPasswordSchema, { password, confirm });
  if (!success) {
   setError(Object.values(errors)[0]);
   return;
  }

  setSubmitting(true);
  try {
   await resetPassword(token, password);
   setSuccess(true);
   setTimeout(() => navigate('/login'), 2000);
  } catch (err) {
   // Backend gives 400 for both "invalid" and "already used" tokens
   // (single-use enforcement) — one message covers both without
   // distinguishing internal reasons to the user.
   setError(err?.status === 400
    ? 'This reset link is invalid or has expired. Please request a new one.'
    : (err.message || 'Could not reset your password. Please try again.'));
  } finally {
   setSubmitting(false);
  }
 };

 const inputClass = 'w-full rounded border border-outline-variant dark:border-dark-outline-variant px-4 py-2.5 text-body-md dark:text-dark-ink bg-white dark:bg-dark-surface focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand';

 return (
  <div className="flex min-h-[calc(100dvh-11rem)] items-center justify-center bg-surface-container px-4 py-section-padding dark:bg-dark-surface-container sm:px-6 lg:px-10 xl:px-12">
   <div className="w-full max-w-sm rounded-lg bg-white p-stack-lg shadow-card-hover dark:bg-dark-surface">
    <div className="mb-6 flex items-center gap-3">
     <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand">
      <Icon name="lock_reset" className="text-[18px] leading-none text-white" />
     </div>
     <div>
      <h1 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand">Reset Password</h1>
      <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">Choose a new password</p>
     </div>
    </div>

    {success ? (
     <p className="flex items-center gap-1 rounded bg-status-success-bg p-3 text-body-sm text-status-success-text">
      <Icon name="check_circle" className="text-base" />Password updated. Redirecting to sign in...
     </p>
    ) : !token ? (
     <div className="flex flex-col gap-stack-md">
      <p className="flex items-start gap-2 text-body-sm text-status-error-text">
       <Icon name="error" className="mt-0.5 text-base" />
       This reset link is missing or invalid.
      </p>
      <Link to="/forgot-password" className="text-center font-semibold text-brand hover:underline">Request a new link</Link>
     </div>
    ) : (
     <form onSubmit={handleSubmit} className="flex flex-col gap-stack-md">
      <label className="flex flex-col gap-1.5">
       <span className="font-label-caps text-label-caps uppercase text-ink-muted dark:text-dark-ink-muted">New Password</span>
       <div className="relative">
        <input
         required
         type={showPassword ? 'text' : 'password'}
         value={password}
         onChange={(e) => setPassword(e.target.value)}
         placeholder="Min. 8 chars, 1 upper, 1 lower, 1 number, 1 symbol"
         autoComplete="new-password"
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

      <label className="flex flex-col gap-1.5">
       <span className="font-label-caps text-label-caps uppercase text-ink-muted dark:text-dark-ink-muted">Confirm New Password</span>
       <input
        required
        type={showPassword ? 'text' : 'password'}
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        placeholder="Re-enter password"
        autoComplete="new-password"
        className={inputClass}
       />
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
       {submitting ? 'Resetting...' : 'Reset Password'}
      </button>
     </form>
    )}
   </div>
  </div>
 );
}
