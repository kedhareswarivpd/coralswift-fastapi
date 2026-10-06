import { useState } from 'react';

const OFFICES = [
 {
  name: 'New Delhi',
  label: 'HQ',
  src: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d224345.83923192776!2d77.06889754725782!3d28.52758200617607!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfd5b347eb62d%3A0x52c2b7494e204dce!2sNew%20Delhi%2C%20Delhi!5e0!3m2!1sen!2sin!4v1718000000000',
 },
 {
  name: 'Bangalore',
  src: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d497698.9974143149!2d77.35074421738281!3d12.95428913773!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1670c9b44e6d%3A0xf8dfc3e8517e4fe0!2sBengaluru%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1718000000001',
 },
 {
  name: 'Mumbai',
  src: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d483398.1890188!2d72.74109954!3d19.08161!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c6306644edc1%3A0x5da4ed8f8d648c69!2sMumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1718000000002',
 },
 {
  name: 'Hyderabad',
  src: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d243684.54!2d78.3375!3d17.385!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb99daeaebd2c7%3A0xae93b78392bafbc2!2sHyderabad%2C%20Telangana!5e0!3m2!1sen!2sin!4v1718000000003',
 },
 {
  name: 'Pune',
  src: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d242234.37!2d73.7898!3d18.5204!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2bf2e67461101%3A0x828d43bf9d9ee343!2sPune%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1718000000004',
 },
 {
  name: 'Dubai',
  src: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d462560.30!2d55.2708!3d25.2048!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f43496ad9c645%3A0xbde66e5084295162!2sDubai%20-%20United%20Arab%20Emirates!5e0!3m2!1sen!2sin!4v1718000000005',
 },
 {
  name: 'Singapore',
  src: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d255282.06!2d103.8198!3d1.3521!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31da11238a8b9375%3A0x887869cf52abf5c4!2sSingapore!5e0!3m2!1sen!2sin!4v1718000000006',
 },
];

export default function FooterMap() {
 const [active, setActive] = useState(0);

 return (
  <div className="flex w-full flex-col">
   {/* Tab bar */}
   <div className="scrollbar-hide flex overflow-x-auto border-b border-outline-variant bg-surface-container dark:border-dark-outline-variant dark:bg-dark-surface-container">
    {OFFICES.map((office, i) => (
     <button
      key={office.name}
      onClick={() => setActive(i)}
      className={`flex-shrink-0 whitespace-nowrap border-b-2 px-4 py-2.5 text-xs font-semibold tracking-wide transition-colors ${
       active === i
        ? 'border-brand bg-white text-brand dark:bg-dark-surface'
        : 'border-transparent text-ink-muted hover:bg-surface-low hover:text-ink dark:text-dark-ink-muted dark:hover:bg-dark-surface dark:hover:text-dark-ink'
      }`}
     >
      {office.label ? `★ ${office.name}` : office.name}
     </button>
    ))}
   </div>

   {/* Map iframe */}
   <div className="relative h-64 w-full md:h-80">
    {OFFICES.map((office, i) => (
     <iframe
      key={office.name}
      src={office.src}
      title={`Map — ${office.name}`}
      width="100%"
      height="100%"
      style={{
       border: 0,
       position: 'absolute',
       inset: 0,
       opacity: active === i ? 1 : 0,
       pointerEvents: active === i ? 'auto' : 'none',
       transition: 'opacity 0.3s ease',
      }}
      allowFullScreen
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
     />
    ))}
   </div>
  </div>
 );
}
