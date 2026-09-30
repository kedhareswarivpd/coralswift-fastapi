import { Link } from 'react-router-dom';
import Icon from '../ui/Icon.jsx';
import Badge from '../ui/Badge.jsx';
import Button from '../ui/Button.jsx';

export default function Hero() {
 return (
  <section className="relative flex min-h-[600px] items-center overflow-hidden bg-brand-dark px-4 py-20 sm:px-6 md:min-h-[720px] md:px-10 md:py-section-padding">
   {/* Background video with reduced opacity */}
   <video
    autoPlay
    muted
    loop
    playsInline
    preload="metadata"
    className="absolute inset-0 size-full object-cover opacity-30"
    src="/Data_particles_flowing_no_audio_gwr_video_mvp.mp4"
   />

   {/* Dark gradient overlay */}
   <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/95 via-brand-dark/85 to-brand-dark/70 sm:from-brand-dark/90 sm:via-brand-dark/75 sm:to-brand-dark/60" />


   {/* Decorative floating orbs */}
   <div className="animate-float-slow pointer-events-none absolute right-1/4 top-20 size-48 rounded-full bg-accent-cyan/10 blur-3xl sm:size-64" />
   <div className="animate-float pointer-events-none absolute bottom-10 left-1/3 size-36 rounded-full bg-brand/10 blur-2xl sm:size-48" />

   <div className="relative z-10 mx-auto w-full max-w-container">
    <div className="flex w-full flex-col gap-6 sm:gap-stack-lg">
     <Badge className="animate-hero-1 w-fit border border-brand/30 bg-brand/10 text-white dark:border-white/20 dark:bg-white/10">
      <span className="bg-gradient-to-r from-[#FF5500] via-[#E11D48] to-[#8B5CF6] bg-clip-text font-semibold text-transparent">
       Officially Partnered by VPD Technologies
      </span>
      <span className="mx-2 text-white/40">|</span>
      <span className="text-white/90">Explore 2026 Capabilities</span>
     </Badge>

     <h1 className="animate-hero-2 max-w-4xl font-display text-3xl font-bold leading-tight text-white sm:text-display-lg-mobile md:text-display-lg">
      Enterprise Software Engineering &amp;{' '}
      <span className="bg-gradient-to-r from-[#FF5500] via-[#E11D48] to-[#8B5CF6] bg-clip-text text-transparent">
       High-Scale
      </span>{' '}
      Cloud Systems
     </h1>

     <p className="animate-hero-3 max-w-2xl font-body text-body-md text-white/90 sm:text-body-lg leading-relaxed">
      CoralSwift designs, modernizes, and operates resilient cloud architectures, custom generative AI pipelines, and ultra-high-throughput distributed systems for global enterprises.
     </p>

     <div className="animate-hero-4 flex flex-wrap gap-3 pt-2 sm:gap-4 sm:pt-4">
      <Button as={Link} to="/case-studies" variant="primary" icon={<Icon name="arrow_forward" />}>
       Explore Verified Outcomes
      </Button>
      <Button as={Link} to="/contact" variant="outline-light">
       Schedule Architecture Review
      </Button>
     </div>
    </div>
   </div>
  </section>
 );
}
