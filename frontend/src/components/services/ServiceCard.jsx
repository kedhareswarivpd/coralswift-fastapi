import { Link } from 'react-router-dom';
import Icon from '../ui/Icon.jsx';

export default function ServiceCard({ service }) {
 return (
  <div className="flex h-full flex-col rounded-lg border border-outline-variant bg-surface-white p-stack-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover dark:border-dark-outline-variant dark:bg-dark-surface">
   <div className="mb-stack-md flex size-12 items-center justify-center rounded-lg bg-accent-cyan-pale">
    <Icon name={service.icon} className="text-4xl leading-none text-brand" />
   </div>
   <h3 className="mb-stack-sm font-display text-headline-sm text-brand-dark dark:text-dark-brand">{service.title}</h3>
   <p className="mb-stack-md font-body text-body-md text-ink-muted dark:text-dark-ink-muted">{service.description}</p>
   <div className="mb-stack-md space-y-2">
    <p className="font-label-caps text-label-caps uppercase text-ink-muted dark:text-dark-ink-muted">Key Features</p>
    <ul className="space-y-1">
     {service.features.map((feature) => (
      <li key={feature} className="flex items-center gap-2 text-body-md text-ink dark:text-dark-ink">
       <Icon name="check_circle" className="text-body-lg leading-none text-brand" />
       {feature}
      </li>
     ))}
    </ul>
   </div>
   <div className="mt-auto border-t border-outline-variant pt-stack-md">
    <p className="font-body font-semibold text-ink dark:text-dark-ink">Business Benefit</p>
    <p className="mb-stack-md text-body-md text-ink-muted dark:text-dark-ink-muted">{service.benefit}</p>
    <Link to={`/services/${service.slug}`} className="flex w-fit items-center gap-1 font-label-caps text-label-caps uppercase text-brand transition-all hover:gap-2">
     Learn more <Icon name="arrow_forward" className="text-body-lg leading-none" />
    </Link>
   </div>
  </div>
 );
}
