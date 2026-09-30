import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ContentManager from '../ContentManager.jsx';

const m = vi.hoisted(() => ({
 mockList: vi.fn(),
 mockCreate: vi.fn(),
 mockUpdate: vi.fn(),
 mockRemove: vi.fn(),
}));

vi.mock('../../../api/cms.js', () => {
 const emptyApi = () => ({ list: () => Promise.resolve({ data: [] }), create: vi.fn(), update: vi.fn(), remove: vi.fn() });
 return {
  servicesApi: { list: m.mockList, create: m.mockCreate, update: m.mockUpdate, remove: m.mockRemove },
  eventsApi: emptyApi(),
  blogsApi: emptyApi(),
  solutionsApi: emptyApi(),
  caseStudiesApi: emptyApi(),
  downloadsApi: emptyApi(),
  industriesApi: emptyApi(),
  technologiesApi: emptyApi(),
  productsApi: emptyApi(),
  awardsApi: emptyApi(),
  faqsApi: emptyApi(),
  galleryApi: emptyApi(),
  portfolioApi: emptyApi(),
  resourcesApi: emptyApi(),
  testimonialsApi: emptyApi(),
  categoriesApi: emptyApi(),
  partnersApi: emptyApi(),
  announcementsApi: emptyApi(),
  leadershipApi: emptyApi(),
  officesApi: emptyApi(),
  companyInfoApi: emptyApi(),
  aboutContentApi: emptyApi(),
  careersApi: emptyApi(),
  seoApi: emptyApi(),
  pageContentApi: emptyApi(),
 };
});

describe('ContentManager', () => {
 it('renders resource tabs', async () => {
  m.mockList.mockResolvedValue({ data: [] });
  render(<ContentManager />);
  expect(screen.getByRole('button', { name: /services/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /case studies/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /blog posts/i })).toBeInTheDocument();
  await waitFor(() => expect(m.mockList).toHaveBeenCalled());
 });

 it('lists fetched items', async () => {
  m.mockList.mockResolvedValue({ data: [{ id: '1', name: 'Cloud Migration', is_published: true }] });
  render(<ContentManager />);
  await waitFor(() => expect(screen.getByText('Cloud Migration')).toBeInTheDocument());
  expect(screen.getByText('published')).toBeInTheDocument();
 });

 it('shows empty state when nothing is returned', async () => {
  m.mockList.mockResolvedValue({ data: [] });
  render(<ContentManager />);
  await waitFor(() => expect(screen.getByText(/no services found/i)).toBeInTheDocument());
 });

 it('opens the create form', async () => {
  m.mockList.mockResolvedValue({ data: [] });
  render(<ContentManager />);
  fireEvent.click(screen.getByRole('button', { name: /new service/i }));
  expect(screen.getByPlaceholderText('Name')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument();
 });
});
