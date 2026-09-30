import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Icon from '../components/ui/Icon.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import useAsyncAction from '../hooks/useAsyncAction.js';
import { ROLE_PORTAL_MAP } from './LoginPage.jsx';

export default function VerifyMfa() {
 useDocumentTitle('Verify Identity | CoralSwift Technologies');
 const { verifyMfa } = useAuth();
 const navigate = useNavigate();
 const location = useLocation();
 const { run, isPending } = useAsyncAction();

 // Carried over from LoginPage via navigate(..., { state }) — a direct visit
 // to this page (refresh, bookmark, back button) has no pending challenge,
 // so there's nothing to verify against.
 const mfaToken = location.state?.mfaToken || '';
 const returnTo = location.state?.returnTo || null;

 const [code, setCode] = useState('');
 const [error, setError] = useState('');

 const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');

  const trimmed = code.trim();
  if (!trimmed) {
   setError('Enter the code from your authenticator app or a backup code.');
   return;
  }

  await run(async () => {
   try {
    const user = await verifyMfa(mfaToken, trimmed);
    const target = ROLE_PORTAL_MAP[user?.role];
    if (!target) {
     throw new Error('Your account does not have access to any portal.');
    }
    navigate(returnTo || target, { replace: true });
   } catch (err) {
    setError(err.message || 'Invalid or expired code. Please try again.');
   }
  });
 };

 const inputClass = 'w-full rounded border border-outline-variant dark:border-dark-outline-variant px-4 py-2.5 text-body-md dark:text-dark-ink bg-white dark:bg-dark-surface focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand';

 return (
  <div className="flex min-h-[calc(100dvh-11rem)] items-center justify-center bg-surface-container px-4 py-section-padding dark:bg-dark-surface-container sm:px-6 lg:px-10 xl:px-12">
   <div className="w-full max-w-sm rounded-lg bg-white p-stack-lg shadow-card-hover dark:bg-dark-surface">
    <div className="mb-6 flex items-center gap-3">
     <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand">
      <Icon name="shield_lock" className="text-[18px] leading-none text-white" />
     </div>
     <div>
      <h1 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand">Verify Identity</h1>
      <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">Enter your two-factor code</p>
     </div>
    </div>

    {!mfaToken ? (
     <div className="flex flex-col gap-stack-md">
      <p className="flex items-start gap-2 text-body-sm text-status-error-text">
       <Icon name="error" className="mt-0.5 text-base" />
       This verification link is missing or expired. Please sign in again.
      </p>
      <Link to="/login" className="text-center font-semibold text-brand hover:underline">Back to Sign In</Link>
     </div>
    ) : (
     <form onSubmit={handleSubmit} className="flex flex-col gap-stack-md">
      <label className="flex flex-col gap-1.5">
       <span className="font-label-caps text-label-caps uppercase text-ink-muted dark:text-dark-ink-muted">Authentication Code</span>
       <input
        required
        type="text"
        inputMode="numeric"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="6-digit code or backup code"
        maxLength={64}
        autoComplete="one-time-code"
        autoFocus
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
       disabled={isPending}
       className="h-11 rounded bg-brand font-label-caps text-label-caps uppercase text-white transition-all hover:bg-brand-dark active:scale-95 disabled:opacity-60"
      >
       {isPending ? 'Verifying...' : 'Verify'}
      </button>

      <Link to="/login" className="text-center text-body-sm text-brand hover:underline">Back to Sign In</Link>
     </form>
    )}
   </div>
  </div>
 );
}
