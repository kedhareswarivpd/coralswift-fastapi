import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import App from '../App.jsx';
import { ThemeProvider } from '../context/ThemeContext.jsx';

describe('App', () => {
 it('renders without crashing', () => {
  const { container } = render(
   <MemoryRouter initialEntries={['/']}>
    <ThemeProvider>
     <App />
    </ThemeProvider>
   </MemoryRouter>,
  );
  expect(container).toBeInTheDocument();
  expect(container.innerHTML.length).toBeGreaterThan(0);
 });

 it('renders a route for /services', () => {
  const { container } = render(
   <MemoryRouter initialEntries={['/services']}>
    <ThemeProvider>
     <App />
    </ThemeProvider>
   </MemoryRouter>,
  );
  expect(container).toBeInTheDocument();
  expect(container.innerHTML.length).toBeGreaterThan(0);
 });
});
