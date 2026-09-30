import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../api/auth.js';
import Icon from '../components/ui/Icon.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { forgotPasswordSchema, parseWithSchema } from '../schemas/auth.schema.js';

// Backend deliberately returns the same generic response for an existing vs.
// nonexistent email (enumeration-safe — see backend/app/routers/auth.py's
// forgot_password handler) — this page must show one message regardless of
// what actually happened server-side, never "no account found".
const GENERIC_MESSAGE = "If an account exists for that email, we've sent a password reset link.";

export default function ForgotPassword() {
 useDocumentTitle('Forgot Password | CoralSwift Technologies');
 const [email, setEmail] = useState('');
 const [error, setError] = useState('');
 const [submitted, setSubmitted] = useState(false);
 const [submitting, setSubmitting] = useState(false);

 const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');

  const { success, errors } = parseWithSchema(forgotPasswordSchema, { email });
  if (!success) {
   setError(Object.values(errors)[0]);
   return;
  }

  setSubmitting(true);
  try {
   await forgotPassword(email);
   setSubmitted(true);
  } catch (err) {
   // Even a request-level failure (network/rate-limit) shouldn't leak
   // whether the email exists — only distinguish "couldn't send", not why.
   if (err?.status === 429) {
    setError('Too many attempts. Please wait a moment and try again.');
   } else if (err?.status === 0) {
    setError('Could not reach the server. Please try again.');
   } else {
    setSubmitted(true);
   }
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
      <h1 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand">Forgot Password</h1>
      <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">We&apos;ll email you a reset link</p>
     </div>
    </div>

    {submitted ? (
     <div className="flex flex-col gap-stack-md">
      <p className="flex items-start gap-2 rounded bg-status-success-bg p-3 text-body-sm text-status-success-text">
       <Icon name="check_circle" className="mt-0.5 text-base" />
       {GENERIC_MESSAGE}
      </p>
      <Link to="/login" className="text-center font-semibold text-brand hover:underline">Back to Sign In</Link>
     </div>
    ) : (
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
       {submitting ? 'Sending...' : 'Send Reset Link'}
      </button>

      <Link to="/login" className="text-center text-body-sm text-brand hover:underline">Back to Sign In</Link>
     </form>
    )}
   </div>
  </div>
 );
}
