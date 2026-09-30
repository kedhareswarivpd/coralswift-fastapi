import { createContext, useContext, useState, useCallback, useRef } from 'react';
import Icon from '../components/ui/Icon.jsx';

const ToastContext = createContext(null);

const TOAST_DURATION = 3500;

export function ToastProvider({ children }) {
 const [toasts, setToasts] = useState([]);
 const idRef = useRef(0);

 const remove = useCallback((id) => {
  setToasts((prev) => prev.filter((t) => t.id !== id));
 }, []);

 const toast = useCallback(
  (message, type = 'success') => {
   const id = ++idRef.current;
   setToasts((prev) => [...prev, { id, message, type }]);
   setTimeout(() => remove(id), TOAST_DURATION);
   return id;
  },
  [remove],
 );

 return (
  <ToastContext.Provider value={toast}>
   {children}
   {/* Global toast stack — always rendered, positioned bottom-right */}
   <div className="pointer-events-none fixed bottom-6 right-6 z-50 flex max-w-sm flex-col gap-2" aria-live="polite" aria-atomic="false">
    {toasts.map((t) => (
     <div
      key={t.id}
      onClick={() => remove(t.id)}
      role="status"
      className={`pointer-events-auto flex animate-fade-in cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-body-sm font-medium shadow-lg transition-opacity ${
       t.type === 'success'
        ? 'bg-status-success-bg text-status-success-text'
        : t.type === 'warning'
         ? 'bg-status-warning-bg text-status-warning-text'
         : 'bg-status-error-bg text-status-error-text'
      }`}
     >
      <Icon
       name={t.type === 'success' ? 'check_circle' : t.type === 'warning' ? 'warning' : 'error'}
       className="flex-shrink-0 text-lg"
      />
      <span>{t.message}</span>
     </div>
    ))}
   </div>
  </ToastContext.Provider>
 );
}

/**
 * Access the global toast function.
 *
 *  const toast = useToast();
 *  toast('Saved successfully');
 *  toast('Something broke', 'error');
 */
export function useToast() {
 const ctx = useContext(ToastContext);
 // Return a no-op if used outside a provider (e.g. in tests)
 return ctx ?? (() => {});
}
