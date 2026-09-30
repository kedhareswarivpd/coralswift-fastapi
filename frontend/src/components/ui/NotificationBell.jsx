import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from './Icon.jsx';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from '../../api/admin.js';

const TYPE_COLOR = { info: 'text-status-info-text', success: 'text-status-success-text', warning: 'text-status-warning-text', error: 'text-status-error-text' };
const TYPE_ICON = { info: 'info', success: 'check_circle', warning: 'warning', error: 'error' };

// Any authenticated user's own notifications — GET /notifications is
// role-agnostic (see backend/app/routers/notification.py), so this bell
// works the same for every portal, not just admin.
export default function NotificationBell() {
 const navigate = useNavigate();
 const [open, setOpen] = useState(false);
 const [notifications, setNotifications] = useState([]);
 const [loading, setLoading] = useState(false);
 const ref = useRef(null);

 const load = useCallback(() => {
  fetchNotifications().then((res) => setNotifications(res?.data || [])).catch(() => {});
 }, []);

 useEffect(() => { load(); }, [load]);

 useEffect(() => {
  const handleClickOutside = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
 }, []);

 const unreadCount = notifications.filter((n) => !n.is_read).length;

 const handleToggle = () => {
  setOpen((v) => !v);
  if (!open) { setLoading(true); fetchNotifications().then((res) => setNotifications(res?.data || [])).finally(() => setLoading(false)); }
 };

 const handleClickNotification = async (n) => {
  if (!n.is_read) {
   try { await markNotificationRead(n.id); load(); } catch { /* stays unread on failure */ }
  }
  if (n.link) { setOpen(false); navigate(n.link); }
 };

 const handleMarkAllRead = async () => {
  try { await markAllNotificationsRead(); load(); } catch { /* list stays unchanged on failure */ }
 };

 return (
  <div className="relative" ref={ref}>
   <button type="button" aria-label="Notifications" onClick={handleToggle}
    className="relative flex h-10 w-10 items-center justify-center rounded-full text-white/80 hover:bg-white/10 hover:text-white">
    <Icon name="notifications" className="text-xl" />
    {unreadCount > 0 && (
     <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-status-error px-1 text-[10px] font-bold text-white">
      {unreadCount > 9 ? '9+' : unreadCount}
     </span>
    )}
   </button>
   {open && (
    <div className="absolute right-0 z-30 mt-2 w-96 max-w-[90vw] rounded-xl border border-outline-variant bg-white shadow-2xl dark:border-dark-outline-variant dark:bg-dark-surface-container">
     <div className="flex items-center justify-between border-b border-outline-variant px-4 py-3 dark:border-dark-outline-variant">
      <p className="font-label-caps text-label-caps uppercase text-ink dark:text-white">Notifications</p>
      {unreadCount > 0 && (
       <button type="button" onClick={handleMarkAllRead} className="text-body-xs font-semibold text-brand hover:underline">Mark all read</button>
      )}
     </div>
     <div className="max-h-96 overflow-y-auto">
      {loading && <p className="px-4 py-6 text-center text-body-sm text-ink-muted dark:text-dark-ink-muted">Loading...</p>}
      {!loading && !notifications.length && <p className="px-4 py-6 text-center text-body-sm text-ink-muted dark:text-dark-ink-muted">No notifications yet.</p>}
      {!loading && notifications.map((n) => (
       <button key={n.id} type="button" onClick={() => handleClickNotification(n)}
        className={`flex w-full items-start gap-3 border-b border-outline-variant px-4 py-3 text-left last:border-b-0 hover:bg-accent-cyan-pale dark:border-dark-outline-variant dark:hover:bg-blue-900/30 ${!n.is_read ? 'bg-accent-cyan-pale/50 dark:bg-blue-900/20' : ''}`}>
        <Icon name={TYPE_ICON[n.type] || 'info'} className={`mt-0.5 text-lg ${TYPE_COLOR[n.type] || 'text-status-info-text'}`} />
        <div className="min-w-0 flex-1">
         <p className={`text-body-sm ${!n.is_read ? 'font-semibold' : ''} text-brand-dark dark:text-white`}>{n.title}</p>
         {n.message && <p className="mt-0.5 whitespace-pre-line text-body-xs text-ink-muted dark:text-dark-ink-muted">{n.message}</p>}
         <p className="mt-1 text-body-xs text-ink-muted dark:text-dark-ink-muted">{new Date(n.created_at).toLocaleString()}</p>
        </div>
        {!n.is_read && <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-brand" />}
       </button>
      ))}
     </div>
    </div>
   )}
  </div>
 );
}
