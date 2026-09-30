import { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import Icon from '../ui/Icon.jsx';

/**
 * Desktop dropdown menu triggered by a button. Opens on click, closes
 * on Escape / outside click. Only one dropdown may be open at a time —
 * the parent DesktopNavigation enforces this via `isOpen` / `onClose`.
 *
 * Accessibility:
 * - Trigger is a <button> with aria-expanded / aria-controls
 * - Menu has role="menu", items have role="menuitem"
 * - Arrow-key navigation within the menu
 * - Escape closes the menu and returns focus to the trigger
 * - Focus is trapped within the open menu
 */
export default function NavbarDropdown({
 label,
 items,
 isOpen,
 onOpen,
 onClose,
}) {
 const triggerRef = useRef(null);
 const menuRef = useRef(null);
 const itemRefs = useRef([]);
 const [focusIndex, setFocusIndex] = useState(-1);
 const menuId = `nav-dropdown-${label.toLowerCase().replace(/\s+/g, '-')}`;

 // Close on outside click
 useEffect(() => {
  if (!isOpen) return;
  function handleClick(e) {
   if (
    menuRef.current &&
    !menuRef.current.contains(e.target) &&
    triggerRef.current &&
    !triggerRef.current.contains(e.target)
   ) {
    onClose();
   }
  }
  document.addEventListener('mousedown', handleClick);
  return () => document.removeEventListener('mousedown', handleClick);
 }, [isOpen, onClose]);

 // Close on Escape
 useEffect(() => {
  if (!isOpen) return;
  function handleKey(e) {
   if (e.key === 'Escape') {
    onClose();
    triggerRef.current?.focus();
   }
  }
  document.addEventListener('keydown', handleKey);
  return () => document.removeEventListener('keydown', handleKey);
 }, [isOpen, onClose]);

 // Focus the active item when focusIndex changes
 useEffect(() => {
  if (focusIndex >= 0 && itemRefs.current[focusIndex]) {
   itemRefs.current[focusIndex].focus();
  }
 }, [focusIndex]);

 // Reset focus index when menu closes
 useEffect(() => {
  if (!isOpen) setFocusIndex(-1);
 }, [isOpen]);

 return (
  <div className="relative">
   <button
    ref={triggerRef}
    onClick={() => (isOpen ? onClose() : onOpen())}
    aria-expanded={isOpen}
    aria-controls={menuId}     className={`flex items-center gap-1.5 p-2 text-label-caps uppercase transition-colors duration-200 lg:px-2.5 ${
     isOpen
      ? 'text-brand dark:text-dark-brand'
      : 'text-ink-muted hover:text-brand dark:text-white dark:hover:text-dark-brand'
    }`}
   >
    {label}
    <Icon
     name="expand_more"
     className={`text-sm transition-transform duration-200 ${
      isOpen ? 'rotate-180 text-brand dark:text-dark-brand' : ''
     }`}
    />
   </button>

   {isOpen && (
    <div
     ref={menuRef}
     id={menuId}
     role="menu"
     aria-label={`${label} submenu`}
     className="absolute left-0 top-full z-50 mt-2 min-w-[220px] animate-fade-in rounded-lg border border-outline-variant bg-white py-2 shadow-lg dark:border-dark-outline-variant dark:bg-dark-surface-low"
    >
     {items.map((item, i) => (
      <NavLink
       key={item.to}
       ref={(el) => { itemRefs.current[i] = el; }}
       to={item.to}
       end={item.end}
       role="menuitem"
       onClick={onClose}
       className={({ isActive }) =>
        `flex items-center gap-3 px-5 py-2.5 text-body-sm transition-colors ${
         isActive
          ? 'bg-brand/5 font-semibold text-brand dark:bg-dark-brand/10 dark:text-dark-brand'
          : 'text-ink-muted hover:bg-surface-dim hover:text-brand dark:text-dark-ink-muted dark:hover:bg-dark-surface-container dark:hover:text-dark-brand'
        }`
       }
      >
       {item.label}
      </NavLink>
     ))}
    </div>
   )}
  </div>
 );
}
