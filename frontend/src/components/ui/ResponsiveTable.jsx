/**
 * ResponsiveTable — wraps a native <table> in a scrollable container on
 * tablet/mobile so wide tables don't break the page layout. Also applies
 * a CSS card-layout transform on small screens via the `data-label`
 * attribute pattern so each column gets a visible label.
 *
 * Usage:
 *  <ResponsiveTable>
 *   <table>
 *    <thead>…</thead>
 *    <tbody>
 *     <tr>
 *      <td data-label="Name">…</td>
 *      <td data-label="Status">…</td>
 *     </tr>
 *    </tbody>
 *   </table>
 *  </ResponsiveTable>
 *
 * For tables that use `data-label` on every <td>, the card layout activates
 * automatically below `sm` (640px). Without `data-label`, the table
 * gracefully scroll-overflow on small screens instead of overflowing the page.
 */

export default function ResponsiveTable({ children, className = '' }) {
 return (
  <div
   className={`responsive-table-container overflow-x-auto rounded-lg border border-outline-variant bg-white dark:border-dark-outline-variant dark:bg-dark-surface ${className}`}
  >
   {children}
  </div>
 );
}

/**
 * Helper: renders a portal-style table with proper responsive behavior.
 * Each column definition is `{ key, label, render?, className? }`.
 */
export function PortalTable({ columns, rows, emptyMessage = 'No data available.', onRowClick }) {
 if (rows.length === 0) {
  return (
   <div className="rounded-lg border border-outline-variant bg-white p-8 text-center dark:border-dark-outline-variant dark:bg-dark-surface">
    <p className="text-body-md text-ink-muted dark:text-white/60">{emptyMessage}</p>
   </div>
  );
 }

 return (
  <ResponsiveTable>
   <table className="w-full text-left">
    <thead className="bg-surface-container font-label-caps text-label-caps uppercase text-ink-muted dark:bg-dark-surface-container dark:text-dark-ink-muted">
     <tr>
      {columns.map((col) => (
       <th key={col.key} scope="col" className={`px-stack-lg py-4 ${col.headerClassName ?? ''}`}>
        {col.label}
       </th>
      ))}
     </tr>
    </thead>
    <tbody className="divide-y divide-outline-variant dark:divide-dark-outline-variant">
     {rows.map((row, idx) => (
      <tr
       key={row.id ?? idx}
       onClick={onRowClick ? () => onRowClick(row) : undefined}
       className={`transition-colors hover:bg-surface-low dark:hover:bg-dark-surface-low ${onRowClick ? 'cursor-pointer' : ''}`}
      >
       {columns.map((col) => (
        <td
         key={col.key}
         data-label={col.label}
         className={`px-stack-lg py-4 ${col.className ?? ''}`}
        >
         {col.render ? col.render(row[col.key], row) : row[col.key]}
        </td>
       ))}
      </tr>
     ))}
    </tbody>
   </table>
  </ResponsiveTable>
 );
}
