import { Link } from 'react-router-dom';
import Reveal from '../ui/Reveal.jsx';
import Icon from '../ui/Icon.jsx';

export default function CollaborateBanner() {
  return (
    <section className="bg-white py-16 sm:py-20 lg:py-24 dark:bg-dark-surface">
      <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-10 xl:px-12">
        <Reveal from="up">
          <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl bg-[#0B0F19] p-10 text-center shadow-2xl sm:p-14 lg:p-16 border border-slate-800/80">
            <h2 className="mb-4 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Collaborate With Principal Engineers
            </h2>
            <p className="mx-auto mb-8 max-w-2xl font-body text-body-lg text-slate-300 leading-relaxed">
              Discuss your technical roadmap, legacy bottlenecks, or AI initiative directly with our architecture leadership team.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#FF5500] via-[#E11D48] to-[#8B5CF6] px-8 py-3.5 font-display text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition-all duration-300 hover:scale-105 hover:shadow-orange-500/35"
            >
              <span>Request Executive Briefing</span>
              <Icon name="arrow_forward" className="text-lg" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
