import { useEffect, useState } from 'react';
import CareersHero from '../components/careers/CareersHero.jsx';
import JobListings from '../components/careers/JobListings.jsx';
import CtaBanner from '../components/home/CtaBanner.jsx';
import SectionHeading from '../components/ui/SectionHeading.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { apiRequest } from '../api/client.js';
import { jobs as fallbackJobs } from '../data/careers.js';

function adaptJobs(apiJobs) {
 return apiJobs.map((j) => ({
  id: j.id,
  slug: j.slug,
  title: j.title,
  department: j.department || 'General',
  location: j.location || 'Remote',
  type: j.employment_type || 'Full-time',
  experience: j.experience_required || '',
  description: j.description || '',
  responsibilities: j.responsibilities || [],
  requirements: j.requirements || [],
 }));
}

export default function Careers() {
 useDocumentTitle('Careers | CoralSwift Technologies');
 const [jobs, setJobs] = useState(null);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
  apiRequest('/careers?limit=20')
   .then((res) => setJobs(adaptJobs(res.data || [])))
   .catch(() => setJobs(fallbackJobs))
   .finally(() => setLoading(false));
 }, []);

 return (
  <>
   <CareersHero />
   <div className="bg-surface-container/40 py-12 sm:py-16 dark:bg-dark-surface-container/40">
    <SectionHeading
     eyebrow="Open Positions"
     title="Join Our Team"
     description="Explore opportunities to work on cutting-edge technology with talented teams across the globe."
     align="center"
     className="mx-auto max-w-container px-4 sm:px-6 lg:px-10 xl:px-12"
    />
   </div>
   {loading ? (
    <div className="py-8 text-center text-body-md text-ink-muted">Loading positions...</div>
   ) : (
    <JobListings jobs={jobs} />
   )}
   <CtaBanner />
  </>
 );
}
