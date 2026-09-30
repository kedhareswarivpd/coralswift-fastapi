import { useState, useEffect, useRef } from 'react';
import { submitContactForm } from '../../api/contact.js';
import { ApiRequestError } from '../../api/client.js';
import { validateContactForm } from '../../schemas/contact.schema.js';
import Icon from '../ui/Icon.jsx';

const initialForm = { name: '', email: '', phone: '', company: '', department: 'general', subject: '', message: '' };

const NAME_ALLOWED_CHARS = /[^A-Za-z\s'.-]/g;
const PHONE_ALLOWED_CHARS = /[^0-9+]/g;

const DEPARTMENTS = [
 { value: 'general', label: 'General Inquiry' },
 { value: 'sales', label: 'Sales' },
 { value: 'support', label: 'Support' },
 { value: 'hr', label: 'Careers / HR' },
];

export default function ContactForm() {
 const [form, setForm] = useState(initialForm);
 const [status, setStatus] = useState('idle');
 const [fieldErrors, setFieldErrors] = useState({});
 const [errorMessage, setErrorMessage] = useState('');
 const formRef = useRef(null);

 useEffect(() => {
  const keys = Object.keys(fieldErrors);
  if (keys.length > 0) {
   const firstInput = formRef.current?.querySelector(`#field-${keys[0]}`);
   firstInput?.focus();
  }
 }, [fieldErrors]);

 const update = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

 const updateName = (e) => {
  const value = e.target.value.replace(NAME_ALLOWED_CHARS, '');
  setForm((prev) => ({ ...prev, name: value }));
 };

 const updatePhone = (e) => {
  let value = e.target.value.replace(PHONE_ALLOWED_CHARS, '');
  value = value.replace(/(?!^)\+/g, ''); // '+' only allowed as the first character
  setForm((prev) => ({ ...prev, phone: value }));
 };

 const handleSubmit = async (e) => {
  e.preventDefault();
  setErrorMessage('');

  const errors = validateContactForm(form);
  if (Object.keys(errors).length > 0) {
   setFieldErrors(errors);
   setStatus('error');
   return;
  }

  setStatus('submitting');
  setFieldErrors({});

  try {
   await submitContactForm(form);
   setStatus('success');
   setForm(initialForm);
  } catch (err) {
   setStatus('error');
   if (err instanceof ApiRequestError && err.errors?.length) {
    const byField = {};
    err.errors.forEach((fe) => {
     if (fe.field) byField[fe.field] = fe.message;
    });
    setFieldErrors(byField);
   }
   setErrorMessage(err.message || 'Something went wrong. Please try again.');
  }
 };

 if (status === 'success') {
  return (
   <div className="rounded-lg border border-brand/20 bg-accent-cyan-pale p-stack-lg text-center">
    <Icon name="check_circle" className="mb-4 text-5xl text-brand" />
    <h3 className="mb-2 font-display text-headline-sm text-brand-dark">Message sent</h3>
    <p className="mb-6 text-ink-muted">
     Thank you for reaching out — our team will get back to you shortly.
    </p>
    <button
     onClick={() => setStatus('idle')}
     className="font-label-caps text-label-caps uppercase text-brand hover:underline"
    >
     Send another message
    </button>
   </div>
  );
 }

 return (
  <form onSubmit={handleSubmit} className="flex flex-col gap-stack-md" ref={formRef}>
   <div className="grid gap-stack-md sm:grid-cols-2">
    <Field label="Full Name" error={fieldErrors.name} inputId="field-name" errorId="field-error-name" required>
     {(fieldProps) => (
      <input required value={form.name} onChange={updateName} className={inputClass} placeholder="Jane Doe" {...fieldProps} />
     )}
    </Field>
    <Field label="Email" error={fieldErrors.email} inputId="field-email" errorId="field-error-email" required>
     {(fieldProps) => (
      <input
       required
       type="email"
       value={form.email}
       onChange={update('email')}
       className={inputClass}
       placeholder="jane@company.com"
       {...fieldProps}
      />
     )}
    </Field>
   </div>

   <div className="grid gap-stack-md sm:grid-cols-2">
    <Field label="Phone (optional)" error={fieldErrors.phone} inputId="field-phone" errorId="field-error-phone">
     {(fieldProps) => (
      <input value={form.phone} onChange={updatePhone} className={inputClass} placeholder="+15550000000" inputMode="tel" {...fieldProps} />
     )}
    </Field>
    <Field label="Company (optional)" error={fieldErrors.company} inputId="field-company" errorId="field-error-company">
     {(fieldProps) => (
      <input value={form.company} onChange={update('company')} className={inputClass} placeholder="Acme Corp" {...fieldProps} />
     )}
    </Field>
   </div>

   <Field label="Department" inputId="field-department">
    {(fieldProps) => (
     <select value={form.department} onChange={update('department')} className={inputClass} {...fieldProps}>
      {DEPARTMENTS.map((d) => (
       <option key={d.value} value={d.value}>
        {d.label}
       </option>
      ))}
     </select>
    )}
   </Field>

   <Field label="Subject (optional)" error={fieldErrors.subject} inputId="field-subject" errorId="field-error-subject">
    {(fieldProps) => (
     <input value={form.subject} onChange={update('subject')} className={inputClass} placeholder="How can we help?" {...fieldProps} />
    )}
   </Field>

   <Field label="Message" error={fieldErrors.message} inputId="field-message" errorId="field-error-message" required>
    {(fieldProps) => (
     <textarea
      required
      rows={5}
      value={form.message}
      onChange={update('message')}
      className={inputClass}
      placeholder="Tell us about your project..."
      {...fieldProps}
     />
    )}
   </Field>

   {status === 'error' && !Object.keys(fieldErrors).length && (
    <p className="text-body-sm text-status-error-text">{errorMessage}</p>
   )}

   <button
    type="submit"
    disabled={status === 'submitting'}
    className="h-12 rounded bg-brand font-label-caps text-label-caps uppercase text-white transition-all hover:bg-brand-dark active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
   >
    {status === 'submitting' ? 'Sending...' : 'Send Message'}
   </button>
  </form>
 );
}

const inputClass =
 'w-full rounded border border-outline-variant dark:border-dark-outline-variant bg-white dark:bg-dark-surface px-4 py-3 text-body-md text-ink dark:text-dark-ink focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition-colors';

function Field({ label, error, children, inputId, errorId, required }) {
 const fieldProps = {};
 if (inputId) fieldProps.id = inputId;
 if (error && errorId) fieldProps['aria-describedby'] = errorId;
 if (error) fieldProps['data-error'] = 'true';
 const render = typeof children === 'function' ? children(fieldProps) : children;

 return (
  <label className="flex flex-col gap-1.5">
   <span className="font-label-caps text-label-caps uppercase text-ink-muted">
    {label}
    {(required || error) && <span className="ml-0.5 text-red-500">*</span>}
   </span>
   <div className={error ? 'rounded ring-2 ring-red-400' : ''}>{render}</div>
   {error && errorId && <span id={errorId} className="text-xs text-red-500">{error}</span>}
  </label>
 );
}
