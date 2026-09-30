import { useEffect, useState } from 'react';
import GalleryHero from '../components/gallery/GalleryHero.jsx';
import GalleryGrid from '../components/gallery/GalleryGrid.jsx';
import CtaBanner from '../components/home/CtaBanner.jsx';
import SectionHeading from '../components/ui/SectionHeading.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { albums as staticAlbums } from '../data/gallery.js';
import { fetchGallery } from '../api/cms.js';

function toFrontend(apiItems) {
 const groups = new Map();
 apiItems.forEach((item) => {
  const key = item.album_name || 'Gallery';
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push({
   src: item.image_url,
   alt: item.title || '',
   caption: item.title || '',
  });
 });
 return Array.from(groups.entries()).map(([name, images]) => ({
  name,
  description: '',
  coverImage: images[0]?.src || '',
  images,
 }));
}

export default function Gallery() {
 useDocumentTitle('Gallery | CoralSwift Technologies');
 const [albums, setAlbums] = useState(staticAlbums);

 useEffect(() => {
  fetchGallery()
   .then((res) => {
    const items = res?.data;
    if (Array.isArray(items) && items.length) setAlbums(toFrontend(items));
   })
   .catch(() => {});
 }, []);

 return (
  <>
   <GalleryHero />
   <SectionHeading
    eyebrow="Our Story in Pictures"
    title="Photo Gallery"
    description="Browse through albums from our events, office life, and community initiatives."
    align="center"
    className="mx-auto max-w-container px-4 sm:px-6 lg:px-10 xl:px-12 [&_h2]:!text-white [&_p]:!text-white"
   />
   <GalleryGrid albums={albums} />
   <CtaBanner />
  </>
 );
}
