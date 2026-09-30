import { globalNodes } from '../../data/projects.js';

export default function GlobalMap() {
 return (
  <section className="overflow-hidden bg-brand px-4 py-stack-xl sm:px-6 lg:px-10 xl:px-12 ">
   <div className="mx-auto mb-16 max-w-5xl text-center">
    <span className="font-label-caps text-label-caps uppercase text-accent-cyan">Global Footprint</span>
    <h2 className="mt-2 font-display text-headline-lg text-white">Engineering Without Borders</h2>
    <p className="mx-auto mt-4 max-w-2xl font-body text-body-lg text-surface-dim opacity-90">
     From our hubs in Delhi and Dubai to our partners in Seattle, we deliver excellence at a planetary
     scale.
    </p>
   </div>
   <div className="relative mx-auto aspect-[2/1] w-full max-w-5xl overflow-hidden rounded-xl border border-white/10 bg-brand-dark/40">
    <div className="absolute inset-0 flex items-center justify-center">
     <div className="relative size-72 md:size-96">
      {/* Outer glow ring */}
      <div className="absolute inset-0 animate-ping rounded-full border-2 border-accent-cyan/30" style={{ animationDuration: '3s' }} />
      <div className="absolute inset-2 rounded-full border border-accent-cyan/20" />
      {/* Globe circle */}
      <div className="absolute inset-4 flex items-center justify-center overflow-hidden rounded-full border border-accent-cyan/40 bg-brand-dark/60 shadow-[0_0_60px_rgba(0,212,255,0.15)]">
       {/* SVG continents */}
       <svg viewBox="0 0 200 200" className="size-full opacity-70" xmlns="http://www.w3.org/2000/svg">
        <circle cx="100" cy="100" r="100" fill="#0a2540" />
        {/* Latitude lines */}
        {[30,50,70,90,110,130,150,170].map(y => (
         <line key={y} x1="0" y1={y} x2="200" y2={y} stroke="#00d4ff" strokeWidth="0.3" strokeOpacity="0.2" />
        ))}
        {/* Longitude lines */}
        {[25,50,75,100,125,150,175].map(x => (
         <line key={x} x1={x} y1="0" x2={x} y2="200" stroke="#00d4ff" strokeWidth="0.3" strokeOpacity="0.2" />
        ))}
        {/* North America */}
        <path d="M30 55 L55 50 L65 60 L60 80 L50 90 L35 85 L25 70 Z" fill="#00d4ff" fillOpacity="0.35" stroke="#00d4ff" strokeWidth="0.5" />
        {/* South America */}
        <path d="M50 95 L65 92 L70 110 L65 135 L55 140 L45 125 L42 108 Z" fill="#00d4ff" fillOpacity="0.35" stroke="#00d4ff" strokeWidth="0.5" />
        {/* Europe */}
        <path d="M90 45 L110 42 L115 55 L105 62 L92 60 Z" fill="#00d4ff" fillOpacity="0.35" stroke="#00d4ff" strokeWidth="0.5" />
        {/* Africa */}
        <path d="M90 65 L112 63 L118 85 L112 115 L100 120 L88 110 L84 88 Z" fill="#00d4ff" fillOpacity="0.35" stroke="#00d4ff" strokeWidth="0.5" />
        {/* Asia */}
        <path d="M115 38 L165 35 L175 55 L170 75 L150 80 L130 75 L118 65 L112 50 Z" fill="#00d4ff" fillOpacity="0.35" stroke="#00d4ff" strokeWidth="0.5" />
        {/* Australia */}
        <path d="M148 105 L168 102 L172 118 L162 125 L148 120 Z" fill="#00d4ff" fillOpacity="0.35" stroke="#00d4ff" strokeWidth="0.5" />
       </svg>
      </div>
     </div>
    </div>
    {globalNodes.map((node) => (
     <span
      key={node.label}
      className="map-pulse"
      style={{ top: node.top, left: node.left }}
      title={node.label}
     />
    ))}
    <div className="glass-panel absolute bottom-6 left-6 hidden rounded-lg p-4 md:block">
     <div className="flex items-center gap-3">
      <div className="size-3 rounded-full bg-accent-cyan" />
      <span className="font-label-caps text-label-caps uppercase text-white">Active Project Nodes</span>
     </div>
    </div>
   </div>
  </section>
 );
}
