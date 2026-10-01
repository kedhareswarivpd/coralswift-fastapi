import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Icon from '../components/ui/Icon.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { loginSchema, parseWithSchema } from '../schemas/auth.schema.js';

export default function SuperAdminLogin() {
 useDocumentTitle('Super Admin Verification | CoralSwift Technologies');
 const { login } = useAuth();
 const navigate = useNavigate();
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
   const userData = await login(email, password);
   const role = userData?.role;

   if (role !== 'super_admin') {
    throw new Error('Access denied. Only Super Admin accounts are allowed.');
   }

   navigate('/super-admin', { replace: true });
  } catch (err) {
   setError(err.message || 'Invalid credentials.');
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
      <h1 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand">Super Admin Verification</h1>
      <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">Re-enter credentials to access the Super Admin portal</p>
     </div>
    </div>

    <form onSubmit={handleSubmit} autoComplete="off" className="flex flex-col gap-stack-md">
     <label className="flex flex-col gap-1.5">
      <span className="font-label-caps text-label-caps uppercase text-ink-muted dark:text-dark-ink-muted">Email</span>
      <input
       required
       type="email"
       value={email}
       onChange={(e) => setEmail(e.target.value)}
       placeholder="superadmin@coralswifttech.com"
       autoComplete="off"
       className={inputClass}
      />
     </label>

     <label className="flex flex-col gap-1.5">
      <span className="font-label-caps text-label-caps uppercase text-ink-muted dark:text-dark-ink-muted">Password</span>
      <div className="relative">
       <input
        required
        type="text"
        name="auth_code"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
        autoComplete="off"
        data-lpignore="true"
        data-form-type="other"
        style={{ WebkitTextSecurity: showPassword ? 'none' : 'disc' }}
        className={inputClass}
       />
       <button
        type="button"
        onClick={() => setShowPassword((v) => !v)}
        aria-label={showPassword ? 'Hide password' : 'Show password'}
        className="absolute right-1 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center text-ink-muted hover:text-ink"
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
      {submitting ? 'Verifying...' : 'Verify & Access'}
     </button>

     <p className="text-center text-body-sm text-ink-muted dark:text-dark-ink-muted">
      <Link to="/admin" className="font-semibold text-brand hover:underline">Back to Admin Panel</Link>
     </p>
    </form>
   </div>
  </div>
 );
}
