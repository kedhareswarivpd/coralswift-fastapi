import { describe, it, expect } from 'vitest';
import {
  adaptProject,
  serviceTaxonomyCategories,
  inferProjectServiceCategories,
  resolveProjectServiceCategories,
} from '../adapters.js';

describe('serviceTaxonomyCategories', () => {
 it('maps backend service records onto portfolio filter categories', () => {
  expect(serviceTaxonomyCategories({ slug: 'ai-solutions', name: 'AI Solutions' })).toContain('AI & ML');
  expect(serviceTaxonomyCategories({ slug: 'machine-learning', name: 'Machine Learning' })).toContain('AI & ML');
  expect(serviceTaxonomyCategories({ slug: 'data-analytics', name: 'Data Analytics' })).toContain('AI & ML');
  expect(serviceTaxonomyCategories({ slug: 'erp', name: 'ERP' })).toContain('ERP Systems');
  expect(serviceTaxonomyCategories({ slug: 'custom-software', name: 'Custom Software' })).toContain('ERP Systems');
  expect(serviceTaxonomyCategories({ slug: 'cloud-migration', name: 'Cloud Migration' })).toContain('Cloud Architecture');
  expect(serviceTaxonomyCategories({ slug: 'cloud-infrastructure', name: 'Cloud Infrastructure' })).toContain('Cloud Architecture');
 });

 it('does not misfire on word-boundary lookalikes ("maintenance" contains "ai")', () => {
  expect(serviceTaxonomyCategories({ slug: 'annual-maintenance', name: 'Annual Maintenance' })).not.toContain('AI & ML');
 });

 it('falls back to the broadest category so linked projects never vanish from every filter', () => {
  expect(serviceTaxonomyCategories({ slug: 'support', name: 'Support' })).toEqual(['ERP Systems']);
 });
});

describe('adaptProject', () => {
 it('preserves the backend service_id for taxonomy enrichment', () => {
  const adapted = adaptProject({
   slug: 'p1',
   title: 'P1',
   industry: 'Retail',
   service_id: 'abc-123',
   progress_percent: 100,
   technology_stack: ['React'],
   cover_image: 'img.png',
  });
  expect(adapted.serviceId).toBe('abc-123');
 });
});

describe('inferProjectServiceCategories', () => {
 it('classifies real seeded-project shapes into the portfolio taxonomy', () => {
  expect(inferProjectServiceCategories({ title: 'AI-Powered Claims Automation for Harbor Insurance', technology_stack: ['Python', 'TensorFlow'] }))
   .toContain('AI & ML');
  expect(inferProjectServiceCategories({ title: 'Streaming Media Recommendation Engine', technology_stack: ['Python', 'TensorFlow'] }))
   .toContain('AI & ML');
  expect(inferProjectServiceCategories({ title: 'Cloud-Native Core Banking Migration', technology_stack: ['AWS', 'Kubernetes', 'Terraform'] }))
   .toEqual(['Cloud Architecture']);
  expect(inferProjectServiceCategories({ title: 'DevOps CI/CD Transformation Program', technology_stack: ['Docker', 'Kubernetes'] }))
   .toContain('Cloud Architecture');
  expect(inferProjectServiceCategories({ title: 'Enterprise ERP Modernization for Ridgeline Manufacturing' }))
   .toContain('ERP Systems');
  expect(inferProjectServiceCategories({ title: 'Telecom Billing System Overhaul' })).toContain('ERP Systems');
 });

 it('does not misfire on lookalike words ("maintenance" contains "ai")', () => {
  expect(inferProjectServiceCategories({ title: 'Annual Maintenance Contract' })).not.toContain('AI & ML');
 });

 it('never returns an empty set — unmatched projects land in the broadest category', () => {
  expect(inferProjectServiceCategories({ title: 'Mystery Project' })).toEqual(['ERP Systems']);
  expect(inferProjectServiceCategories(undefined)).toEqual(['ERP Systems']);
 });
});

describe('resolveProjectServiceCategories', () => {
 const taxonomyByServiceId = { 'svc-1': ['AI & ML'] };

 it('prefers explicit services metadata (demo dataset)', () => {
  const project = { services: ['Cloud Architecture'], serviceId: 'svc-1' };
  expect(resolveProjectServiceCategories(project, taxonomyByServiceId)).toEqual(['Cloud Architecture']);
 });

 it('resolves a linked service_id when no explicit metadata exists', () => {
  expect(resolveProjectServiceCategories({ serviceId: 'svc-1' }, taxonomyByServiceId)).toEqual(['AI & ML']);
 });

 it('falls back to inference for unlinked/unresolved projects (live seeded data)', () => {
  expect(resolveProjectServiceCategories({ serviceId: null, title: 'Predictive Maintenance IoT Platform' }, {}))
   .toContain('AI & ML');
 });
});
