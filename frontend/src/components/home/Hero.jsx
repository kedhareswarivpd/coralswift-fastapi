import { Link } from 'react-router-dom';
import Icon from '../ui/Icon.jsx';

export default function Hero() {
  return (
    <section className="relative flex min-h-[700px] items-center justify-center overflow-hidden bg-[#F8FAFC] px-4 py-20 dark:bg-[#070B14] sm:px-6 md:min-h-[780px] md:py-28">
      {/* Background Video with subtle tech translucency */}
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        className="absolute inset-0 size-full object-cover opacity-40 dark:opacity-25 pointer-events-none"
        src="/Data_particles_flowing_no_audio_gwr_video_mvp.mp4"
      />

      {/* Tech Grid Background Overlay matching coralswift.com */}
      <div 
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(203,213,225,0.3)_1px,transparent_1px),linear-gradient(to_bottom,rgba(203,213,225,0.3)_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] dark:bg-[linear-gradient(to_right,rgba(51,65,85,0.3)_1px,transparent_1px),linear-gradient(to_bottom,rgba(51,65,85,0.3)_1px,transparent_1px)]"
      />

      {/* Ambient Lighting & Radial Glows */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/80 via-white/40 to-[#F8FAFC]/90 dark:from-[#070B14]/80 dark:via-[#070B14]/40 dark:to-[#070B14]/90" />
      <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 size-[650px] rounded-full bg-radial from-orange-400/20 via-purple-500/10 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute top-1/4 left-10 size-72 rounded-full bg-orange-500/10 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 right-10 size-80 rounded-full bg-purple-600/15 blur-3xl" />

      {/* Floating Constellation Nodes / Particles SVG Graphic */}
      <svg className="pointer-events-none absolute inset-0 size-full stroke-slate-300/40 dark:stroke-slate-700/40" aria-hidden="true">
        <defs>
          <radialGradient id="glow-orange" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FF5500" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FF5500" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="glow-purple" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="glow-cyan" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#06B6D4" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* Constellation lines */}
        <line x1="12%" y1="25%" x2="22%" y2="40%" strokeWidth="1" strokeDasharray="4 4" opacity="0.6" />
        <line x1="22%" y1="40%" x2="18%" y2="65%" strokeWidth="1" opacity="0.4" />
        <line x1="82%" y1="20%" x2="75%" y2="35%" strokeWidth="1" opacity="0.5" />
        <line x1="75%" y1="35%" x2="88%" y2="55%" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
        <line x1="88%" y1="55%" x2="78%" y2="78%" strokeWidth="1" opacity="0.4" />
        
        {/* Glowing Node Points */}
        <circle cx="12%" cy="25%" r="12" fill="url(#glow-orange)" opacity="0.6" />
        <circle cx="12%" cy="25%" r="3" fill="#FF5500" />
        
        <circle cx="22%" cy="40%" r="16" fill="url(#glow-cyan)" opacity="0.5" />
        <circle cx="22%" cy="40%" r="3.5" fill="#06B6D4" />

        <circle cx="18%" cy="65%" r="14" fill="url(#glow-orange)" opacity="0.5" />
        <circle cx="18%" cy="65%" r="3" fill="#FF7A00" />

        <circle cx="82%" cy="20%" r="16" fill="url(#glow-purple)" opacity="0.6" />
        <circle cx="82%" cy="20%" r="3.5" fill="#8B5CF6" />

        <circle cx="75%" cy="35%" r="12" fill="url(#glow-cyan)" opacity="0.5" />
        <circle cx="75%" cy="35%" r="3" fill="#06B6D4" />

        <circle cx="88%" cy="55%" r="18" fill="url(#glow-orange)" opacity="0.6" />
        <circle cx="88%" cy="55%" r="4" fill="#FF5500" />

        <circle cx="78%" cy="78%" r="14" fill="url(#glow-purple)" opacity="0.5" />
        <circle cx="78%" cy="78%" r="3" fill="#A855F7" />
      </svg>

      <div className="relative z-10 mx-auto w-full max-w-5xl text-center">
        {/* Top Centered Pill Badge */}
        <div className="animate-hero-1 mx-auto mb-8 inline-flex items-center gap-2.5 rounded-full border border-slate-200/90 bg-white/90 px-4 py-1.5 text-xs font-semibold text-slate-800 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-200">
          <span className="size-2 rounded-full bg-[#FF5500] animate-pulse" />
          <span>Officially Partnered by VPD Technologies</span>
          <span className="mx-1 text-slate-300 dark:text-slate-700">|</span>
          <Link
            to="/services"
            className="group inline-flex items-center gap-0.5 font-semibold text-[#FF5500] hover:text-orange-600 dark:text-orange-400"
          >
            <span>Explore 2026 Capabilities</span>
            <Icon name="chevron_right" className="text-sm transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Main Headline */}
        <h1 className="animate-hero-2 mx-auto max-w-5xl text-center font-display text-3xl font-black tracking-tight text-[#0F172A] dark:text-white sm:text-5xl md:text-6xl lg:text-7xl xl:text-[80px] leading-[1.08]">
          <span className="block">Mission-Critical Software</span>
          <span className="block mt-1 sm:mt-2">
            for the{' '}
            <span className="text-[#FF5500]">Global</span>{' '}
            <span className="bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#6366F1] bg-clip-text text-transparent">
              Enterprise
            </span>
          </span>
        </h1>

        {/* Subtitle / Paragraph */}
        <p className="animate-hero-3 mx-auto mt-6 max-w-2xl text-center text-base leading-relaxed text-slate-600 dark:text-slate-300 sm:text-lg md:text-xl font-normal">
          CoralSwift designs, modernizes, and operates resilient cloud architectures, custom generative AI pipelines, and ultra-high-throughput distributed systems.
        </p>

        {/* Action Buttons */}
        <div className="animate-hero-4 mx-auto mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/contact"
            className="group inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-[#FF5500] via-[#E11D48] to-[#8B5CF6] px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-500/25 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-orange-500/35 sm:text-base"
          >
            <span>Start Architecture Consultation</span>
            <Icon name="arrow_forward" className="text-base transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
          <Link
            to="/case-studies"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-8 py-3.5 text-sm font-bold text-slate-900 shadow-sm transition-all duration-300 hover:border-slate-300 hover:bg-slate-50 hover:scale-[1.02] dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800 sm:text-base"
          >
            Explore Verified Outcomes
          </Link>
        </div>

        {/* Trust & SLA Badges */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <Icon name="verified_user" className="text-lg text-emerald-500" />
            <span>Officially Partnered by VPD Technologies</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="show_chart" className="text-lg text-orange-500" />
            <span>99.999% SLA Guaranteed</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="bolt" className="text-lg text-indigo-500" />
            <span>Zero-Downtime Migration</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="shield" className="text-lg text-rose-500" />
            <span>SOC2 Type II &amp; HIPAA</span>
          </div>
        </div>
      </div>
    </section>
  );
}

