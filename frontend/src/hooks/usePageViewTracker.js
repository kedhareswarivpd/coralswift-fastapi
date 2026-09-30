import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../api/admin.js';

export default function usePageViewTracker() {
  const { pathname } = useLocation();
  const lastPath = useRef('');

  useEffect(() => {
    if (pathname === lastPath.current) return;
    lastPath.current = pathname;
    trackPageView({ path: pathname }).catch((e) => console.debug('[analytics]', e));
  }, [pathname]);
}
