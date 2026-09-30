import { Link } from 'react-router-dom';
import SectionHeading from '../ui/SectionHeading.jsx';
import Reveal from '../ui/Reveal.jsx';
import Icon from '../ui/Icon.jsx';

export default function AboutTeaser() {
 return (
  <section className="mx-auto max-w-container px-4 py-section-padding sm:px-6 lg:px-10 xl:px-12 ">
   <div className="grid items-center gap-stack-xl md:grid-cols-2">
    <Reveal from="left">
     <SectionHeading
      eyebrow="Who We Are"
      title="Engineering excellence, delivered globally"
      description="CoralSwift Technologies is a digital transformation company founded in 2020, delivering secure, scalable enterprise software from offices spanning India, the UAE, and Singapore."
     />
     <Link
      to="/about"
      className="mt-6 flex w-fit items-center gap-2 font-label-caps text-label-caps uppercase text-brand transition-all hover:gap-3"
     >
      More About Us <Icon name="arrow_forward" />
     </Link>
    </Reveal>
    <Reveal from="right" className="grid grid-cols-2 gap-4">
     {[
      { icon: 'work_history', label: '430+ Projects' },
      { icon: 'groups', label: '285+ Employees' },
      { icon: 'business_center', label: '120+ Clients' },
      { icon: 'public', label: '18+ Countries' },
     ].map((item) => (
      <div key={item.label} className="flex min-w-0 flex-col items-center gap-2 rounded-lg border border-outline-variant bg-white p-6 text-center dark:border-dark-outline-variant dark:bg-dark-surface">
       <Icon name={item.icon} className="text-3xl text-brand" />
       <span className="font-display text-headline-sm text-brand-dark dark:text-dark-brand">{item.label}</span>
      </div>
     ))}
    </Reveal>
   </div>
  </section>
 );
}
