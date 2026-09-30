import { Link, useLocation } from 'react-router-dom';

function formatLabel(segment) {
 return segment
  .split('-')
  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
  .join(' ');
}

export default function Breadcrumbs() {
 const { pathname } = useLocation();
 const segments = pathname.split('/').filter(Boolean);

 if (segments.length === 0) return null;

 return (
  <nav aria-label="Breadcrumb" itemScope itemType="https://schema.org/BreadcrumbList">
   <ol className="flex items-center gap-2 text-body-sm text-ink-muted dark:text-dark-ink-muted">
    <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
     <Link to="/" itemProp="item" className="transition-colors hover:text-accent-cyan">
      <span itemProp="name">Home</span>
     </Link>
     <meta itemProp="position" content="1" />
    </li>
    {segments.map((segment, index) => {
     const isLast = index === segments.length - 1;
     const href = '/' + segments.slice(0, index + 1).join('/');
     const position = index + 2;
     return (
      <li key={segment} className="flex items-center gap-2" itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
       <span className="text-ink-muted/50 dark:text-dark-ink-muted/50">&gt;</span>
       {isLast ? (
        <span itemProp="name" className="font-semibold text-brand-dark dark:text-dark-brand">{formatLabel(segment)}</span>
       ) : (
        <Link to={href} itemProp="item" className="transition-colors hover:text-accent-cyan">
         <span itemProp="name">{formatLabel(segment)}</span>
        </Link>
       )}
       <meta itemProp="position" content={String(position)} />
      </li>
     );
    })}
   </ol>
  </nav>
 );
}
