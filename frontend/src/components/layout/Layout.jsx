import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import AnnouncementBar from './AnnouncementBar.jsx';
import Breadcrumbs from '../ui/Breadcrumbs.jsx';
import useScrollToTop from '../../hooks/useScrollToTop.js';
import useSeoMeta from '../../hooks/useSeoMeta.js';
import { portalPaths } from '../../data/portal.js';

export default function Layout() {
 const { pathname } = useLocation();
 const mainRef = useRef(null);
 useScrollToTop();
 const isPortal = portalPaths.some((p) => pathname.startsWith(`/${p}`));
 // Only public routes have admin-managed SEO metadata — portal pages
 // (client/employee/admin/etc.) are login-gated, not indexed, and don't
 // have SEO records in the CMS.
 useSeoMeta(isPortal ? null : pathname);

 // Theme init/persistence is owned exclusively by ThemeProvider (see
 // context/ThemeContext.jsx) — do not re-read localStorage/prefers-color-scheme here.

 // Instant page switch — no fade delay
 useEffect(() => {
  const el = mainRef.current;
  if (el) {
   el.style.opacity = '1';
   el.style.transform = 'translateY(0)';
  }
 }, [pathname]);

 return (
  <div className="flex min-h-screen flex-col bg-surface-white dark:bg-dark-surface">
   {!isPortal && <Navbar />}
   <main ref={mainRef} className={`flex-1 ${isPortal ? '' : 'pt-20'}`}>
    {!isPortal && <AnnouncementBar />}
    {!isPortal && pathname !== '/' && (
     <div className="mx-auto max-w-container px-4 pt-4 sm:px-6 lg:px-10 xl:px-12">
      <Breadcrumbs />
     </div>
    )}
    <Outlet />
   </main>
   {!isPortal && <Footer />}
  </div>
 );
}
