import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

import { ThemeProvider, useTheme, THEME_STORAGE_KEY } from '../ThemeContext.jsx';

describe('ThemeContext', () => {
 beforeEach(() => {
  localStorage.clear();
  document.documentElement.className = '';
 });

 it('provides default theme (light)', () => {
  const wrapper = ({ children }) => <ThemeProvider>{children}</ThemeProvider>;
  const { result } = renderHook(() => useTheme(), { wrapper });

  expect(result.current.dark).toBe(false);
  expect(typeof result.current.toggle).toBe('function');
 });

 it('toggles theme from light to dark', () => {
  const wrapper = ({ children }) => <ThemeProvider>{children}</ThemeProvider>;
  const { result } = renderHook(() => useTheme(), { wrapper });

  expect(result.current.dark).toBe(false);

  act(() => {
   result.current.toggle();
  });

  expect(result.current.dark).toBe(true);
 });

 it('toggles theme from dark to light', () => {
  localStorage.setItem(THEME_STORAGE_KEY, 'dark');

  const wrapper = ({ children }) => <ThemeProvider>{children}</ThemeProvider>;
  const { result } = renderHook(() => useTheme(), { wrapper });

  expect(result.current.dark).toBe(true);

  act(() => {
   result.current.toggle();
  });

  expect(result.current.dark).toBe(false);
 });

 it('persists theme to localStorage', () => {
  const wrapper = ({ children }) => <ThemeProvider>{children}</ThemeProvider>;
  const { result } = renderHook(() => useTheme(), { wrapper });

  act(() => {
   result.current.toggle();
  });

  expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
 });

 it('loads theme from localStorage', () => {
  localStorage.setItem(THEME_STORAGE_KEY, 'dark');

  const wrapper = ({ children }) => <ThemeProvider>{children}</ThemeProvider>;
  const { result } = renderHook(() => useTheme(), { wrapper });

  expect(result.current.dark).toBe(true);
 });

 it('applies dark class to document element', () => {
  const wrapper = ({ children }) => <ThemeProvider>{children}</ThemeProvider>;
  const { result } = renderHook(() => useTheme(), { wrapper });

  act(() => {
   result.current.toggle();
  });

  expect(document.documentElement.classList.contains('dark')).toBe(true);
 });

 it('removes dark class when toggled back to light', () => {
  localStorage.setItem(THEME_STORAGE_KEY, 'dark');

  const wrapper = ({ children }) => <ThemeProvider>{children}</ThemeProvider>;
  const { result } = renderHook(() => useTheme(), { wrapper });

  act(() => {
   result.current.toggle();
  });

  expect(document.documentElement.classList.contains('dark')).toBe(false);
 });
});
