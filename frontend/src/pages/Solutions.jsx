import { useEffect, useState } from 'react';
import SolutionsHero from '../components/solutions/SolutionsHero.jsx';
import SolutionsGrid from '../components/solutions/SolutionsGrid.jsx';
import CtaBanner from '../components/home/CtaBanner.jsx';
import SectionHeading from '../components/ui/SectionHeading.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { solutions as staticSolutions } from '../data/solutions.js';
import { fetchSolutions } from '../api/cms.js';

function toFrontend(s) {
 return {
  icon: s.icon || 'cloud',
  title: s.name,
  description: s.overview || '',
  capabilities: s.approach || [],
  industries: s.related_industries || [],
 };
}

export default function Solutions() {
 useDocumentTitle('Enterprise Solutions | CoralSwift Technologies');
 const [solutions, setSolutions] = useState(staticSolutions);

 useEffect(() => {
  fetchSolutions()
   .then((res) => {
    const items = res?.data;
    if (Array.isArray(items) && items.length) setSolutions(items.map(toFrontend));
   })
   .catch(() => {});
 }, []);

 return (
  <>
   <SolutionsHero />
   <div className="border-y border-slate-100 bg-white dark:border-slate-800/80 dark:bg-[#070B14]">
    <SectionHeading
     eyebrow="Our Capabilities"
     title="Comprehensive Solution Portfolio"
     description="End-to-end enterprise solutions designed to address your most complex business and technology challenges."
     align="center"
     className="mx-auto max-w-container px-4 py-section-padding sm:px-6 lg:px-10 xl:px-12 [&_h2]:text-slate-900 dark:[&_h2]:text-white [&_p]:text-slate-600 dark:[&_p]:text-slate-300 [&_span]:text-[#FF5500]"
    />
   </div>
   <SolutionsGrid solutions={solutions} />
   <CtaBanner />
  </>
 );
}
