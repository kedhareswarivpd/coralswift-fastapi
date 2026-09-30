import useScrollReveal from '../../hooks/useScrollReveal.js';

const fromClass = {
 up: 'reveal',
 left: 'reveal-left',
 right: 'reveal-right',
 zoom: 'reveal-zoom',
};

export default function Reveal({ as: Tag = 'div', className = '', children, from = 'up', delay, ...rest }) {
 const [ref, visible] = useScrollReveal();
 const base = fromClass[from] ?? 'reveal';

 return (
  <Tag
   ref={ref}
   className={`${base} ${visible ? 'reveal-visible' : ''} ${className}`}
   style={delay != null ? { transitionDelay: `${delay}ms`, ...rest.style } : rest.style}
   {...rest}
  >
   {children}
  </Tag>
 );
}
