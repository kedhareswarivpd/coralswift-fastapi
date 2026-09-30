import { useTheme } from '../../context/ThemeContext.jsx';
import Icon from '../ui/Icon.jsx';

export default function ThemeToggle({ className = '' }) {
 const { dark, toggle } = useTheme();
 return (
  <button
   onClick={toggle}
   aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
   className={`relative flex h-7 w-14 items-center rounded-full border border-outline-variant bg-surface-container px-1 transition-colors duration-300 dark:border-dark-outline-variant dark:bg-dark-surface-low ${className}`}
  >
   <span
    className={`absolute left-1 flex size-5 items-center justify-center rounded-full text-xs shadow transition-all duration-300 ${
     dark ? 'translate-x-7 bg-brand text-white' : 'translate-x-0 bg-white text-amber-500'
    }`}
   >
    <Icon name={dark ? 'dark_mode' : 'light_mode'} className="text-sm leading-none" />
   </span>
  </button>
 );
}
