import { useCallback, useState } from 'react';
import { NavLink } from 'react-router-dom';
import NavbarDropdown from './NavbarDropdown.jsx';
import { navigationConfig } from '../../data/navigationConfig.js';

/**
 * Desktop horizontal navigation. Items with `children` render as
 * dropdown triggers; plain items render as NavLink. Only one dropdown
 * may be open at a time.
 */
export default function DesktopNavigation() {
 const [openIndex, setOpenIndex] = useState(null);

 const close = useCallback(() => setOpenIndex(null), []);

 return (
  <nav
   className="flex items-center justify-center gap-2 lg:gap-4 xl:gap-6"
   aria-label="Main navigation"
  >
   {navigationConfig.map((item, index) => {
    if (item.children) {
     return (
      <NavbarDropdown
       key={item.label}
       label={item.label}
       items={item.children}
       isOpen={openIndex === index}
       onOpen={() => setOpenIndex(index)}
       onClose={close}
      />
     );
    }

    return (
     <NavLink
      key={item.to}
      to={item.to}
      end={item.to === '/'}
      className={({ isActive }) =>
       `px-3 py-2 text-label-caps uppercase font-medium tracking-wide transition-colors duration-200 ${
        isActive
         ? 'text-brand border-b-2 border-brand dark:text-dark-brand dark:border-dark-brand'
         : 'text-ink-muted border-b-2 border-transparent hover:text-brand dark:text-white dark:hover:text-dark-brand'
       }`
      }
     >
      {item.label}
     </NavLink>
    );
   })}
  </nav>
 );
}
