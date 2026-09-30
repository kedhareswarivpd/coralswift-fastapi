import { Link } from 'react-router-dom';
import Icon from '../ui/Icon.jsx';
import Reveal from '../ui/Reveal.jsx';

export default function CtaBanner() {
  return (
    <section className="bg-slate-50/80 px-4 py-16 dark:bg-[#070B14] sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Reveal from="zoom">
          {/* Floating Dark Card Container matching coralswift.com */}
          <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-800 bg-[#0D1322] px-6 py-14 text-center shadow-2xl sm:px-12 sm:py-20 lg:px-16">
            {/* Ambient Radial Top Glow */}
            <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 size-96 rounded-full bg-gradient-to-b from-[#FF5500]/20 via-[#8B5CF6]/10 to-transparent blur-3xl" />

            <div className="relative z-10">
              {/* Eyebrow Pill */}
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1.5 text-xs font-semibold text-orange-400 backdrop-blur-sm">
                <span className="text-amber-400">✨</span>
                <span>Let&apos;s Build Something Resilient Together</span>
              </div>

              {/* Main Headline */}
              <h2 className="mx-auto mb-5 max-w-4xl font-display text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Ready to Modernize Your Enterprise Platform?
              </h2>

              {/* Subhead Description */}
              <p className="mx-auto mb-10 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
                Schedule a confidential architecture briefing with our principal systems engineers. We will review your topology and provide an actionable blueprint.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link
                  to="/contact"
                  className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#FF5500] via-[#E11D48] to-[#8B5CF6] px-8 py-3.5 text-sm font-bold text-white shadow-xl shadow-orange-500/25 transition-all duration-300 hover:scale-105 hover:shadow-orange-500/35 sm:text-base"
                >
                  <span>Start Technical Consultation</span>
                  <Icon name="arrow_forward" className="text-base transition-transform duration-300 group-hover:translate-x-1.5" />
                </Link>
                <Link
                  to="/services"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-bold text-slate-900 shadow-lg transition-all duration-300 hover:bg-slate-100 hover:scale-105 sm:text-base"
                >
                  Explore Service Catalogue
                </Link>
              </div>

              {/* Trust Features Row */}
              <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-slate-400 sm:gap-10 sm:text-sm">
                <div className="flex items-center gap-2">
                  <Icon name="verified_user" className="text-base text-emerald-400" />
                  <span>NDA &amp; Strict Confidentiality</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="mail" className="text-base text-orange-400" />
                  <span>Response within 1 business day</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="engineering" className="text-base text-indigo-400" />
                  <span>Direct Principal Access</span>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
