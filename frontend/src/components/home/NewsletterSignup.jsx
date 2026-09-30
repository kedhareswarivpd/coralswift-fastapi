import { useState } from 'react';
import { subscribeNewsletter } from '../../api/cms.js';
import Icon from '../ui/Icon.jsx';

export default function NewsletterSignup() {
 const [email, setEmail] = useState('');
 const [status, setStatus] = useState('idle'); // idle | submitting | done | error
 const [message, setMessage] = useState('');

 const handleSubmit = async (e) => {
  e.preventDefault();
  setStatus('submitting');
  try {
   const res = await subscribeNewsletter({ email });
   setMessage(res?.message || "You're subscribed.");
   setStatus('done');
   setEmail('');
  } catch (err) {
   setMessage(err.message || 'Could not subscribe. Please try again.');
   setStatus('error');
  }
 };

 return (
  <section className="bg-brand-dark px-4 py-section-padding text-white sm:px-6 lg:px-10 xl:px-12 ">
   <div className="mx-auto flex max-w-container flex-col items-center gap-6 text-center">
    <Icon name="mail" className="text-4xl text-accent-cyan" />
    <h2 className="font-display text-headline-md">Stay ahead of the curve</h2>
    <p className="max-w-xl text-body-md text-white/80">
     Subscribe for engineering insights, case studies, and product updates — no spam, unsubscribe anytime.
    </p>
    {status === 'done' ? (
     <p className="flex items-center gap-2 rounded-lg bg-white/10 px-6 py-3 text-body-md">
      <Icon name="check_circle" className="text-accent-cyan" /> {message}
     </p>
    ) : (
     <form onSubmit={handleSubmit} className="flex w-full max-w-md flex-col gap-3 sm:flex-row">
      <input
       type="email"
       required
       value={email}
       onChange={(e) => setEmail(e.target.value)}
       placeholder="you@company.com"
       aria-label="Email address"
       className="w-full rounded-full border border-white/20 bg-white/10 px-5 py-3 text-body-md text-white placeholder:text-white/50 focus:border-accent-cyan focus:outline-none"
      />
      <button
       type="submit"
       disabled={status === 'submitting'}
       className="shrink-0 rounded-full bg-brand px-6 py-3 font-label-caps text-label-caps uppercase text-white transition-colors hover:bg-white hover:text-brand-dark disabled:opacity-60"
      >
       {status === 'submitting' ? 'Subscribing...' : 'Subscribe'}
      </button>
     </form>
    )}
    {status === 'error' && <p className="text-body-sm text-accent-red">{message}</p>}
   </div>
  </section>
 );
}
