import { useEffect, useRef, useState } from 'react';

export default function useScrollReveal(options = { threshold: 0.1 }) {
  const ref = useRef(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, optionsRef.current);

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return [ref, visible];
}
