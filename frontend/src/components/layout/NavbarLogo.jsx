import { Link } from 'react-router-dom';

export default function NavbarLogo({ compact = false }) {
 return (
  <Link to="/" className="flex shrink-0 items-center gap-2.5 group" aria-label="CoralSwift — Home">
   <div className="relative flex items-center justify-center">
    <img
     src="/logo-icon.png"
     alt="CoralSwift Emblem"
     className={`w-auto object-contain transition-transform duration-300 group-hover:scale-105 ${
      compact ? 'h-8 md:h-9' : 'h-9 md:h-11'
     }`}
     loading="eager"
     onError={(e) => { e.target.src = '/logo.png'; }}
    />
   </div>
   <div className="flex flex-col leading-none">
    <span
     className={`font-display font-bold tracking-tight text-slate-900 dark:text-white ${
      compact ? 'text-lg md:text-xl' : 'text-xl md:text-2xl'
     }`}
    >
     Coral<span className="bg-gradient-to-r from-[#FF5500] via-[#E11D48] to-[#8B5CF6] bg-clip-text text-transparent">Swift</span>
    </span>
    <span className="text-[9px] font-semibold tracking-[0.25em] uppercase text-slate-500 dark:text-slate-400 -mt-0.5">
     Technologies
    </span>
   </div>
  </Link>
 );
}
