import { useEffect, useState } from 'react';
import DownloadsHero from '../components/downloads/DownloadsHero.jsx';
import DownloadsGrid from '../components/downloads/DownloadsGrid.jsx';
import CtaBanner from '../components/home/CtaBanner.jsx';
import SectionHeading from '../components/ui/SectionHeading.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { downloads as staticDownloads, downloadCategoryFilters } from '../data/downloads.js';
import { fetchDownloads } from '../api/cms.js';

function toFrontend(d) {
 return {
  id: d.id,
  title: d.title,
  description: d.description || '',
  category: d.category || 'General',
  fileUrl: d.file_url || '#',
  fileSize: '',
  format: d.file_type || 'PDF',
  downloadCount: d.download_count ?? 0,
 };
}

export default function Downloads() {
 useDocumentTitle('Downloads | CoralSwift Technologies');
 const [downloads, setDownloads] = useState(staticDownloads);

 useEffect(() => {
  fetchDownloads()
   .then((res) => {
    const items = res?.data;
    if (Array.isArray(items) && items.length) setDownloads(items.map(toFrontend));
   })
   .catch(() => {});
 }, []);

 return (
  <>
   <DownloadsHero />
   <SectionHeading
    eyebrow="Resource Library"
    title="Download Our Materials"
    description="Access brochures, whitepapers, datasheets, and case studies."
    align="center"
    className="mx-auto max-w-container px-4 sm:px-6 lg:px-10 xl:px-12 [&_h2]:!text-white [&_p]:!text-white"
   />
   <DownloadsGrid downloads={downloads} categoryFilters={downloadCategoryFilters} />
   <CtaBanner />
  </>
 );
}
