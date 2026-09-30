import { useState, useEffect, useRef } from 'react';
import { SkeletonCard } from '../ui/Skeleton.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import Reveal from '../ui/Reveal.jsx';
import Icon from '../ui/Icon.jsx';
import useFocusTrap from '../../hooks/useFocusTrap.js';

export default function GalleryGrid({ albums }) {
 const [activeAlbum, setActiveAlbum] = useState(0);
 const [lightbox, setLightbox] = useState(null);
 const lightboxRef = useFocusTrap(!!lightbox);
 const prevFocusRef = useRef(null);

 useEffect(() => {
  if (!lightbox) return;
  prevFocusRef.current = document.activeElement;
  const timer = setTimeout(() => {
   const firstBtn = lightboxRef.current?.querySelector('button');
   if (firstBtn) firstBtn.focus();
  }, 0);
  return () => {
   clearTimeout(timer);
   prevFocusRef.current?.focus();
  };
 }, [lightbox, lightboxRef]);

 if (!albums) {
  return (
   <section className="py-section-padding">
    <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-10 xl:px-12">
     <div className="grid gap-gutter sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }, (_, i) => <SkeletonCard key={i} />)}
     </div>
    </div>
   </section>
  );
 }
 if (!albums.length) return <EmptyState icon="photo_library" title="No albums available" description="Gallery is empty." />;
 const album = albums[activeAlbum];

 const handleLightboxKeyDown = (e) => {
  if (e.key === 'Escape') {
   setLightbox(null);
   return;
  }
  if (e.key === 'ArrowLeft') {
   const prev = (lightbox.index - 1 + album.images.length) % album.images.length;
   setLightbox({ ...album.images[prev], index: prev });
   return;
  }
  if (e.key === 'ArrowRight') {
   const next = (lightbox.index + 1) % album.images.length;
   setLightbox({ ...album.images[next], index: next });
   return;
  }
 };

 return (
  <section className="py-section-padding">
   <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-10 xl:px-12">
    <div className="mb-stack-lg flex flex-wrap gap-2">
     {albums.map((a, i) => (
      <button
       key={a.name}
       onClick={() => { setActiveAlbum(i); setLightbox(null); }}
       className={`rounded-full px-4 py-2 font-label-caps text-label-caps uppercase transition-all ${
        activeAlbum === i
         ? 'bg-brand text-white'
         : 'bg-surface-container text-ink-muted hover:bg-outline-variant dark:bg-dark-surface-container dark:text-dark-ink-muted dark:hover:bg-dark-outline-variant'
       }`}
      >
       {a.name}
      </button>
     ))}
    </div>
    {album && (
     <div>
      <Reveal>
       <div className="mb-4">
        <h3 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand">{album.name}</h3>
        <p className="text-body-md text-ink-muted dark:text-dark-ink-muted">{album.description}</p>
       </div>
      </Reveal>
      <div className="grid gap-gutter sm:grid-cols-2 lg:grid-cols-3">
       {album.images.map((img, i) => (
        <Reveal key={i} from="zoom" delay={i * 60}>
         <button
          onClick={() => setLightbox({ ...img, index: i })}
          className="group relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg border border-outline-variant bg-surface-container transition-colors hover:border-brand dark:border-dark-outline-variant dark:bg-dark-surface-container"
         >
          {img.src ? (
           <>
            <img src={img.src} alt={img.alt} className="size-full object-cover transition-transform duration-300 group-hover:scale-105" />
            <div className="absolute inset-0 flex items-end bg-brand-dark/0 transition-all group-hover:bg-brand-dark/30">
             <span className="w-full bg-gradient-to-t from-black/60 to-transparent px-3 py-2 text-left text-body-sm text-white opacity-0 transition-opacity group-hover:opacity-100">{img.caption}</span>
            </div>
           </>
          ) : (
           <div className="flex flex-col items-center gap-2 text-ink-muted transition-colors group-hover:text-brand dark:text-dark-ink-muted dark:group-hover:text-dark-brand">
            <Icon name="image" className="text-4xl" />
            <span className="px-2 text-center text-body-sm">{img.caption}</span>
           </div>
          )}
         </button>
        </Reveal>
       ))}
      </div>
     </div>
    )}
   </div>

   {lightbox && (
    <div
     ref={lightboxRef}
     role="dialog"
     aria-modal="true"
     aria-label="Image viewer"
     className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
     onClick={() => setLightbox(null)}
     onKeyDown={handleLightboxKeyDown}
    >
     <div className="w-full max-w-3xl rounded-lg bg-white p-stack-lg dark:bg-dark-surface" onClick={(e) => e.stopPropagation()}>
      <div className="mb-4 flex items-start justify-between">
       <div>
        <p className="font-body text-body-sm text-ink-muted dark:text-dark-ink-muted">{lightbox.caption}</p>
       </div>
       <button onClick={() => setLightbox(null)} aria-label="Close" className="text-ink-muted hover:text-brand dark:text-dark-ink-muted dark:hover:text-dark-brand">
        <Icon name="close" className="text-2xl" />
       </button>
      </div>
      <div
       tabIndex={0}
       className="flex aspect-video items-center justify-center overflow-hidden rounded-lg bg-surface-container dark:bg-dark-surface-container"
      >
       {lightbox.src
        ? <img src={lightbox.src} alt={lightbox.alt} className="size-full object-cover" />
        : <Icon name="image" className="text-6xl text-ink-muted/40 dark:text-dark-ink-muted/40" />}
      </div>
      <div className="mt-4 flex justify-between">
       <button
        onClick={() => {
         const prev = (lightbox.index - 1 + album.images.length) % album.images.length;
         setLightbox({ ...album.images[prev], index: prev });
        }}
        className="flex items-center gap-1 font-label-caps text-label-caps uppercase text-ink-muted hover:text-brand dark:text-dark-ink-muted dark:hover:text-dark-brand"
       >
        <Icon name="chevron_left" /> Previous
       </button>
       <span className="text-body-sm text-ink-muted dark:text-dark-ink-muted">
        {lightbox.index + 1} / {album.images.length}
       </span>
       <button
        onClick={() => {
         const next = (lightbox.index + 1) % album.images.length;
         setLightbox({ ...album.images[next], index: next });
        }}
        className="flex items-center gap-1 font-label-caps text-label-caps uppercase text-ink-muted hover:text-brand dark:text-dark-ink-muted dark:hover:text-dark-brand"
       >
        Next <Icon name="chevron_right" />
       </button>
      </div>
     </div>
    </div>
   )}
  </section>
 );
}
