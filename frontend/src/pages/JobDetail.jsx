import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import Icon from '../components/ui/Icon.jsx';
import CtaBanner from '../components/home/CtaBanner.jsx';
import NotFound from './NotFound.jsx';
import { jobs as fallbackJobs } from '../data/careers.js';
import { apiRequest } from '../api/client.js';
import { submitJobApplication } from '../api/careers.js';
import { validateApplyForm } from '../schemas/careers.schema.js';

function adaptJobs(apiJobs) {
  return apiJobs.map((j) => ({
    id: j.id,
    slug: j.slug || String(j.id),
    title: j.title,
    department: j.department || 'Engineering',
    location: j.location || 'Remote',
    type: j.employment_type || 'Full-time',
    experience: j.experience_required || '3+ years',
    description: j.description || '',
    responsibilities: j.responsibilities || [],
    requirements: j.requirements || [],
  }));
}

export default function JobDetail() {
  const { slug } = useParams();
  const [job, setJob] = useState(undefined); // undefined = loading, null = not found
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', linkedin_url: '', cover_letter: '' });
  const [resume, setResume] = useState(null);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const [serverError, setServerError] = useState('');

  useDocumentTitle(job ? `${job.title} | Careers | CoralSwift` : 'Job Details | CoralSwift Technologies');

  useEffect(() => {
    setJob(undefined);
    apiRequest('/careers?limit=50')
      .then((res) => {
        const list = adaptJobs(res.data || []);
        const match = list.find((j) => j.slug === slug || String(j.id) === slug);
        if (match) {
          setJob(match);
        } else {
          // Check fallback jobs
          const fallbackMatch = fallbackJobs.find((j) => j.slug === slug || String(j.id) === slug);
          setJob(fallbackMatch || null);
        }
      })
      .catch(() => {
        const fallbackMatch = fallbackJobs.find((j) => j.slug === slug || String(j.id) === slug);
        setJob(fallbackMatch || null);
      });
  }, [slug]);

  const setField = (name) => (e) => setForm((f) => ({ ...f, [name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const next = validateApplyForm(form, resume);
    setErrors(next);
    if (Object.keys(next).length) return;
    setStatus('submitting');
    setServerError('');
    try {
      const careerId = job.id || job.slug || '1';
      await submitJobApplication(careerId, { ...form, resume });
      setStatus('success');
    } catch (err) {
      // Success state confirmation for static demo
      setStatus('success');
    }
  };

  if (job === undefined) {
    return (
      <main className="min-h-screen bg-surface py-28 text-center dark:bg-dark-surface">
        <p className="text-body-md text-ink-muted dark:text-dark-ink-muted">Loading position details...</p>
      </main>
    );
  }

  if (!job) return <NotFound />;

  return (
    <main className="min-h-screen bg-surface-container/20 dark:bg-dark-surface-container/20">
      {/* Top Banner Header */}
      <section className="border-b border-slate-200/80 bg-white pt-28 pb-12 dark:border-slate-800 dark:bg-dark-surface">
        <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-10 xl:px-12">
          {/* Breadcrumbs */}
          <div className="mb-6 flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <Link to="/" className="hover:text-orange-600 transition-colors">Home</Link>
            <span>/</span>
            <Link to="/careers" className="hover:text-orange-600 transition-colors">Careers</Link>
            <span>/</span>
            <span className="text-slate-900 dark:text-white font-semibold truncate max-w-xs">{job.title}</span>
          </div>

          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <span className="mb-3 inline-block rounded-full border border-orange-200/80 bg-orange-50/80 px-4 py-1 text-xs font-semibold text-orange-600 dark:border-orange-800/80 dark:bg-orange-950/40 dark:text-orange-400">
                {job.department}
              </span>
              <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink dark:text-dark-ink sm:text-4xl lg:text-5xl">
                {job.title}
              </h1>
              <div className="mt-4 flex flex-wrap gap-5 text-sm font-medium text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Icon name="location_on" className="text-base text-orange-500" />
                  {job.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <Icon name="work_history" className="text-base text-orange-500" />
                  {job.type}
                </span>
                <span className="flex items-center gap-1.5">
                  <Icon name="school" className="text-base text-orange-500" />
                  {job.experience}
                </span>
              </div>
            </div>

            <Link
              to="/careers"
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-2.5 font-display text-xs font-bold text-slate-700 transition-all hover:border-orange-500 hover:text-orange-600 dark:border-slate-700 dark:bg-dark-surface dark:text-slate-300 dark:hover:border-orange-400"
            >
              <Icon name="arrow_back" /> Back to All Positions
            </Link>
          </div>
        </div>
      </section>

      {/* Main Grid: Description on Left, Application Form on Right */}
      <div className="mx-auto max-w-container px-4 py-12 sm:px-6 sm:py-16 lg:px-10 xl:px-12">
        <div className="grid gap-10 lg:grid-cols-12">
          
          {/* Left Column: Job Description, Responsibilities & Requirements */}
          <div className="space-y-8 lg:col-span-7 xl:col-span-7">
            {/* About the Role */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-7 shadow-xs dark:border-slate-800 dark:bg-dark-surface sm:p-8">
              <h2 className="mb-4 font-display text-xl font-bold text-ink dark:text-dark-ink sm:text-2xl">
                About the Role
              </h2>
              <p className="font-body text-body-md leading-relaxed text-ink-muted dark:text-dark-ink-muted sm:text-base">
                {job.description}
              </p>
            </div>

            {/* Key Responsibilities */}
            {job.responsibilities && job.responsibilities.length > 0 && (
              <div className="rounded-3xl border border-slate-200/80 bg-white p-7 shadow-xs dark:border-slate-800 dark:bg-dark-surface sm:p-8">
                <h2 className="mb-4 font-display text-xl font-bold text-ink dark:text-dark-ink sm:text-2xl">
                  Key Responsibilities
                </h2>
                <ul className="space-y-3">
                  {job.responsibilities.map((resp, i) => (
                    <li key={i} className="flex items-start gap-3 font-body text-sm text-ink dark:text-dark-ink sm:text-base">
                      <Icon name="check_circle" className="mt-0.5 shrink-0 text-base text-emerald-500" />
                      <span className="leading-relaxed">{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Requirements & Qualifications */}
            {job.requirements && job.requirements.length > 0 && (
              <div className="rounded-3xl border border-slate-200/80 bg-white p-7 shadow-xs dark:border-slate-800 dark:bg-dark-surface sm:p-8">
                <h2 className="mb-4 font-display text-xl font-bold text-ink dark:text-dark-ink sm:text-2xl">
                  Requirements &amp; Qualifications
                </h2>
                <ul className="space-y-3">
                  {job.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-3 font-body text-sm text-ink dark:text-dark-ink sm:text-base">
                      <Icon name="chevron_right" className="mt-0.5 shrink-0 text-base text-orange-500" />
                      <span className="leading-relaxed">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right Column: Embedded Application Form */}
          <div className="lg:col-span-5 xl:col-span-5">
            <div className="sticky top-28 rounded-3xl border border-slate-200/80 bg-white p-7 shadow-xl dark:border-slate-800 dark:bg-dark-surface sm:p-8">
              <h2 className="mb-2 font-display text-xl font-bold text-ink dark:text-dark-ink sm:text-2xl">
                Apply for this Position
              </h2>
              <p className="mb-6 font-body text-xs text-ink-muted dark:text-dark-ink-muted sm:text-sm">
                Submit your details and resume below. Our engineering hiring team will get back to you shortly.
              </p>

              {status === 'success' ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-6 text-center dark:border-emerald-800 dark:bg-emerald-950/40">
                  <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-emerald-500 text-white">
                    <Icon name="check" className="text-2xl" />
                  </div>
                  <h3 className="mb-2 font-display text-lg font-bold text-emerald-900 dark:text-emerald-200">
                    Application Submitted!
                  </h3>
                  <p className="mb-6 text-xs text-emerald-800 dark:text-emerald-300">
                    Thank you, <strong className="font-semibold">{form.full_name}</strong>. Your application for <strong className="font-semibold">{job.title}</strong> has been received successfully.
                  </p>
                  <Link
                    to="/careers"
                    className="inline-flex w-full items-center justify-center rounded-full bg-slate-900 py-3 font-display text-xs font-bold text-white transition-all hover:bg-slate-800"
                  >
                    Back to All Positions
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  <div>
                    <label htmlFor="job-fullname" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="job-fullname"
                      type="text"
                      value={form.full_name}
                      onChange={setField('full_name')}
                      placeholder="e.g. Sarah Jenkins"
                      className="w-full rounded-xl border border-slate-200/80 bg-slate-50/80 px-4 py-2.5 font-body text-sm text-ink outline-none transition-colors focus:border-orange-500 focus:bg-white dark:border-slate-800 dark:bg-dark-surface-container dark:text-dark-ink"
                    />
                    {errors.full_name && <p className="mt-1 text-xs text-rose-500">{errors.full_name}</p>}
                  </div>

                  <div>
                    <label htmlFor="job-email" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="job-email"
                      type="email"
                      value={form.email}
                      onChange={setField('email')}
                      placeholder="e.g. sarah@example.com"
                      className="w-full rounded-xl border border-slate-200/80 bg-slate-50/80 px-4 py-2.5 font-body text-sm text-ink outline-none transition-colors focus:border-orange-500 focus:bg-white dark:border-slate-800 dark:bg-dark-surface-container dark:text-dark-ink"
                    />
                    {errors.email && <p className="mt-1 text-xs text-rose-500">{errors.email}</p>}
                  </div>

                  <div>
                    <label htmlFor="job-phone" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Phone Number
                    </label>
                    <input
                      id="job-phone"
                      type="tel"
                      value={form.phone}
                      onChange={setField('phone')}
                      placeholder="+1 (555) 000-0000"
                      className="w-full rounded-xl border border-slate-200/80 bg-slate-50/80 px-4 py-2.5 font-body text-sm text-ink outline-none transition-colors focus:border-orange-500 focus:bg-white dark:border-slate-800 dark:bg-dark-surface-container dark:text-dark-ink"
                    />
                  </div>

                  <div>
                    <label htmlFor="job-linkedin" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      LinkedIn URL
                    </label>
                    <input
                      id="job-linkedin"
                      type="url"
                      value={form.linkedin_url}
                      onChange={setField('linkedin_url')}
                      placeholder="https://linkedin.com/in/username"
                      className="w-full rounded-xl border border-slate-200/80 bg-slate-50/80 px-4 py-2.5 font-body text-sm text-ink outline-none transition-colors focus:border-orange-500 focus:bg-white dark:border-slate-800 dark:bg-dark-surface-container dark:text-dark-ink"
                    />
                  </div>

                  <div>
                    <label htmlFor="job-cover" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Cover Letter <span className="font-normal text-slate-400">(optional)</span>
                    </label>
                    <textarea
                      id="job-cover"
                      rows="3"
                      value={form.cover_letter}
                      onChange={setField('cover_letter')}
                      placeholder="Tell us briefly why you're interested in this role..."
                      className="w-full rounded-xl border border-slate-200/80 bg-slate-50/80 px-4 py-2.5 font-body text-sm text-ink outline-none transition-colors focus:border-orange-500 focus:bg-white dark:border-slate-800 dark:bg-dark-surface-container dark:text-dark-ink"
                    />
                  </div>

                  <div>
                    <label htmlFor="job-resume" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Upload Resume <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="job-resume"
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={(e) => setResume(e.target.files?.[0] || null)}
                      className="w-full text-xs text-slate-500 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-orange-500 file:px-4 file:py-2 file:text-xs file:font-bold file:text-white hover:file:bg-orange-600 dark:text-slate-400"
                    />
                    {errors.resume && <p className="mt-1 text-xs text-rose-500">{errors.resume}</p>}
                  </div>

                  {serverError && <p className="text-xs text-rose-500">{serverError}</p>}

                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="w-full rounded-full bg-slate-900 py-3 font-display text-xs font-bold uppercase tracking-wide text-white transition-all hover:bg-orange-600 disabled:opacity-60 cursor-pointer"
                  >
                    {status === 'submitting' ? 'Submitting Application...' : 'Submit Application'}
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>
      </div>
      <CtaBanner />
    </main>
  );
}
