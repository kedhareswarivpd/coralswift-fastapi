import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import Icon from '../ui/Icon.jsx';
import { navigationConfig } from '../../data/navigationConfig.js';


/**
 * Full-screen mobile navigation panel. Opens with smooth transition,
 * uses accordion for nested items, closes on route change, locks
 * background scroll while open.
 *
 * Accessibility:
 * - Panel has role="dialog" and aria-label
 * - Focus is trapped inside the panel
 * - Escape closes the panel
 * - All interactive elements have proper aria attributes
 */
export default function MobileNavigation({ isOpen, onClose }) {
 const { pathname } = useLocation();
 const panelRef = useRef(null);
 const closeRef = useRef(null);
 const [expandedGroup, setExpandedGroup] = useState(null);

 // Close on route change
 useEffect(() => {
  onClose();
  setExpandedGroup(null);
 }, [pathname, onClose]);

 // Lock background scroll
 useEffect(() => {
  if (isOpen) {
   document.body.style.overflow = 'hidden';
  } else {
   document.body.style.overflow = '';
  }
  return () => { document.body.style.overflow = ''; };
 }, [isOpen]);

 // Focus trap
 useEffect(() => {
  if (!isOpen) return;
  closeRef.current?.focus();

  function handleTab(e) {
   if (e.key !== 'Tab' || !panelRef.current) return;
   const focusable = panelRef.current.querySelectorAll(
    'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
   );
   if (focusable.length === 0) return;
   const first = focusable[0];
   const last = focusable[focusable.length - 1];
   if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
   } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
   }
  }

  function handleEscape(e) {
   if (e.key === 'Escape') onClose();
  }

  document.addEventListener('keydown', handleTab);
  document.addEventListener('keydown', handleEscape);
  return () => {
   document.removeEventListener('keydown', handleTab);
   document.removeEventListener('keydown', handleEscape);
  };
 }, [isOpen, onClose]);

 const toggleGroup = useCallback(
  (label) => setExpandedGroup((prev) => (prev === label ? null : label)),
  [],
 );

 return (
  <div
   ref={panelRef}
   role="dialog"
   aria-modal="true"
   aria-label="Mobile navigation"
   className={`fixed inset-0 z-50 flex flex-col bg-white transition-transform duration-300 ease-in-out dark:bg-dark-surface lg:hidden ${
    isOpen ? 'translate-x-0' : 'pointer-events-none translate-x-full'
   }`}
  >
   {/* Header */}
   <div className="flex items-center justify-between border-b border-outline-variant p-4 dark:border-dark-outline-variant">
    <Link to="/" onClick={onClose} className="flex items-center gap-2.5">
     <img src="/logo-icon.png" alt="CoralSwift Emblem" className="h-8 w-auto object-contain" />
     <div className="flex flex-col leading-none">
      <span className="font-display text-lg font-bold text-slate-900 dark:text-white">
       Coral<span className="bg-gradient-to-r from-[#FF5500] via-[#E11D48] to-[#8B5CF6] bg-clip-text text-transparent">Swift</span>
      </span>
      <span className="text-[8px] font-semibold tracking-[0.2em] uppercase text-slate-500 dark:text-slate-400">
       Technologies
      </span>
     </div>
    </Link>
    <button
     ref={closeRef}
     onClick={onClose}
     aria-label="Close navigation menu"
     className="flex size-10 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-surface-dim dark:text-dark-ink-muted dark:hover:bg-dark-surface-container"
    >
     <Icon name="close" className="text-xl" />
    </button>
   </div>

   {/* Nav items */}
   <nav className="flex-1 overflow-y-auto p-4">
    {navigationConfig.map((item) => {
     if (item.children) {
      const isExpanded = expandedGroup === item.label;
      return (
       <div key={item.label} className="border-b border-outline-variant/50 dark:border-dark-outline-variant/50">
        <button
         onClick={() => toggleGroup(item.label)}
         aria-expanded={isExpanded}
         className="flex w-full items-center justify-between py-3.5 text-left text-body-md font-semibold text-ink dark:text-dark-ink"
        >
         {item.label}
         <Icon
          name="expand_more"
          className={`text-lg transition-transform duration-200 ${
           isExpanded ? 'rotate-180' : ''
          }`}
         />
        </button>
        <div
         className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-96 pb-3' : 'max-h-0'
         }`}
         role="group"
         aria-label={`${item.label} submenu`}
        >
         {item.children.map((child) => (
          <NavLink
           key={child.to}
           to={child.to}
           end={child.end}
           onClick={onClose}
           className={({ isActive }) =>
            `block rounded-lg px-4 py-2.5 text-body-sm transition-colors ${
             isActive
              ? 'bg-brand/5 font-semibold text-brand dark:bg-dark-brand/10 dark:text-dark-brand'
              : 'text-ink-muted hover:bg-surface-dim hover:text-brand dark:text-dark-ink-muted dark:hover:bg-dark-surface-container dark:hover:text-dark-brand'
            }`
           }
          >
           {child.label}
          </NavLink>
         ))}
        </div>
       </div>
      );
     }

     return (
      <NavLink
       key={item.to}
       to={item.to}
       end={item.to === '/'}
       onClick={onClose}
       className={({ isActive }) =>
        `block border-b border-outline-variant/50 py-3.5 text-body-md font-semibold transition-colors dark:border-dark-outline-variant/50 ${
         isActive
          ? 'text-brand dark:text-dark-brand'
          : 'text-ink hover:text-brand dark:text-dark-ink dark:hover:text-dark-brand'
        }`
       }
      >
       {item.label}
      </NavLink>
     );
    })}
   </nav>

   {/* Footer actions */}
   <div className="border-t border-outline-variant p-4 dark:border-dark-outline-variant">
    <div className="flex items-center justify-center">
     <NavLink
      to="/login"
      onClick={onClose}
      className="w-full text-center rounded-lg bg-brand px-6 py-3 text-body-sm font-semibold text-white transition-colors hover:bg-brand-dark dark:bg-dark-brand"
     >
      Login
     </NavLink>
    </div>
   </div>

  </div>
 );
}
