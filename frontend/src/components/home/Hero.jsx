import { Link } from 'react-router-dom';
import Icon from '../ui/Icon.jsx';

export default function Hero() {
  return (
    <section className="relative flex min-h-[680px] items-center justify-center overflow-hidden bg-[#F8FAFC] px-4 py-24 dark:bg-[#070B14] sm:px-6 md:min-h-[760px] md:py-32">
      {/* Background Video with light tech translucency matching coralswift.com */}
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        className="absolute inset-0 size-full object-cover opacity-60 dark:opacity-30"
        src="/Data_particles_flowing_no_audio_gwr_video_mvp.mp4"
      />

      {/* Frosted glass & subtle grid overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/70 to-[#F8FAFC]/95 backdrop-blur-[1.5px] dark:from-[#070B14]/90 dark:via-[#070B14]/75 dark:to-[#070B14]/95" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-40 dark:bg-[radial-gradient(#334155_1px,transparent_1px)]" />

      {/* Decorative ambient radial gradients */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 size-[600px] rounded-full bg-gradient-to-b from-[#FF5500]/15 via-[#8B5CF6]/10 to-transparent blur-3xl" />

      <div className="relative z-10 mx-auto w-full max-w-6xl text-center">
        {/* Top Centered Pill */}
        <div className="animate-hero-1 mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/90 px-4 py-1.5 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-300">
          <span className="size-2 rounded-full bg-[#FF5500]" />
          <span>Officially Partnered by VPD Technologies</span>
          <span className="mx-1 text-slate-300 dark:text-slate-700">|</span>
          <Link
            to="/services"
            className="flex items-center gap-0.5 font-semibold text-[#FF5500] hover:underline dark:text-orange-400"
          >
            <span>Explore 2026 Capabilities</span>
            <span className="text-xs">&gt;</span>
          </Link>
        </div>

        {/* Main Headline */}
        <h1 className="animate-hero-2 mx-auto max-w-5xl font-display text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-6xl md:text-7xl lg:text-[76px] leading-[1.1]">
          Mission-Critical Software
          <br />
          for the{' '}
          <span className="bg-gradient-to-r from-[#FF5500] via-[#E11D48] to-[#8B5CF6] bg-clip-text text-transparent">
            Global Enterprise
          </span>
        </h1>

        {/* Subtitle */}
        <p className="animate-hero-3 mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-300 sm:text-lg">
          CoralSwift designs, modernizes, and operates resilient cloud architectures, custom generative AI pipelines, and ultra-high-throughput distributed systems.
        </p>

        {/* Action Buttons */}
        <div className="animate-hero-4 mx-auto mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/contact"
            className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#FF5500] via-[#E11D48] to-[#8B5CF6] px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-500/25 transition-all duration-300 hover:scale-105 hover:shadow-orange-500/35 sm:text-base"
          >
            <span>Start Architecture Consultation</span>
            <Icon name="arrow_forward" className="text-base transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
          <Link
            to="/case-studies"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-8 py-3.5 text-sm font-bold text-slate-900 shadow-sm transition-all duration-300 hover:bg-slate-50 hover:scale-105 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800 sm:text-base"
          >
            Explore Verified Outcomes
          </Link>
        </div>

        {/* Trust & SLA Badges */}
        <div className="mt-14 flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs font-semibold text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <Icon name="verified_user" className="text-base text-emerald-500" />
            <span>Officially Partnered by VPD Technologies</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Icon name="show_chart" className="text-base text-orange-500" />
            <span>99.999% SLA Guaranteed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Icon name="bolt" className="text-base text-indigo-500" />
            <span>Zero-Downtime Migration</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Icon name="shield" className="text-base text-rose-500" />
            <span>SOC2 Type II &amp; HIPAA</span>
          </div>
        </div>
      </div>
    </section>
  );
}
