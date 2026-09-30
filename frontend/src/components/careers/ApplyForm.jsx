import { useState } from 'react';
import { submitJobApplication } from '../../api/careers.js';
import { validateApplyForm } from '../../schemas/careers.schema.js';
import Modal from '../ui/Modal.jsx';

const TEXT_FIELDS = [
 { name: 'full_name', label: 'Full Name', type: 'text', required: true },
 { name: 'email', label: 'Email', type: 'email', required: true },
 { name: 'phone', label: 'Phone', type: 'tel', required: false },
 { name: 'linkedin_url', label: 'LinkedIn URL', type: 'url', required: false },
];

const inputClasses =
 'w-full mt-1 px-3 py-2 rounded border border-outline-variant dark:border-dark-outline-variant ' +
 'bg-white dark:bg-dark-surface text-ink dark:text-dark-ink text-body-md focus:outline-none focus:border-brand';

export default function ApplyForm({ job, onClose }) {
 const [form, setForm] = useState({ full_name: '', email: '', phone: '', linkedin_url: '', cover_letter: '' });
 const [resume, setResume] = useState(null);
 const [errors, setErrors] = useState({});
 const [status, setStatus] = useState('idle');
 const [serverError, setServerError] = useState('');

 const setField = (name) => (e) => setForm((f) => ({ ...f, [name]: e.target.value }));

 const validate = () => validateApplyForm(form, resume);

 const handleSubmit = async (e) => {
  e.preventDefault();
  const next = validate();
  setErrors(next);
  if (Object.keys(next).length) return;
  setStatus('submitting');
  setServerError('');
  try {
   await submitJobApplication(job.id, { ...form, resume });
   setStatus('success');
  } catch (err) {
   setStatus('error');
   setServerError(err.message || 'Something went wrong. Please try again.');
  }
 };

 return (
  <Modal open onClose={onClose} title={`Apply for ${job.title}`} size="lg">
   <p className="-mt-3 mb-2 text-body-sm text-ink-muted dark:text-dark-ink-muted">
    {job.department} · {job.location}
   </p>

   {status === 'success' ? (
     <div className="mt-6">
      <p className="mb-4 text-body-md text-brand">
       Thank you — your application for {job.title} has been submitted successfully.
      </p>
      <button
       type="button"
       onClick={onClose}
       className="w-full rounded bg-brand py-2.5 font-label-caps text-label-caps uppercase text-white transition-colors hover:bg-brand-dark"
      >
       Done
      </button>
     </div>
    ) : (
     <form onSubmit={handleSubmit} className="mt-4 space-y-4" noValidate>
      {TEXT_FIELDS.map((field) => (
       <div key={field.name}>
        <label htmlFor={`apply-${field.name}`} className="text-body-sm text-ink-muted dark:text-dark-ink-muted">
         {field.label} {field.required && <span className="text-accent-red">*</span>}
        </label>
        <input
         id={`apply-${field.name}`}
         type={field.type}
         value={form[field.name]}
         onChange={setField(field.name)}
         className={inputClasses}
        />
        {errors[field.name] && <p className="mt-1 text-body-xs text-accent-red">{errors[field.name]}</p>}
       </div>
      ))}

      <div>
       <label htmlFor="apply-cover_letter" className="text-body-sm text-ink-muted dark:text-dark-ink-muted">
        Cover Letter <span className="text-ink-muted/60 dark:text-dark-ink-muted/60">(optional)</span>
       </label>
       <textarea
        id="apply-cover_letter"
        rows="4"
        value={form.cover_letter}
        onChange={setField('cover_letter')}
        className={inputClasses}
       />
      </div>

      <div>
       <label htmlFor="apply-resume" className="text-body-sm text-ink-muted dark:text-dark-ink-muted">
        Resume <span className="text-accent-red">*</span>
       </label>
       <input
        id="apply-resume"
        type="file"
        accept=".pdf,.doc,.docx,.txt"
        onChange={(e) => setResume(e.target.files?.[0] || null)}
        className="mt-1 w-full text-body-sm text-ink-muted file:mr-3 file:cursor-pointer file:rounded file:border-0 file:bg-brand file:px-4 file:py-2 file:text-white dark:text-dark-ink-muted"
       />
       {errors.resume && <p className="mt-1 text-body-xs text-accent-red">{errors.resume}</p>}
      </div>

      {serverError && <p className="text-body-sm text-accent-red">{serverError}</p>}

      <div className="flex gap-3 pt-2">
       <button
        type="submit"
        disabled={status === 'submitting'}
        className="flex-1 rounded bg-brand py-2.5 font-label-caps text-label-caps uppercase text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
       >
        {status === 'submitting' ? 'Submitting...' : 'Submit Application'}
       </button>
       <button
        type="button"
        onClick={onClose}
        className="flex-1 rounded border border-outline-variant py-2.5 font-label-caps text-label-caps uppercase text-ink transition-colors hover:bg-surface-dim dark:border-dark-outline-variant dark:text-dark-ink dark:hover:bg-dark-surface-dim"
       >
        Cancel
       </button>
      </div>
     </form>
    )}
  </Modal>
 );
}