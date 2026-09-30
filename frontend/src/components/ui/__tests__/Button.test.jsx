import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Button from '../Button.jsx';

describe('Button', () => {
 it('renders with children', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
 });

 it('accepts variant props and applies correct classes', () => {
  const { container } = render(<Button variant="outline">Outline</Button>);
  const btn = container.firstChild;
  expect(btn.className).toContain('border');
  expect(btn.className).toContain('border-outline-variant');
 });

 it('fires onClick handler', () => {
  const handleClick = vi.fn();
  render(<Button onClick={handleClick}>Clickable</Button>);
  fireEvent.click(screen.getByRole('button', { name: /clickable/i }));
  expect(handleClick).toHaveBeenCalledTimes(1);
 });

 it('renders as a link when as prop is provided', () => {
  render(<Button as="a" href="/test">Link Button</Button>);
  const link = screen.getByRole('link', { name: /link button/i });
  expect(link).toBeInTheDocument();
  expect(link.getAttribute('href')).toBe('/test');
 });

 it('applies primary variant by default', () => {
  const { container } = render(<Button>Primary</Button>);
  const btn = container.firstChild;
  expect(btn.className).toContain('bg-brand');
 });

 it('applies size classes', () => {
  const { container } = render(<Button size="md">Medium</Button>);
  const btn = container.firstChild;
  expect(btn.className).toContain('h-11');
 });

 it('applies large size by default', () => {
  const { container } = render(<Button>Large</Button>);
  const btn = container.firstChild;
  expect(btn.className).toContain('h-[52px]');
 });

 it('renders icon when provided', () => {
  render(<Button icon={<span data-testid="icon">→</span>}>With Icon</Button>);
  expect(screen.getByTestId('icon')).toBeInTheDocument();
 });

 it('passes additional props to the element', () => {
  render(<Button disabled>Disabled</Button>);
  expect(screen.getByRole('button')).toBeDisabled();
 });

 it('applies custom className', () => {
  const { container } = render(<Button className="custom-class">Custom</Button>);
  const btn = container.firstChild;
  expect(btn.className).toContain('custom-class');
 });

 it('has active scale animation class', () => {
  const { container } = render(<Button>Animated</Button>);
  const btn = container.firstChild;
  expect(btn.className).toContain('active:scale-95');
 });
});
