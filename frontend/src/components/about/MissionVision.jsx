import Reveal from '../ui/Reveal.jsx';

export default function MissionVision() {
 return (
  <section className="mx-auto max-w-container bg-white px-4 py-section-padding dark:bg-dark-surface sm:px-6 lg:px-10 xl:px-12 ">
   <div className="grid items-center gap-12 md:grid-cols-2 md:gap-20">
    <Reveal from="left" className="space-y-8 md:space-y-12">
     <div>
      <h2 className="mb-6 font-display text-headline-md text-brand-dark dark:text-white">Our Mission</h2>
      <p className="font-body text-body-lg leading-relaxed text-ink-muted dark:text-white/80">
       Deliver world-class enterprise technology solutions through innovation, engineering excellence
       and customer-centric development.
      </p>
     </div>
     <div>
      <h2 className="mb-6 font-display text-headline-md text-brand-dark dark:text-white">Our Vision</h2>
      <p className="font-body text-body-lg leading-relaxed text-ink-muted dark:text-white/80">
       To become one of Asia&apos;s most trusted Digital Transformation companies by building secure,
       scalable and intelligent enterprise software.
      </p>
     </div>
    </Reveal>
    <Reveal from="right" className="relative">
     <div className="relative aspect-square overflow-hidden rounded-xl shadow-2xl">
      <img
       className="size-full object-cover"
       alt="A professional high-tech workspace with engineers collaborating around multiple screens"
       src="https://lh3.googleusercontent.com/aida-public/AB6AXuAPH3ptHIs_pevaJLg33kNzZilIxRnSf3dxZtsfP73hzZjiL0QyUy3P2_1AZIjWVjKizbvmotz69u5ujUixfsrdbfX6LUNNvdBEGN_8LhgcYUxz1Kz8sP6mkGR2haK6yEVOoZvAUkRgXV1EneNZv9gwtzaBaqGBRB3XboGO_2ByMDwjDe1pAR8DCZiDq2IuVHhZbTKflunSf2I98Wdj6ixcT8_SyfUhQad1SEs9oqOLSaMvU9UyOv7X"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-brand/40 to-transparent" />
     </div>
     <div className="glass-panel-light animate-float absolute -bottom-10 -left-10 hidden max-w-xs rounded-lg p-6 lg:block">
      <p className="mb-2 font-label-caps text-label-caps italic text-brand">
       &ldquo;Precision in every line of code.&rdquo;
      </p>
      <p className="text-xs text-ink-muted">— CoralSwift Engineering Standards</p>
     </div>
    </Reveal>
   </div>
  </section>
 );
}
