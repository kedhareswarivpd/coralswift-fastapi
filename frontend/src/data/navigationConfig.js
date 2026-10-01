/**
 * Centralized navigation configuration.
 *
 * Both DesktopNavigation and MobileNavigation consume this single source
 * of truth — they can never drift out of sync.  Each top-level item is
 * either a plain link or a dropdown group whose `children` are the
 * sub-links.  `end: true` on a NavLink match means "exact match only"
 * (e.g. `/services` should not highlight when on `/services/cloud`).
 */

export const navigationConfig = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  {
    label: 'Services',
    children: [
      { label: 'All Services', to: '/services', end: true },
      { label: 'Software Development', to: '/services?category=software-development' },
      { label: 'Cloud & Infrastructure', to: '/services?category=cloud-infrastructure' },
      { label: 'AI & Automation', to: '/services?category=ai-solutions' },
      { label: 'Cybersecurity', to: '/services?category=cyber-security' },
      { label: 'Data & Analytics', to: '/services?category=data-analytics' },
    ],
  },
  { label: 'Industries', to: '/industries' },
  { label: 'Case Studies', to: '/case-studies' },
  { label: 'Careers', to: '/careers' },
  { label: 'Contact', to: '/contact' },
];

