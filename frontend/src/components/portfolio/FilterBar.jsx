import { industryFilters, serviceFilters } from '../../data/projects.js';

function FilterGroup({ label, options, active, onSelect, multi = false }) {
 return (
  <div className="flex flex-wrap items-center gap-3">
   <span className="mr-2 font-label-caps text-label-caps uppercase text-brand">{label}</span>
   {options.map((option) => {
    const isActive = multi ? active.includes(option) : active === option;
    return (
     <button
      key={option}
      onClick={() => onSelect(option)}
      className={`rounded-full border px-4 py-1.5 font-label-caps text-label-caps uppercase transition-all ${
       isActive
        ? 'border-brand bg-brand text-white'
        : 'border-outline text-ink hover:border-brand dark:border-dark-outline dark:text-white'
      }`}
     >
      {option}
     </button>
    );
   })}
  </div>
 );
}

export default function FilterBar({ industry, onIndustryChange, activeServices, onServiceToggle }) {
 return (
  <section className="sticky top-20 z-40 border-b border-outline-variant bg-surface-bright py-stack-md dark:border-dark-outline-variant dark:bg-dark-surface-bright">
   <div className="mx-auto flex max-w-container flex-col items-start justify-between gap-6 px-4 sm:px-6 md:flex-row md:items-center lg:px-10 xl:px-12 ">
    <FilterGroup label="Industry:" options={industryFilters} active={industry} onSelect={onIndustryChange} />
    <FilterGroup
     label="Service:"
     options={serviceFilters}
     active={activeServices}
     onSelect={onServiceToggle}
     multi
    />
   </div>
  </section>
 );
}
