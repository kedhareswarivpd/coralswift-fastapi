import { createContext, useContext, useEffect, useState } from 'react';

export const THEME_STORAGE_KEY = 'coralswift.theme';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
 const [dark, setDark] = useState(() => {
  try {
   const stored = localStorage.getItem(THEME_STORAGE_KEY);
   if (stored) return stored === 'dark';
   return window.matchMedia('(prefers-color-scheme: dark)').matches;
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
