import { useState } from 'react';
import Icon from '../ui/Icon.jsx';
import StatusBadge from '../ui/StatusBadge.jsx';
import Badge from '../ui/Badge.jsx';
import Button from '../ui/Button.jsx';
import { SkeletonCard } from '../ui/Skeleton.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import Reveal from '../ui/Reveal.jsx';
import { submitContactForm } from '../../api/contact.js';

function RegisterModal({ event, onClose }) {
 const [form, setForm] = useState({ name: '', email: '', phone: '', company: '' });
 const [status, setStatus] = useState('idle'); // idle | loading | success | error

 async function handleSubmit(e) {
  e.preventDefault();
  setStatus('loading');
  try {
   await submitContactForm({
    ...form,
    subject: `Event Registration: ${event.title}`,
    message: `I would like to register for the event: ${event.title} on ${new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at ${event.location}.`,
    department: 'events',
   });
   setStatus('success');
  } catch {
   setStatus('error');
  }
 }

 return (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" onClick={onClose}>
   <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-2xl dark:bg-dark-surface" onClick={(e) => e.stopPropagation()}>
    <div className="mb-6 flex items-start justify-between">
     <div>
      <h2 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand">Register for Event</h2>
      <p className="mt-1 text-body-sm text-ink-muted dark:text-dark-ink-muted">{event.title}</p>
     </div>
     <button onClick={onClose} aria-label="Close" className="ml-4 text-ink-muted hover:text-ink dark:text-dark-ink-muted dark:hover:text-dark-ink">
      <Icon name="close" className="text-xl" />
     </button>
    </div>

    {status === 'success' ? (
     <div className="py-6 text-center">
      <Icon name="check_circle" className="mb-3 text-5xl text-green-500" />
      <p className="font-semibold text-ink dark:text-dark-ink">Registration received!</p>
      <p className="mt-1 text-body-sm text-ink-muted dark:text-dark-ink-muted">We&apos;ll send confirmation details to {form.email}.</p>
      <Button variant="outline" size="md" className="mt-6" onClick={onClose}>Close</Button>
     </div>
    ) : (
     <form onSubmit={handleSubmit} className="space-y-4">
      <div>
       <label className="mb-1 block font-label-caps text-label-caps text-ink-muted dark:text-dark-ink-muted">Full Name *</label>
       <input
        required
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        className="w-full rounded-lg border border-outline-variant bg-white px-3 py-2 text-body-md focus:outline-none focus:ring-2 focus:ring-brand dark:border-dark-outline-variant dark:bg-dark-surface-container"
       />
      </div>
      <div>
       <label className="mb-1 block font-label-caps text-label-caps text-ink-muted dark:text-dark-ink-muted">Email *</label>
       <input
        required
        type="email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        className="w-full rounded-lg border border-outline-variant bg-white px-3 py-2 text-body-md focus:outline-none focus:ring-2 focus:ring-brand dark:border-dark-outline-variant dark:bg-dark-surface-container"
       />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
       <div>
        <label className="mb-1 block font-label-caps text-label-caps text-ink-muted dark:text-dark-ink-muted">Phone</label>
        <input
         value={form.phone}
         onChange={(e) => setForm({ ...form, phone: e.target.value })}
         className="w-full rounded-lg border border-outline-variant bg-white px-3 py-2 text-body-md focus:outline-none focus:ring-2 focus:ring-brand dark:border-dark-outline-variant dark:bg-dark-surface-container"
        />
       </div>
       <div>
        <label className="mb-1 block font-label-caps text-label-caps text-ink-muted dark:text-dark-ink-muted">Company</label>
        <input
         value={form.company}
         onChange={(e) => setForm({ ...form, company: e.target.value })}
         className="w-full rounded-lg border border-outline-variant bg-white px-3 py-2 text-body-md focus:outline-none focus:ring-2 focus:ring-brand dark:border-dark-outline-variant dark:bg-dark-surface-container"
        />
       </div>
      </div>
      {status === 'error' && (
       <p className="text-body-sm text-red-500">Something went wrong. Please try again.</p>
      )}
      <Button type="submit" variant="primary" size="md" className="w-full" disabled={status === 'loading'}>
       {status === 'loading' ? 'Submitting…' : 'Confirm Registration'}
      </Button>
     </form>
    )}
   </div>
  </div>
 );
}

export default function EventsGrid({ events, typeFilters }) {
 const [activeType, setActiveType] = useState('All');
 const [registerEvent, setRegisterEvent] = useState(null);
 if (!events) {
  return (
   <section className="py-section-padding">
    <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-10 xl:px-12">
     <div className="grid gap-gutter md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }, (_, i) => <SkeletonCard key={i} />)}
     </div>
    </div>
   </section>
  );
 }
 if (!events.length) return <EmptyState icon="event" title="No events scheduled" description="Check back later." />;

 const filtered = activeType === 'All' ? events : events.filter((e) => e.type === activeType);

 function handleRegister(event) {
  const url = event.registrationUrl;
  if (url && url !== '#') {
   window.open(url, '_blank', 'noopener,noreferrer');
  } else {
   setRegisterEvent(event);
  }
 }

 return (
  <section className="py-section-padding">
   <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-10 xl:px-12">
    <div className="mb-stack-lg flex flex-wrap gap-2">
     {typeFilters.map((t) => (
      <button
       key={t}
       onClick={() => setActiveType(t)}
       className={`rounded-full px-4 py-2 font-label-caps text-label-caps uppercase transition-all ${
        activeType === t
         ? 'bg-brand text-white'
         : 'bg-surface-container text-ink-muted hover:bg-outline-variant dark:bg-dark-surface-container dark:text-dark-ink-muted dark:hover:bg-dark-outline-variant'
       }`}
      >
       {t}
      </button>
     ))}
    </div>
    <div className="grid gap-gutter md:grid-cols-2 lg:grid-cols-3">
     {filtered.map((event, i) => (
      <Reveal key={event.slug} from="zoom" delay={i * 80}>
       <div className="flex h-full flex-col rounded-lg border border-outline-variant bg-white p-stack-lg transition-all hover:-translate-y-1 hover:shadow-card-hover dark:border-dark-outline-variant dark:bg-dark-surface">
        <div className="mb-3 flex items-start justify-between">
         <StatusBadge variant={event.isVirtual ? 'info' : 'success'}>
          {event.isVirtual ? 'Virtual' : 'In-Person'}
         </StatusBadge>
         <Badge className="bg-accent-cyan-pale text-label-caps text-brand">{event.type}</Badge>
        </div>
        <h3 className="mb-3 font-display text-headline-sm text-brand-dark dark:text-dark-brand">{event.title}</h3>
        <p className="mb-4 flex-1 text-body-md text-ink-muted dark:text-dark-ink-muted">{event.description}</p>
        <div className="space-y-2 border-t border-outline-variant pt-4 text-body-sm text-ink-muted dark:border-dark-outline-variant dark:text-dark-ink-muted">
         <div className="flex items-center gap-2">
          <Icon name="calendar_today" className="text-lg text-brand" />
          <span>{new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
         </div>
         <div className="flex items-center gap-2">
          <Icon name="schedule" className="text-lg text-brand" />
          <span>{event.time}</span>
         </div>
         <div className="flex items-center gap-2">
          <Icon name="location_on" className="text-lg text-brand" />
          <span>{event.location}</span>
         </div>
        </div>
        <div className="mt-4 border-t border-outline-variant pt-4 dark:border-dark-outline-variant">
         <Button variant="outline" size="md" className="w-full" onClick={() => handleRegister(event)}>
          Register Now
         </Button>
        </div>
       </div>
      </Reveal>
     ))}
    </div>
   </div>

   {registerEvent && (
    <RegisterModal event={registerEvent} onClose={() => setRegisterEvent(null)} />
   )}
  </section>
 );
}
