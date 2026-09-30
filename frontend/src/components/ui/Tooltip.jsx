/**
 * Lightweight tooltip that appears on hover and keyboard focus.
 * Uses pure CSS positioning — no external dependencies.
 *
 * The wrapper element gets `group` so that Tailwind's group-hover can
 * toggle the tooltip. The child automatically receives `title` for
 * native browser tooltip / screen-reader support as a fallback.
 *
 * Usage:
 *  <Tooltip content="Edit item">
 *   <button><Icon name="edit" /></button>
 *  </Tooltip>
 */
export default function Tooltip({ children, content, position = 'top', className = '' }) {
 if (!content) return children;

 const positionClasses = {
  top: 'bottom-full left-1/2 mb-2 -translate-x-1/2',
  bottom: 'top-full left-1/2 mt-2 -translate-x-1/2',
  left: 'right-full top-1/2 mr-2 -translate-y-1/2',
  right: 'left-full top-1/2 ml-2 -translate-y-1/2',
 };

 return (
  <span className={`group relative inline-flex ${className}`} title={content}>
   {children}
   <span
    role="tooltip"
    aria-hidden="true"
    className={`pointer-events-none absolute z-50 whitespace-nowrap rounded bg-ink px-2.5 py-1 text-body-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 dark:bg-white dark:text-ink ${positionClasses[position]}`}
   >
    {content}
   </span>
  </span>
 );
}
