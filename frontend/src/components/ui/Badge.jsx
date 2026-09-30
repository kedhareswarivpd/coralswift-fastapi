export default function Badge({ children, className = '' }) {
 return (
  <span
   className={`inline-block rounded-full px-3 py-1 font-label-caps text-label-caps uppercase ${className}`}
  >
   {children}
  </span>
 );
}
