import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { useAuth } from '../context/AuthContext.jsx';
import Icon from '../components/ui/Icon.jsx';
import { registerSchema, parseWithSchema } from '../schemas/auth.schema.js';

// Public self-serve signup is Client-only by design — Employee and Admin accounts
// carry internal RBAC permissions and must be provisioned by an authenticated
// Admin/HR user via the "Add User" flow in the Admin Panel, not self-selected here.
// (Partner is a separate external account type, unaffected by that restriction.)
export default function Register() {
 useDocumentTitle('Register | CoralSwift Technologies');
 const navigate = useNavigate();
 const { register } = useAuth();

 const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
 const [error, setError] = useState('');
 const [success, setSuccess] = useState('');
 const [submitting, setSubmitting] = useState(false);
 const [showPassword, setShowPassword] = useState(false);

 const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

 const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');

  const { success, errors } = parseWithSchema(registerSchema, form);
  if (!success) {
   setError(Object.values(errors)[0]);
   return;
  }

  setSubmitting(true);
  try {
   await register(form.name, form.email, form.password);
   setSuccess('Account created! Check your email to verify your address, then sign in.');
   setTimeout(() => navigate('/login'), 1500);
  } catch (err) {
   setError(err.message || 'Registration failed. Please try again.');
  } finally {
   setSubmitting(false);
  }
 };

 const inputClass = 'w-full rounded border border-outline-variant dark:border-dark-outline-variant px-4 py-2.5 text-body-md dark:text-dark-ink bg-white dark:bg-dark-surface focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand';

 return (
  <div className="flex min-h-[calc(100dvh-11rem)] items-center justify-center bg-surface-container px-4 py-16 dark:bg-dark-surface-container sm:px-6 lg:px-10 xl:px-12">
   <div className="w-full max-w-md rounded-lg bg-white p-stack-lg shadow-card-hover dark:bg-dark-surface">
    <h1 className="mb-1 font-display text-headline-sm text-brand-dark dark:text-dark-brand">Create an account</h1>
    <p className="mb-stack-md text-body-sm text-ink-muted dark:text-dark-ink-muted">
     Already have an account?{' '}
     <button type="button" onClick={() => navigate('/login')} className="font-semibold text-brand hover:underline">Sign in</button>
    </p>

    <form onSubmit={handleSubmit} className="flex flex-col gap-stack-md">
     <label className="flex flex-col gap-1.5">
      <span className="font-label-caps text-label-caps uppercase text-ink-muted dark:text-dark-ink-muted">Full Name</span>
      <input required type="text" name="name" value={form.name} onChange={handleChange} placeholder="John Smith" className={inputClass} />
     </label>

     <label className="flex flex-col gap-1.5">
      <span className="font-label-caps text-label-caps uppercase text-ink-muted dark:text-dark-ink-muted">Email</span>
      <input required type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@company.com" autoComplete="username" className={inputClass} />
     </label>

     <label className="flex flex-col gap-1.5">
      <span className="font-label-caps text-label-caps uppercase text-ink-muted dark:text-dark-ink-muted">Password</span>
      <div className="relative">
       <input required type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} placeholder="Min. 8 chars, 1 upper, 1 lower, 1 number, 1 symbol" autoComplete="new-password" className={inputClass} />
       <button type="button" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-1 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center text-ink-muted hover:text-ink dark:text-dark-ink-muted dark:hover:text-dark-ink">
        <Icon name={showPassword ? 'visibility_off' : 'visibility'} />
       </button>
      </div>
     </label>

     <div className="rounded-lg bg-surface-container p-stack-md dark:bg-dark-surface-container">
      <p className="text-body-sm text-white dark:text-dark-ink-muted">
       Self-serve registration creates a Client account. Employee, Admin, and Partner accounts must be provisioned by your Admin/HR team.
      </p>
     </div>

     <label className="flex flex-col gap-1.5">
      <span className="font-label-caps text-label-caps uppercase text-ink-muted dark:text-dark-ink-muted">Confirm Password</span>
      <input required type={showPassword ? 'text' : 'password'} name="confirm" value={form.confirm} onChange={handleChange} placeholder="Re-enter password" autoComplete="new-password" className={inputClass} />
     </label>

     {error && (
      <p className="flex items-start gap-1 text-body-sm text-status-error-text">
       <Icon name="error" className="mt-0.5 shrink-0 text-base" />{error}
      </p>
     )}
     {success && (
      <p className="flex items-center gap-1 rounded bg-status-success-bg p-3 text-body-sm text-status-success-text">
       <Icon name="check_circle" className="text-base" />{success}
      </p>
     )}

     <button type="submit" disabled={submitting} className="h-11 rounded bg-brand font-label-caps text-label-caps uppercase text-white transition-all hover:bg-brand-dark active:scale-95 disabled:opacity-60">
      {submitting ? 'Creating account...' : 'Create Account'}
     </button>

     <p className="text-center text-body-sm text-ink-muted dark:text-dark-ink-muted">
      By registering you agree to our{' '}
      <Link to="/terms" className="text-brand hover:underline">Terms</Link>{' '}and{' '}
      <Link to="/privacy" className="text-brand hover:underline">Privacy Policy</Link>.
     </p>
    </form>
   </div>
  </div>
 );
}
