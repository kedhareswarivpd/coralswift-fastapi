import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import NavbarLogo from './NavbarLogo.jsx';
import DesktopNavigation from './DesktopNavigation.jsx';
import MobileNavigation from './MobileNavigation.jsx';
import Icon from '../ui/Icon.jsx';

export default function Navbar() {
 const [scrolled, setScrolled] = useState(false);
 const [mobileOpen, setMobileOpen] = useState(false);

 useEffect(() => {
  const onScroll = () => setScrolled(window.scrollY > 20);
  window.addEventListener('scroll', onScroll, { passive: true });
  return () => window.removeEventListener('scroll', onScroll);
 }, []);

 const closeMobile = useCallback(() => setMobileOpen(false), []);

 return (
  <>
   <header
    className={`fixed top-0 z-50 w-full border-b transition-all duration-300 ${
     scrolled
      ? 'h-16 border-outline-variant/60 bg-white/95 shadow-sm backdrop-blur-md dark:border-dark-outline-variant/60 dark:bg-dark-surface/95'
      : 'h-20 border-outline-variant bg-white dark:border-dark-outline-variant dark:bg-dark-surface'
    }`}
   >
    <div className="mx-auto flex h-full max-w-container items-center justify-between px-4 sm:px-6 lg:px-10 xl:px-12">
     {/* Left: Logo + Desktop Nav */}
     <div className="flex items-center gap-6 lg:gap-8 xl:gap-10">
      <NavbarLogo compact={scrolled} />
      <DesktopNavigation />
     </div>

     {/* Right: Actions */}
     <div className="flex items-center gap-3">
      <Link
       to="/login"
       className="hidden rounded-md bg-brand px-5 py-2 text-label-caps font-semibold uppercase text-white transition-colors hover:bg-brand-dark dark:bg-dark-brand dark:hover:bg-brand lg:inline-block"
      >
       Login
      </Link>
      <button
       onClick={() => setMobileOpen((o) => !o)}
       aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
       aria-expanded={mobileOpen}
       className="flex size-10 items-center justify-center rounded-lg text-brand transition-colors hover:bg-surface-dim dark:text-dark-brand dark:hover:bg-dark-surface-container lg:hidden"
      >
       <Icon name={mobileOpen ? 'close' : 'menu'} className="text-xl" />
      </button>
     </div>
    </div>
   </header>

   {/* Mobile Navigation */}
   <MobileNavigation isOpen={mobileOpen} onClose={closeMobile} />

   {/* Overlay behind mobile menu */}
   {mobileOpen && (
    <div
     className="fixed inset-0 z-40 bg-black/30 lg:hidden"
     onClick={closeMobile}
     aria-hidden="true"
    />
   )}
  </>
 );
}
