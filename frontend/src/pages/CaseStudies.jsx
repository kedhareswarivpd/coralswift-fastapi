import { useEffect, useState } from 'react';
import CaseStudiesHero from '../components/caseStudies/CaseStudiesHero.jsx';
import CaseStudiesGrid from '../components/caseStudies/CaseStudiesGrid.jsx';
import CtaBanner from '../components/home/CtaBanner.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { caseStudies as staticCaseStudies } from '../data/caseStudies.js';
import { fetchCaseStudies } from '../api/cms.js';

function toFrontend(cs) {
 return {
  slug: cs.slug,
  industry: cs.industry || 'Technology',
  title: cs.title,
  description: cs.solution || cs.problem || '',
  results: cs.roi ? [cs.roi] : (cs.result ? [cs.result] : []),
  technologies: [],
  image: cs.cover_image || '',
 };
}

export default function CaseStudies() {
 useDocumentTitle('Case Studies | CoralSwift Technologies');
 const [caseStudies, setCaseStudies] = useState(staticCaseStudies);

 useEffect(() => {
  fetchCaseStudies()
   .then((res) => {
    const items = res?.data;
    if (Array.isArray(items) && items.length) setCaseStudies(items.map(toFrontend));
   })
   .catch(() => {});
 }, []);

 return (
  <>
   <CaseStudiesHero />
   <CaseStudiesGrid studies={caseStudies} />
   <CtaBanner />
  </>
 );
}
