const VARIANTS = {
 primary: 'bg-brand text-white hover:bg-brand-dark',
 inverse: 'bg-white text-brand hover:bg-accent-cyan-pale',
 outline: 'border border-outline-variant text-brand hover:border-brand',
 'outline-light': 'border border-white/40 text-white hover:bg-white/10',
};

const SIZES = {
 md: 'h-11 px-6 text-label-caps',
 lg: 'h-[52px] px-8 text-label-caps',
};

/**
 * Shared CTA button. Renders a <button> by default, or an <a>/router <Link>
 * when `as` is supplied (e.g. `as={Link} to="/services"`).
 *
 * When `loading` is true the button is disabled, shows a spinner, and
 * announces itself as busy to assistive technology via aria-busy. This
 * prevents duplicate mutations from accidental rapid clicks.
 */
export default function Button({
 as: Tag = 'button',
 variant = 'primary',
 size = 'lg',
 loading = false,
 className = '',
 icon,
 children,
 disabled,
 ...rest
}) {
 const isDisabled = disabled || loading;
 return (
  <Tag
   className={`inline-flex items-center justify-center gap-2 rounded font-stat font-semibold uppercase tracking-wide transition-all active:scale-95 ${VARIANTS[variant]} ${SIZES[size]} ${loading ? 'cursor-wait' : ''} ${className}`}
   disabled={isDisabled}
   aria-busy={loading || undefined}
   aria-disabled={isDisabled || undefined}
   {...rest}
  >
   {loading && (
    <svg
     className="size-4 animate-spin"
     viewBox="0 0 24 24"
     fill="none"
     aria-hidden="true"
    >
     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
   )}
   {children}
   {!loading && icon}
  </Tag>
 );
}
