export default function RowAction({ onClick, disabled, variant = 'primary', children }) {
 const styles = variant === 'primary'
  ? 'border-brand text-brand hover:bg-brand hover:text-white'
  : variant === 'danger'
   ? 'border-status-error-text text-status-error-text hover:bg-status-error-text hover:text-white'
   : 'border-outline-variant dark:border-dark-outline-variant text-ink-muted dark:text-dark-ink-muted hover:border-brand hover:text-brand';
 return (
  <button type="button" onClick={onClick} disabled={disabled}
   className={`inline-flex items-center justify-center rounded border px-3 py-1.5 font-label-caps text-label-caps uppercase transition-colors disabled:opacity-50 ${styles}`}>
   {children}
  </button>
 );
}