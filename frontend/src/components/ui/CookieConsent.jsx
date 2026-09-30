import { useState, useEffect, useCallback } from 'react';
import useFocusTrap from '../../hooks/useFocusTrap.js';

const STORAGE_KEY = 'coralswift.cookies';
const DEFAULT_PREFS = { essential: true, analytics: false, marketing: false };

export default function CookieConsent() {
 const [visible, setVisible] = useState(false);
 const [showSettings, setShowSettings] = useState(false);
 const [prefs, setPrefs] = useState(DEFAULT_PREFS);

 useEffect(() => {
  try {
   const stored = localStorage.getItem(STORAGE_KEY);
   if (!stored) {
    setVisible(true);
   }
  } catch {
   setVisible(true);
  }
 }, []);

 const storeAndHide = useCallback((data) => {
  try {
   localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
   /* localStorage not available */
  }
  setVisible(false);
  setShowSettings(false);
 }, []);

 const acceptAll = useCallback(() => {
  storeAndHide({ essential: true, analytics: true, marketing: true });
 }, [storeAndHide]);

 const rejectAll = useCallback(() => {
  storeAndHide({ essential: true, analytics: false, marketing: false });
 }, [storeAndHide]);

 const savePreferences = useCallback(() => {
  storeAndHide(prefs);
 }, [prefs, storeAndHide]);

 const modalRef = useFocusTrap(showSettings);

 if (!visible) return null;

 return (
  <>
   <div
    className="fixed inset-x-0 bottom-0 z-50 bg-brand-dark p-4 text-white sm:px-6 sm:py-stack-lg lg:px-10 xl:px-12 "
    role="region"
    aria-label="Cookie consent banner"
   >
    <p className="mx-auto mb-stack-md max-w-container text-body-sm">
     We use cookies to enhance your experience. By continuing to visit this site you agree to
     our use of cookies.
    </p>
    <div className="mx-auto flex max-w-container flex-wrap gap-3 sm:gap-4">
     <button
      onClick={acceptAll}
      className="rounded bg-white px-4 py-2 font-label-caps text-xs uppercase text-brand-dark transition-colors hover:bg-accent-cyan dark:bg-dark-surface dark:text-dark-brand sm:px-6 sm:text-label-caps"
     >
      Accept All
     </button>
     <button
      onClick={rejectAll}
      className="rounded border border-white/40 px-4 py-2 font-label-caps text-xs uppercase text-white transition-colors hover:bg-white/10 sm:px-6 sm:text-label-caps"
     >
      Reject All
     </button>
     <button
      onClick={() => setShowSettings(true)}
      className="font-label-caps text-xs uppercase text-accent-cyan underline transition-colors hover:text-white sm:text-label-caps"
     >
      Cookie Settings
     </button>
    </div>
   </div>

   {showSettings && (
    <div
     className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
     role="dialog"
     aria-modal="true"
     aria-labelledby="cookie-settings-title"
    >
     <div
      ref={modalRef}
      className="w-full max-w-sm rounded-lg bg-white p-stack-lg text-ink dark:bg-dark-surface dark:text-dark-ink"
     >
      <h3
       id="cookie-settings-title"
       className="mb-4 font-display text-headline-sm text-brand-dark dark:text-dark-brand"
      >
       Cookie Settings
      </h3>
      <div className="space-y-4">
       <label className="flex items-center justify-between py-2">
        <span className="text-body-md">Essential</span>
        <input type="checkbox" checked disabled className="accent-brand" />
       </label>
       <label className="flex items-center justify-between py-2">
        <span className="text-body-md">Analytics</span>
        <input
         type="checkbox"
         checked={prefs.analytics}
         onChange={(e) => setPrefs((p) => ({ ...p, analytics: e.target.checked }))}
         className="accent-brand"
        />
       </label>
       <label className="flex items-center justify-between py-2">
        <span className="text-body-md">Marketing</span>
        <input
         type="checkbox"
         checked={prefs.marketing}
         onChange={(e) => setPrefs((p) => ({ ...p, marketing: e.target.checked }))}
         className="accent-brand"
        />
       </label>
      </div>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
       <button
        onClick={savePreferences}
        className="flex-1 rounded bg-brand py-2.5 font-label-caps text-label-caps uppercase text-white transition-colors hover:bg-brand-dark"
       >
        Save Preferences
       </button>
       <button
        onClick={() => setShowSettings(false)}
        className="flex-1 rounded border border-outline-variant py-2.5 font-label-caps text-label-caps uppercase text-ink transition-colors hover:bg-surface-dim dark:border-dark-outline-variant dark:text-dark-ink dark:hover:bg-dark-surface-dim"
       >
        Cancel
       </button>
      </div>
     </div>
    </div>
   )}
  </>
 );
}
