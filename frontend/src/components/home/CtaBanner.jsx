import { Link } from 'react-router-dom';
import Icon from '../ui/Icon.jsx';
import Reveal from '../ui/Reveal.jsx';

export default function CtaBanner() {
  return (
    <section className="relative overflow-hidden bg-[#070B14] px-4 py-20 text-white sm:px-6 lg:px-10 xl:px-12">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(255,85,0,0.15),transparent)]" />
      
      <div className="relative mx-auto max-w-5xl text-center">
        <Reveal from="up">
          <h2 className="mb-4 font-display text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
            Ready to Modernize Your Enterprise Platform?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-base text-slate-300 sm:text-lg">
            Schedule a confidential architecture briefing with our principal systems engineers.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/contact"
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#FF5500] via-[#E11D48] to-[#8B5CF6] px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition-all hover:scale-105 hover:shadow-orange-500/30"
            >
              <span>Start Technical Consultation</span>
              <Icon name="arrow_forward" className="text-base transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              to="/services"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-slate-900 shadow-md transition-all hover:bg-slate-100 hover:scale-105"
            >
              Explore Service Catalogue
            </Link>
          </div>

          {/* Trust Guarantees */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-slate-400 sm:gap-10">
            <div className="flex items-center gap-2">
              <Icon name="verified_user" className="text-base text-emerald-400" />
              <span>NDA & Strict Confidentiality</span>
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
        </Reveal>
      </div>
    </section>
  );
}
