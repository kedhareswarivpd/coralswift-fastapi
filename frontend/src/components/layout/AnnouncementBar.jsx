import { useEffect, useState } from 'react';
import Icon from '../ui/Icon.jsx';
import { fetchAnnouncements } from '../../api/cms.js';

// Workflow doc §23: "Announcements" is a named CMS content type — publish
// via the admin Content Manager, shows here site-wide until dismissed or
// expired. Client-side expiry filter since the backend only filters on
// is_published (matches every other simple CMS resource's contract).
export default function AnnouncementBar() {
 const [announcements, setAnnouncements] = useState([]);
 const [dismissed, setDismissed] = useState(() => {
  try {
   return JSON.parse(sessionStorage.getItem('dismissedAnnouncements') || '[]');
  } catch {
   return [];
  }
 });

 useEffect(() => {
  let cancelled = false;
  fetchAnnouncements().then((res) => {
   if (!cancelled && Array.isArray(res?.data)) {
    setAnnouncements([...res.data].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
   }
  }).catch(() => {});
  return () => { cancelled = true; };
 }, []);

 const now = Date.now();
 const active = announcements
  .filter((a) => !a.expires_at || new Date(a.expires_at).getTime() > now)
  .filter((a) => !dismissed.includes(a.id));

 if (active.length === 0) return null;
 const announcement = active[0];

 const handleDismiss = () => {
  const next = [...dismissed, announcement.id];
  setDismissed(next);
  try {
   sessionStorage.setItem('dismissedAnnouncements', JSON.stringify(next));
  } catch {
   // sessionStorage unavailable (private browsing etc.) — dismissal just
   // won't persist across a reload, not worth failing the whole banner over.
  }
 };

 return (
  <div className="relative flex items-center justify-center gap-3 bg-brand px-4 py-2.5 text-center text-body-sm text-white">
   <Icon name="campaign" className="hidden text-base sm:inline" />
   <p className="font-medium">
    <span className="font-semibold">{announcement.title}</span>
    {announcement.body && <span className="ml-1.5 opacity-90">{announcement.body}</span>}
   </p>
   <button
    type="button"
    onClick={handleDismiss}
    aria-label="Dismiss announcement"
    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/80 transition-colors hover:text-white"
   >
    <Icon name="close" className="text-base" />
   </button>
  </div>
 );
}
