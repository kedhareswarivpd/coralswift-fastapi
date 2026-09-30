import { Link } from 'react-router-dom';
import Icon from '../components/ui/Icon.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';

const QUICK_LINKS = [
 { to: '/services', label: 'Services' },
 { to: '/solutions', label: 'Solutions' },
 { to: '/about', label: 'About Us' },
 { to: '/contact', label: 'Contact' },
 { to: '/blog', label: 'Blog' },
 { to: '/faq', label: 'FAQ' },
];

export default function NotFound() {
 useDocumentTitle('Page Not Found | CoralSwift Technologies');
 return (
  <div className="flex min-h-screen items-center justify-center bg-surface-container px-4 dark:bg-dark-surface-container sm:px-6 lg:px-10 xl:px-12">
   <div className="max-w-lg text-center">
    <p className="mb-4 font-stat text-stat-lg text-brand">404</p>
    <h1 className="mb-4 font-display text-display-md text-brand-dark dark:text-dark-brand">Page Not Found</h1>
    <p className="mb-8 text-body-md text-ink-muted dark:text-dark-ink-muted">
     The page you&apos;re looking for doesn&apos;t exist or has been moved. Please check the URL or use
     the links below to find what you need.
    </p>
    <div className="mb-10 flex flex-wrap justify-center gap-3">
     {QUICK_LINKS.map((link) => (
      <Link
       key={link.to}
       to={link.to}
       className="text-body-sm text-brand underline underline-offset-2 hover:text-brand-dark"
      >
       {link.label}
      </Link>
     ))}
    </div>
    <Link
     to="/"
     className="inline-flex items-center gap-2 rounded-lg bg-brand px-6 py-3 font-label-caps text-label-caps uppercase text-white transition-colors hover:bg-brand-dark"
    >
     <Icon name="arrow_back" /> Back to Home
    </Link>
   </div>
  </div>
 );
}
