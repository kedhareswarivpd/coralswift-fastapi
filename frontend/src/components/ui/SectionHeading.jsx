export default function SectionHeading({ eyebrow, title, description, align = 'left', className = '' }) {
 const alignment = align === 'center' ? 'text-center items-center' : 'text-left items-start';
 return (
  <div className={`flex flex-col gap-stack-sm ${alignment} ${className}`}>
   {eyebrow && <span className="font-label-caps text-label-caps uppercase tracking-widest text-brand">{eyebrow}</span>}
   <h2 className="font-display text-headline-sm text-ink dark:text-white md:text-headline-md">{title}</h2>
   {description && <p className="max-w-2xl font-body text-body-md text-ink-muted dark:text-white/80">{description}</p>}
  </div>
 );
}
