import { Link } from 'react-router-dom';
import Icon from '../ui/Icon.jsx';

const SERVICES_LINKS = [
  { label: 'Cloud Modernization', to: '/services/cloud-architecture-modernization' },
  { label: 'Applied AI & LLMs', to: '/services/ai-applied-ml' },
  { label: 'DevSecOps & Platform', to: '/services/enterprise-devsecops' },
  { label: 'Distributed Systems', to: '/services/distributed-systems' },
  { label: 'Data Engineering', to: '/services/enterprise-data-engineering' },
  { label: 'Zero-Trust Defense', to: '/services/cybersecurity-zero-trust' },
];

const COMPANY_LINKS = [
  { label: 'About Us', to: '/about' },
  { label: 'Case Studies', to: '/case-studies' },
  { label: 'Careers', to: '/careers' },
  { label: 'Contact', to: '/contact' },
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Terms of Service', to: '/terms' },
];

export default function Footer() {
  return (
    <footer className="relative w-full border-t border-slate-800/80 bg-[#070B14] text-slate-400">
      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          
          {/* Column 1: Brand Info (Spans 5 cols on lg) */}
          <div className="lg:col-span-5">
            {/* White Logo Badge Card */}
            <Link
              to="/"
              className="mb-4 inline-flex items-center gap-2.5 rounded-2xl bg-white px-4 py-2.5 shadow-md transition-transform hover:scale-105"
            >
              <img
                src="/logo-icon.png"
                alt="CoralSwift Emblem"
                className="h-8 w-auto object-contain"
              />
              <div className="flex flex-col leading-none">
                <span className="font-display text-xl font-bold tracking-tight text-slate-900">
                  Coral<span className="bg-gradient-to-r from-[#FF5500] via-[#E11D48] to-[#8B5CF6] bg-clip-text text-transparent">Swift</span>
                </span>
                <span className="text-[9px] font-semibold tracking-[0.25em] uppercase text-slate-500 -mt-0.5">
                  Technologies
                </span>
              </div>
            </Link>

            {/* Officially Partnered Badge */}
            <div className="mb-4 flex items-center gap-2 text-xs text-slate-400">
              <span>Officially Partnered by</span>
              <span className="rounded-md bg-white/10 px-2.5 py-1 font-semibold text-slate-200">
                VPD Technologies
              </span>
            </div>

            {/* Paragraph Bio */}
            <p className="mb-6 max-w-sm text-sm leading-relaxed text-slate-400">
              Next-generation enterprise software engineering consultancy. We engineer mission-critical cloud architectures, applied AI pipelines, and high-throughput distributed systems for global leaders.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3">
              <a
                href="https://www.linkedin.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="flex size-10 items-center justify-center rounded-xl border border-slate-800 bg-white/5 text-slate-400 transition-all hover:border-[#FF5500]/50 hover:bg-[#FF5500]/10 hover:text-white"
              >
                <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
              <a
                href="https://github.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="flex size-10 items-center justify-center rounded-xl border border-slate-800 bg-white/5 text-slate-400 transition-all hover:border-[#FF5500]/50 hover:bg-[#FF5500]/10 hover:text-white"
              >
                <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
              <a
                href="https://twitter.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="Twitter"
                className="flex size-10 items-center justify-center rounded-xl border border-slate-800 bg-white/5 text-slate-400 transition-all hover:border-[#FF5500]/50 hover:bg-[#FF5500]/10 hover:text-white"
              >
                <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Software Services (2 cols on lg) */}
          <div className="lg:col-span-2">
            <h4 className="mb-4 font-display text-xs font-bold uppercase tracking-widest text-white">
              SOFTWARE SERVICES
            </h4>
            <ul className="space-y-3 text-sm">
              {SERVICES_LINKS.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    className="transition-colors hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Company (2 cols on lg) */}
          <div className="lg:col-span-2">
            <h4 className="mb-4 font-display text-xs font-bold uppercase tracking-widest text-white">
              COMPANY
            </h4>
            <ul className="space-y-3 text-sm">
              {COMPANY_LINKS.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    className="transition-colors hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Corporate Office (3 cols on lg) */}
          <div className="lg:col-span-3">
            <h4 className="mb-4 font-display text-xs font-bold uppercase tracking-widest text-white">
              CORPORATE OFFICE
            </h4>
            
            {/* Address */}
            <div className="mb-3.5 flex items-start gap-2.5 text-sm text-slate-300">
              <Icon name="location_on" className="mt-0.5 shrink-0 text-base text-[#FF5500]" />
              <div className="leading-snug">
                <p>30 N Gould St Ste #62633</p>
                <p>Sheridan, WY 82801</p>
                <p>United States</p>
              </div>
            </div>

            {/* Email */}
            <div className="mb-2.5 flex items-center gap-2.5 text-sm text-slate-300">
              <Icon name="mail" className="shrink-0 text-base text-[#FF5500]" />
              <a href="mailto:info@coralswift.com" className="transition-colors hover:text-white">
                info@coralswift.com
              </a>
            </div>

            {/* Phone */}
            <div className="mb-4 flex items-center gap-2.5 text-sm text-slate-300">
              <Icon name="call" className="shrink-0 text-base text-[#FF5500]" />
              <a href="tel:+13072165154" className="transition-colors hover:text-white">
                +1 (307) 216-5154
              </a>
            </div>

            {/* Status Operational Badge */}
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-medium text-emerald-400">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex size-2 rounded-full bg-emerald-500"></span>
              </span>
              All Systems Operational
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-slate-800/80 pt-8 text-xs text-slate-500 sm:flex-row">
          <p>
            &copy; 2026 CoralSwift Technologies Inc. &bull; Officially Partnered by VPD Technologies. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="transition-colors hover:text-slate-300">Privacy</Link>
            <Link to="/terms" className="transition-colors hover:text-slate-300">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
