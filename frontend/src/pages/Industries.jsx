import { useEffect, useState } from 'react';
import IndustriesHero from '../components/industries/IndustriesHero.jsx';
import IndustriesGrid from '../components/industries/IndustriesGrid.jsx';
import CtaBanner from '../components/home/CtaBanner.jsx';
import SectionHeading from '../components/ui/SectionHeading.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { industries as staticIndustries } from '../data/industries.js';
import { fetchIndustries } from '../api/cms.js';

function toFrontend(ind) {
 return {
  icon: ind.icon || 'business',
  title: ind.name,
  description: ind.description || '',
  challenges: [],
  stats: '',
 };
}

export default function Industries() {
 useDocumentTitle('Industries We Serve | CoralSwift Technologies');
 const [industries, setIndustries] = useState(staticIndustries);

 useEffect(() => {
  fetchIndustries()
   .then((res) => {
    const items = res?.data;
    if (Array.isArray(items) && items.length) setIndustries(items.map(toFrontend));
   })
   .catch(() => {});
 }, []);

 return (
  <>
   <IndustriesHero />
   <IndustriesGrid industries={industries} />
   <CtaBanner />
  </>
 );
}
