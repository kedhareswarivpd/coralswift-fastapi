import { useEffect, useState } from 'react';
import TechHero from '../components/technologies/TechHero.jsx';
import TechGrid from '../components/technologies/TechGrid.jsx';
import CtaBanner from '../components/home/CtaBanner.jsx';
import SectionHeading from '../components/ui/SectionHeading.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { technologyCategories as staticCategories } from '../data/technologies.js';
import { fetchTechnologies } from '../api/cms.js';

const CATEGORY_META = [
 { key: 'frontend', name: 'Frontend & Mobile', icon: 'devices' },
 { key: 'backend', name: 'Backend & APIs', icon: 'code' },
 { key: 'database', name: 'Data & Databases', icon: 'storage' },
 { key: 'cloud', name: 'Cloud & Infrastructure', icon: 'cloud' },
 { key: 'devops', name: 'Security & DevOps', icon: 'shield' },
 { key: 'ai_ml', name: 'Data & AI', icon: 'analytics' },
 { key: 'mobile', name: 'Mobile Technologies', icon: 'smartphone' },
 { key: 'other', name: 'Other Technologies', icon: 'extension' },
];

function toFrontend(apiTechnologies) {
 return CATEGORY_META.map((meta) => ({
  ...meta,
  technologies: apiTechnologies
   .filter((t) => (t.category || 'other') === meta.key)
   .map((t) => ({ name: t.name, description: t.description || '', proficiency: 80 })),
 })).filter((cat) => cat.technologies.length > 0);
}

export default function Technologies() {
 useDocumentTitle('Our Technology Stack | CoralSwift Technologies');
 const [categories, setCategories] = useState(staticCategories);

 useEffect(() => {
  fetchTechnologies()
   .then((res) => {
    const items = res?.data;
    if (Array.isArray(items) && items.length) setCategories(toFrontend(items));
   })
   .catch(() => {});
 }, []);

 return (
  <>
   <TechHero />
   <SectionHeading
    eyebrow="Our Expertise"
    title="Technologies We Master"
    description="Deep, hands-on proficiency across the tools and platforms that power modern enterprise."
    align="center"
    className="mx-auto max-w-container px-4 pt-16 sm:px-6 lg:px-10 xl:px-12 [&_h2]:!text-white [&_p]:!text-white"
   />
   <TechGrid categories={categories} />
   <CtaBanner />
  </>
 );
}
