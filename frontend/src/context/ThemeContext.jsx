import { createContext, useContext, useEffect, useState } from 'react';

export const THEME_STORAGE_KEY = 'coralswift.theme';

// One-time cleanup for browsers that previously auto-detected dark mode via prefers-color-scheme
try {
 if (typeof window !== 'undefined' && localStorage.getItem('coralswift.theme_migrated') !== '1') {
  localStorage.removeItem(THEME_STORAGE_KEY);
  localStorage.setItem('coralswift.theme_migrated', '1');
  document.documentElement.classList.remove('dark');
 }
} catch {
 // Ignore localStorage access errors (e.g. incognito/restricted)
}

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
 const [dark, setDark] = useState(() => {
  try {
   const stored = localStorage.getItem(THEME_STORAGE_KEY);
   if (stored) return stored === 'dark';
   // Default to official corporate light theme; do not auto-detect OS dark mode
   return false;
  } catch {
   return false;
  }
 });

 useEffect(() => {
  document.documentElement.classList.toggle('dark', dark);
  localStorage.setItem(THEME_STORAGE_KEY, dark ? 'dark' : 'light');
 }, [dark]);

 return (
  <ThemeContext.Provider value={{ dark, toggle: () => setDark((d) => !d) }}>
   {children}
  </ThemeContext.Provider>
 );
}

export const useTheme = () => useContext(ThemeContext);
