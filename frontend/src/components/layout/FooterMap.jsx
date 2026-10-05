export default function FooterMap() {
 const office = {
  name: 'Sheridan, WY (Corporate Office)',
  address: '30 N Gould St Ste #62633, Sheridan, WY 82801, United States',
  src: 'https://maps.google.com/maps?q=30%20N%20Gould%20St%20Ste%20%2362633,%20Sheridan,%20WY%2082801&t=&z=15&ie=UTF8&iwloc=&output=embed',
 };

 return (
  <div className="flex w-full flex-col">
   {/* Header bar */}
   <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container px-5 py-3 dark:border-dark-outline-variant dark:bg-dark-surface-container">
    <div className="flex items-center gap-2">
     <span className="inline-block size-2 rounded-full bg-brand" />
     <span className="text-xs font-semibold tracking-wide text-brand dark:text-dark-brand">
      ★ {office.name}
     </span>
    </div>
    <span className="text-xs text-ink-muted dark:text-dark-ink-muted">
     {office.address}
    </span>
   </div>

   {/* Map iframe */}
   <div className="relative h-64 w-full md:h-80">
    <iframe
     src={office.src}
     title={`Map — ${office.name}`}
     width="100%"
     height="100%"
     style={{
      border: 0,
      position: 'absolute',
      inset: 0,
     }}
     allowFullScreen
     loading="lazy"
     referrerPolicy="no-referrer-when-downgrade"
    />
   </div>
  </div>
 );
}
