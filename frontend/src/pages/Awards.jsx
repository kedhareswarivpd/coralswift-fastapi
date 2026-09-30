import { useEffect, useState } from 'react';
import AwardsHero from '../components/awards/AwardsHero.jsx';
import AwardsGrid from '../components/awards/AwardsGrid.jsx';
import CtaBanner from '../components/home/CtaBanner.jsx';
import SectionHeading from '../components/ui/SectionHeading.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { awards as staticAwards, awardYearFilters } from '../data/awards.js';
import { fetchAwards } from '../api/cms.js';

function toFrontend(a) {
 return {
  year: a.year || new Date().getFullYear(),
  title: a.title,
  issuedBy: a.issued_by || '',
  description: a.description || '',
  category: 'Technology',
 };
}

export default function Awards() {
 useDocumentTitle('Awards & Recognition | CoralSwift Technologies');
 const [awards, setAwards] = useState(staticAwards);

 useEffect(() => {
  fetchAwards()
   .then((res) => {
    const items = res?.data;
    if (Array.isArray(items) && items.length) setAwards(items.map(toFrontend));
   })
   .catch(() => {});
 }, []);

 return (
  <>
   <AwardsHero />
   <SectionHeading
    eyebrow="Recognition"
    title="Awards & Certifications"
    description="Industry recognition that validates our commitment to excellence."
    align="center"
    className="mx-auto max-w-container px-4 sm:px-6 lg:px-10 xl:px-12 [&_h2]:!text-white [&_p]:!text-white"
   />
   <AwardsGrid awards={awards} yearFilters={awardYearFilters} />
   <CtaBanner />
  </>
 );
}
