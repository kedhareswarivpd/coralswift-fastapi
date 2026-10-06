import { useState, useEffect, useMemo, useCallback } from 'react';
import Icon from '../ui/Icon.jsx';
import Button from '../ui/Button.jsx';
import StatusBadge from '../ui/StatusBadge.jsx';
import { SkeletonTable } from '../ui/Skeleton.jsx';
import {
 servicesApi, eventsApi, blogsApi, solutionsApi, caseStudiesApi, downloadsApi,
 industriesApi, technologiesApi, productsApi, awardsApi, faqsApi, galleryApi,
 resourcesApi, testimonialsApi, categoriesApi, partnersApi, seoApi, pageContentApi,
 leadershipApi, officesApi, companyInfoApi, aboutContentApi, announcementsApi,
} from '../../api/cms.js';

import { FORM_INPUT_CLASS as BASE_INPUT_CLASS } from '../ui/formClasses.js';
import { validateResourceForm } from '../../schemas/admin.schema.js';

const FORM_INPUT_CLASS = `${BASE_INPUT_CLASS} w-full`;

const TEXT = { kind: 'text' };
const TEXTAREA = { kind: 'textarea' };
const NUMBER = { kind: 'number' };
const PUBLISHED = { name: 'is_published', label: 'Published', kind: 'checkbox' };

const RESOURCES = [
 {
  key: 'services', label: 'Services', icon: 'settings', api: servicesApi,
  // Full field set per the Service Content Workflow (source PDF §6):
  // Overview → Business Problems → Solutions → Features → Benefits →
  // Process → Technology Stack → Deliverables → Industries → Gallery →
  // FAQs → CTA. Gallery/FAQs/CTA are rendered from their own separate
  // admin resources (Gallery, FAQ) filtered by this service, not
  // service-specific fields on the Service record itself — matching how
  // the backend's ServiceCreate/Out schema actually models it.
  title: (i) => i.name, fields: [
   { name: 'name', label: 'Name', ...TEXT }, { name: 'slug', label: 'Slug', ...TEXT },
   { name: 'icon', label: 'Icon', ...TEXT }, { name: 'cover_image', label: 'Cover Image URL', ...TEXT },
   { name: 'overview', label: 'Overview', ...TEXTAREA },
   { name: 'business_problems', label: 'Business Problems', ...TEXTAREA },
   { name: 'solutions', label: 'Solutions', ...TEXTAREA },
   { name: 'features', label: 'Features (one per line)', kind: 'list' },
   { name: 'benefits', label: 'Benefits (one per line)', kind: 'list' },
   { name: 'process', label: 'Process steps (one per line)', kind: 'labelList' },
   { name: 'technology_stack', label: 'Technology Stack (one per line)', kind: 'list' },
   { name: 'deliverables', label: 'Deliverables (one per line)', kind: 'list' },
   { name: 'related_industries', label: 'Related Industries (slugs, one per line — set on create only)', kind: 'list' },
   { name: 'gallery', label: 'Gallery (image URLs, one per line)', kind: 'list' },
   { name: 'faqs', label: 'FAQs ("Question :: Answer", one per line)', kind: 'qaList' },
   { name: 'order', label: 'Display Order', ...NUMBER }, PUBLISHED,
  ],
 },
 {
  key: 'solutions', label: 'Solutions', icon: 'cloud', api: solutionsApi,
  title: (i) => i.name, fields: [
   { name: 'name', label: 'Name', ...TEXT }, { name: 'slug', label: 'Slug', ...TEXT },
   { name: 'icon', label: 'Icon', ...TEXT }, { name: 'cover_image', label: 'Cover Image URL', ...TEXT },
   { name: 'overview', label: 'Overview', ...TEXTAREA },
   { name: 'problem_statement', label: 'Problem Statement', ...TEXTAREA },
   { name: 'approach', label: 'Approach (one per line)', kind: 'list' },
   { name: 'outcomes', label: 'Outcomes (one per line)', kind: 'list' },
   { name: 'related_industries', label: 'Related industries (slugs, one per line)', kind: 'list' },
   { name: 'related_services', label: 'Related services (slugs, one per line)', kind: 'list' },
   { name: 'order', label: 'Display Order', ...NUMBER }, PUBLISHED,
  ],
 },
 {
  key: 'caseStudies', label: 'Case Studies', icon: 'description', api: caseStudiesApi,
  title: (i) => i.title, fields: [
   { name: 'title', label: 'Title', ...TEXT }, { name: 'slug', label: 'Slug', ...TEXT },
   { name: 'client_name', label: 'Client name', ...TEXT }, { name: 'industry', label: 'Industry', ...TEXT },
   { name: 'problem', label: 'Problem', ...TEXTAREA }, { name: 'solution', label: 'Solution', ...TEXTAREA },
   { name: 'implementation', label: 'Implementation', ...TEXTAREA },
   { name: 'result', label: 'Result', ...TEXTAREA }, { name: 'roi', label: 'ROI', ...TEXT },
   { name: 'customer_feedback', label: 'Customer Feedback', ...TEXTAREA },
   { name: 'download_url', label: 'Download URL', ...TEXT },
   { name: 'downloads', label: 'Additional Downloads ("Label :: URL", one per line)', kind: 'linkList' },
   { name: 'cover_image', label: 'Cover Image URL', ...TEXT }, PUBLISHED,
  ],
 },
 {
  key: 'blogs', label: 'Blog Posts', icon: 'article', api: blogsApi,
  title: (i) => i.title, fields: [
   { name: 'title', label: 'Title', ...TEXT }, { name: 'slug', label: 'Slug', ...TEXT },
   { name: 'excerpt', label: 'Excerpt', ...TEXTAREA }, { name: 'content', label: 'Content', ...TEXTAREA },
   { name: 'tags', label: 'Tags (one per line)', kind: 'list' },
   { name: 'status', label: 'Status', kind: 'select', options: ['draft', 'published', 'archived'] },
  ],
 },
 {
  key: 'events', label: 'Events', icon: 'event', api: eventsApi,
  title: (i) => i.title, fields: [
   { name: 'title', label: 'Title', ...TEXT }, { name: 'slug', label: 'Slug', ...TEXT },
   { name: 'description', label: 'Description', ...TEXTAREA }, { name: 'location', label: 'Location', ...TEXT },
   { name: 'start_date', label: 'Start date', kind: 'datetime' }, { name: 'end_date', label: 'End date', kind: 'datetime' },
   { name: 'is_virtual', label: 'Virtual event', kind: 'checkbox' }, PUBLISHED,
  ],
 },
 {
  key: 'downloads', label: 'Downloads', icon: 'download', api: downloadsApi,
  title: (i) => i.title, fields: [
   { name: 'title', label: 'Title', ...TEXT }, { name: 'description', label: 'Description', ...TEXTAREA },
   { name: 'file_url', label: 'File URL', ...TEXT }, { name: 'file_type', label: 'File type (e.g. PDF)', ...TEXT },
   { name: 'category', label: 'Category', ...TEXT }, { name: 'requires_lead', label: 'Requires lead capture', kind: 'checkbox' }, PUBLISHED,
  ],
 },
 {
  key: 'industries', label: 'Industries', icon: 'business', api: industriesApi,
  title: (i) => i.name, fields: [
   { name: 'name', label: 'Name', ...TEXT }, { name: 'slug', label: 'Slug', ...TEXT },
   { name: 'icon', label: 'Icon', ...TEXT }, { name: 'description', label: 'Description', ...TEXTAREA }, PUBLISHED,
  ],
 },
 {
  key: 'technologies', label: 'Technologies', icon: 'code', api: technologiesApi,
  title: (i) => i.name, fields: [
   { name: 'name', label: 'Name', ...TEXT },
   { name: 'category', label: 'Category', kind: 'select', options: ['frontend', 'backend', 'database', 'cloud', 'devops', 'ai_ml', 'mobile', 'other'] },
   { name: 'logo', label: 'Logo URL', ...TEXT }, { name: 'description', label: 'Description', ...TEXTAREA },
  ],
 },
 {
  key: 'products', label: 'Products', icon: 'inventory_2', api: productsApi,
  title: (i) => i.name, fields: [
   { name: 'name', label: 'Name', ...TEXT }, { name: 'slug', label: 'Slug', ...TEXT },
   { name: 'tagline', label: 'Tagline', ...TEXT }, { name: 'icon', label: 'Icon', ...TEXT },
   { name: 'description', label: 'Description', ...TEXTAREA },
   { name: 'features', label: 'Features (one per line)', kind: 'list' }, PUBLISHED,
  ],
 },
 {
  key: 'awards', label: 'Awards', icon: 'trophy', api: awardsApi,
  title: (i) => i.title, fields: [
   { name: 'title', label: 'Title', ...TEXT }, { name: 'issued_by', label: 'Issued by', ...TEXT },
   { name: 'year', label: 'Year', ...NUMBER }, { name: 'description', label: 'Description', ...TEXTAREA }, PUBLISHED,
  ],
 },
 {
  key: 'announcements', label: 'Announcements', icon: 'campaign', api: announcementsApi,
  title: (i) => i.title, fields: [
   { name: 'title', label: 'Title', ...TEXT }, { name: 'body', label: 'Body', ...TEXTAREA },
   { name: 'order', label: 'Display Order', ...NUMBER },
   { name: 'expires_at', label: 'Expires at', kind: 'datetime' }, PUBLISHED,
  ],
 },
 {
  key: 'faqs', label: 'FAQ', icon: 'help_outline', api: faqsApi,
  title: (i) => i.question, fields: [
   { name: 'question', label: 'Question', ...TEXT }, { name: 'answer', label: 'Answer', ...TEXTAREA },
   { name: 'category', label: 'Category', ...TEXT }, { name: 'order', label: 'Order', ...NUMBER }, PUBLISHED,
  ],
 },
 {
  key: 'gallery', label: 'Gallery', icon: 'photo_library', api: galleryApi,
  title: (i) => i.title || i.image_url, fields: [
   { name: 'title', label: 'Caption', ...TEXT }, { name: 'image_url', label: 'Image URL', ...TEXT },
   { name: 'album_name', label: 'Album name', ...TEXT },
   { name: 'type', label: 'Type', kind: 'select', options: ['image', 'video'] }, PUBLISHED,
  ],
 },
 {
  key: 'resources', label: 'Resources', icon: 'menu_book', api: resourcesApi,
  title: (i) => i.title, fields: [
   { name: 'title', label: 'Title', ...TEXT }, { name: 'slug', label: 'Slug', ...TEXT },
   { name: 'resource_type', label: 'Type', ...TEXT }, { name: 'description', label: 'Description', ...TEXTAREA },
   { name: 'file_url', label: 'File URL', ...TEXT }, PUBLISHED,
  ],
 },
 {
  key: 'testimonials', label: 'Testimonials', icon: 'rate_review', api: testimonialsApi,
  title: (i) => i.author_name, fields: [
   { name: 'author_name', label: 'Author', ...TEXT }, { name: 'author_title', label: 'Title', ...TEXT },
   { name: 'company_name', label: 'Company', ...TEXT }, { name: 'content', label: 'Content', ...TEXTAREA },
   { name: 'rating', label: 'Rating (1-5)', ...NUMBER }, PUBLISHED,
  ],
 },
 {
  key: 'categories', label: 'Categories', icon: 'label', api: categoriesApi,
  title: (i) => i.name, fields: [
   { name: 'name', label: 'Name', ...TEXT }, { name: 'slug', label: 'Slug', ...TEXT },
   { name: 'type', label: 'Type', kind: 'select', options: ['blog', 'gallery', 'download', 'event'] },
  ],
 },
 {
  key: 'partners', label: 'Partners', icon: 'handshake', api: partnersApi,
  title: (i) => i.name, fields: [
   { name: 'name', label: 'Name', ...TEXT }, { name: 'logo', label: 'Logo URL', ...TEXT },
   { name: 'website', label: 'Website', ...TEXT },
   { name: 'type', label: 'Type', kind: 'select', options: ['technology_partner', 'business_partner', 'reseller'] }, PUBLISHED,
  ],
 },
 {
  key: 'seo', label: 'SEO', icon: 'search', api: seoApi,
  title: (i) => i.page_path, fields: [
   { name: 'page_path', label: 'Page path (e.g. /services)', ...TEXT },
   { name: 'title', label: 'Meta title', ...TEXT }, { name: 'description', label: 'Meta description', ...TEXTAREA },
   { name: 'keywords', label: 'Keywords', ...TEXT },
   { name: 'og_title', label: 'OG title', ...TEXT }, { name: 'og_description', label: 'OG description', ...TEXTAREA },
   { name: 'og_image', label: 'OG image URL', ...TEXT },
   { name: 'canonical_url', label: 'Canonical URL', ...TEXT },
   { name: 'no_index', label: 'No-index (hide from search engines)', kind: 'checkbox' },
  ],
 },
 {
  key: 'pageContent', label: 'Page Content', icon: 'description', api: pageContentApi,
  title: (i) => i.title, fields: [
   { name: 'slug', label: 'Slug (e.g. about-us)', ...TEXT }, { name: 'title', label: 'Title', ...TEXT },
   { name: 'content', label: 'Content', ...TEXTAREA }, PUBLISHED,
  ],
 },
 {
  key: 'leadership', label: 'Leadership', icon: 'groups', api: leadershipApi,
  title: (i) => i.name, fields: [
   { name: 'name', label: 'Name', ...TEXT }, { name: 'title', label: 'Title', ...TEXT },
   { name: 'bio', label: 'Bio', ...TEXTAREA }, { name: 'photo_url', label: 'Photo URL', ...TEXT },
   { name: 'linkedin', label: 'LinkedIn URL', ...TEXT }, { name: 'order', label: 'Order', ...NUMBER }, PUBLISHED,
  ],
 },
 {
  key: 'offices', label: 'Offices', icon: 'location_on', api: officesApi,
  title: (i) => i.city, fields: [
   { name: 'city', label: 'City', ...TEXT }, { name: 'country', label: 'Country', ...TEXT },
   { name: 'description', label: 'Description (e.g. "HQ & Innovation Lab")', ...TEXT },
   { name: 'address', label: 'Full Address', ...TEXTAREA },
   { name: 'is_headquarters', label: 'Headquarters', kind: 'checkbox' },
   { name: 'order', label: 'Order', ...NUMBER }, PUBLISHED,
  ],
 },
];

// Singleton settings-style content ("Company & About") — company profile
// (name/tagline/HQ/contact — Footer.jsx) and about-page copy (mission,
// core values, timeline, certifications, stats). Both are stored as a
// single JSON blob per key on the existing `settings` table (see
// backend/app/routers/site_content.py), so they don't fit the generic
// list-CRUD `RESOURCES` shape above (no id, no list of rows) — they get
// their own small get/update panel instead.
const SITE_CONTENT_KEY = 'siteContent';

// Best-effort singularization for the "New {X}" button label. A blind
// "chop the last character" (the previous implementation) silently
// mangles anything that isn't a plain "-s" plural — "SEO" became "SE",
// "FAQ" became "FA", "Technologies"/"Categories" became "Technologie"/
// "Categorie". Handles "-ies" plurals and plain "-s" plurals; anything
// else (SEO, FAQ, Gallery, Portfolio, Page Content) is already singular
// and is left as-is rather than guessed at.
function singularize(label) {
 if (label.endsWith('ies')) return `${label.slice(0, -3)}y`;
 if (label.endsWith('s') && !label.endsWith('ss')) return label.slice(0, -1);
 return label;
}

function splitList(value) {
 return String(value ?? '')
  .split('\n')
  .map((s) => s.trim())
  .filter(Boolean);
}

function joinList(value) {
 return Array.isArray(value) ? value.join('\n') : '';
}

function toForm(item, fields) {
 const form = {};
 fields.forEach((f) => {
  const raw = item?.[f.name];
  if (f.kind === 'list') form[f.name] = joinList(raw);
  // Some backend fields (e.g. Service.process) are typed `list[dict]`, not
  // `list[str]` — each line becomes {label: line} on submit so the plain
  // one-per-line textarea UI still works against that stricter type.
  else if (f.kind === 'labelList') form[f.name] = joinList((raw || []).map((r) => (typeof r === 'string' ? r : r?.label ?? '')));
  // FAQ pairs (Service.faqs / list[dict] with question+answer keys) — one
  // "Question :: Answer" per line in the textarea UI.
  else if (f.kind === 'qaList') form[f.name] = joinList((raw || []).map((r) => `${r?.question ?? ''} :: ${r?.answer ?? ''}`));
  // Label+URL pairs (Project.downloads / CaseStudy.downloads) — one
  // "Label :: URL" per line.
  else if (f.kind === 'linkList') form[f.name] = joinList((raw || []).map((r) => `${r?.label ?? ''} :: ${r?.url ?? ''}`));
  else if (f.kind === 'checkbox') form[f.name] = !!raw;
  else form[f.name] = raw ?? '';
 });
 return form;
}

function toPayload(form, fields) {
 const payload = {};
 fields.forEach((f) => {
  let value = form[f.name];
  if (f.kind === 'list') value = splitList(value);
  else if (f.kind === 'labelList') value = splitList(value).map((label) => ({ label }));
  else if (f.kind === 'qaList') {
   value = splitList(value).map((line) => {
    const [question, ...rest] = line.split('::');
    return { question: question.trim(), answer: rest.join('::').trim() };
   });
  } else if (f.kind === 'linkList') {
   value = splitList(value).map((line) => {
    const [label, ...rest] = line.split('::');
    return { label: label.trim(), url: rest.join('::').trim() };
   });
  }
  else if (f.kind === 'number') value = value === '' ? null : Number(value);
  else if (f.kind === 'checkbox') value = !!value;
  else if (f.kind === 'text' && value === '') value = null;
  if (f.name !== 'is_published' || value !== undefined) payload[f.name] = value;
 });
 return payload;
}

function Field({ field, value, onChange }) {
 if (field.kind === 'textarea') {
  return <textarea rows={3} placeholder={field.label} value={value} onChange={(e) => onChange(field.name, e.target.value)} className={FORM_INPUT_CLASS} />;
 }
 if (field.kind === 'list' || field.kind === 'labelList' || field.kind === 'qaList' || field.kind === 'linkList') {
  return <textarea rows={3} placeholder={`${field.label} (one per line)`} value={value} onChange={(e) => onChange(field.name, e.target.value)} className={FORM_INPUT_CLASS} />;
 }
 if (field.kind === 'select') {
  return (
   <select value={value} onChange={(e) => onChange(field.name, e.target.value)} className={FORM_INPUT_CLASS}>
    {field.options.map((o) => <option key={o} value={o}>{o.replace(/_/g, ' ')}</option>)}
   </select>
  );
 }
 if (field.kind === 'checkbox') {
  return (
   <label className="flex items-center gap-2 text-body-sm text-ink-muted dark:text-dark-ink-muted">
    <input type="checkbox" checked={value} onChange={(e) => onChange(field.name, e.target.checked)} />{field.label}
   </label>
  );
 }
 return <input type={field.kind === 'datetime' ? 'datetime-local' : field.kind === 'number' ? 'number' : 'text'} placeholder={field.label} value={value} onChange={(e) => onChange(field.name, e.target.value)} className={FORM_INPUT_CLASS} />;
}

// A single "Save" section for one singleton JSON blob (company info or
// about-page content). `value` is edited as raw JSON text — simplest UI
// that still round-trips arbitrary structured content (arrays of core
// values, timeline entries, etc.) without a bespoke editor per shape.
function JsonBlobEditor({ title, description, api }) {
 const [text, setText] = useState('');
 const [loading, setLoading] = useState(true);
 const [saving, setSaving] = useState(false);
 const [error, setError] = useState('');
 const [saved, setSaved] = useState(false);

 useEffect(() => {
  setLoading(true);
  api.get()
   .then((res) => setText(JSON.stringify(res?.data ?? {}, null, 2)))
   .catch(() => setText('{}'))
   .finally(() => setLoading(false));
 }, [api]);

 const handleSave = async () => {
  setError('');
  setSaved(false);
  let parsed;
  try {
   parsed = JSON.parse(text);
  } catch {
   setError('Invalid JSON — please fix the syntax before saving.');
   return;
  }
  setSaving(true);
  try {
   await api.update(parsed);
   setSaved(true);
  } catch (err) {
   setError(err.message || 'Could not save.');
  } finally {
   setSaving(false);
  }
 };

 return (
  <div className="overflow-hidden rounded-lg border border-outline-variant bg-white dark:border-dark-outline-variant dark:bg-dark-surface">
   <div className="border-b border-outline-variant p-stack-lg dark:border-dark-outline-variant">
    <h3 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand">{title}</h3>
    <p className="mt-1 text-body-sm text-ink-muted dark:text-dark-ink-muted">{description}</p>
   </div>
   <div className="space-y-4 p-stack-lg">
    {loading ? (
     <SkeletonTable rows={4} columns={1} />
    ) : (
     <textarea
      rows={14}
      value={text}
      onChange={(e) => { setText(e.target.value); setSaved(false); }}
      spellCheck={false}
      className={`${FORM_INPUT_CLASS} font-mono text-body-xs`}
     />
    )}
    {error && (
     <p className="flex items-center gap-1 text-body-sm font-semibold text-status-error-text"><Icon name="error" className="text-base" />{error}</p>
    )}
    {saved && !error && (
     <p className="flex items-center gap-1 text-body-sm font-semibold text-status-success-text"><Icon name="check_circle" className="text-base" />Saved.</p>
    )}
    <Button variant="primary" size="md" onClick={handleSave} disabled={loading || saving}>
     {saving ? 'Saving...' : 'Save'}
    </Button>
   </div>
  </div>
 );
}

function SiteContentEditor() {
 return (
  <div className="space-y-stack-lg">
   <JsonBlobEditor
    title="Company Info"
    description="Name, tagline, HQ address, contact details — rendered in the site Footer. Edited as JSON (name, legalName, tagline, website, email, founded, hq, offices)."
    api={companyInfoApi}
   />
   <JsonBlobEditor
    title="About Page Content"
    description="Core values, company timeline, certifications, and impact stats shown on the About page. Edited as JSON (coreValues, timeline, certifications, aboutStats)."
    api={aboutContentApi}
   />
  </div>
 );
}

export default function ContentManager() {
 const [activeKey, setActiveKey] = useState('services');
 const resource = useMemo(() => RESOURCES.find((r) => r.key === activeKey), [activeKey]);
 const isSiteContent = activeKey === SITE_CONTENT_KEY;

 const [items, setItems] = useState([]);
 const [loading, setLoading] = useState(true);
 const [showForm, setShowForm] = useState(false);
 const [editing, setEditing] = useState(null);
 const [form, setForm] = useState({});
 const [error, setError] = useState('');
 const [fieldErrors, setFieldErrors] = useState({});
 const [submitting, setSubmitting] = useState(false);

 const load = useCallback(() => {
  if (!resource) return;
  setLoading(true);
  resource.api.list()
   .then((res) => setItems(Array.isArray(res?.data) ? res.data : []))
   .catch(() => setItems([]))
   .finally(() => setLoading(false));
 }, [resource]);

 useEffect(() => {
  if (resource) load();
 }, [resource, load]);

 const startCreate = () => {
  setForm(toForm({}, resource.fields));
  setEditing(null);
  setError('');
  setFieldErrors({});
  setShowForm(true);
 };

 const startEdit = (item) => {
  setForm(toForm(item, resource.fields));
  setEditing(item);
  setError('');
  setFieldErrors({});
  setShowForm(true);
 };

 const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setFieldErrors({});

  const clientErrors = validateResourceForm(resource.fields, form);
  if (Object.keys(clientErrors).length > 0) {
   setFieldErrors(clientErrors);
   setError('Please fix the errors below.');
   return;
  }

  setSubmitting(true);
  try {
   const payload = toPayload(form, resource.fields);
   if (editing) {
    await resource.api.update(editing.id, payload);
   } else {
    await resource.api.create(payload);
   }
   setShowForm(false);
   load();
  } catch (err) {
   const errs = err.errors || [];
   if (errs.length > 0) {
    const mapped = {};
    errs.forEach((e) => { if (e.field) mapped[e.field] = e.message; });
    setFieldErrors(mapped);
    setError(err.message || 'Please fix the errors below.');
   } else {
    setError(err.message || 'Could not save the item.');
   }
  } finally {
   setSubmitting(false);
  }
 };

 const togglePublish = async (item) => {
  try {
   await resource.api.update(item.id, { is_published: !item.is_published });
   load();
  } catch { /* keep row unchanged on failure */ }
 };

 const remove = async (item) => {
  if (!window.confirm(`Delete "${resource.title(item)}"?`)) return;
  try {
   await resource.api.remove(item.id);
   load();
  } catch { /* keep row on failure */ }
 };

 const hasPublish = !!resource && resource.fields.some((f) => f.name === 'is_published');

 return (
  <div className="space-y-stack-lg">
   <div className="flex flex-wrap gap-2">
    {RESOURCES.map((r) => (
     <button
      key={r.key}
      onClick={() => { setActiveKey(r.key); setShowForm(false); }}
      className={`flex items-center gap-2 rounded-full px-4 py-2 font-label-caps text-label-caps uppercase transition-all ${
       activeKey === r.key ? 'bg-brand text-white' : 'bg-surface-container text-ink-muted hover:bg-outline-variant dark:bg-dark-surface-container dark:text-dark-ink-muted'
      }`}
     >
      <Icon name={r.icon} className="text-lg" />{r.label}
     </button>
    ))}
    <button
     onClick={() => { setActiveKey(SITE_CONTENT_KEY); setShowForm(false); }}
     className={`flex items-center gap-2 rounded-full px-4 py-2 font-label-caps text-label-caps uppercase transition-all ${
      isSiteContent ? 'bg-brand text-white' : 'bg-surface-container text-ink-muted hover:bg-outline-variant dark:bg-dark-surface-container dark:text-dark-ink-muted'
     }`}
    >
     <Icon name="apartment" className="text-lg" />Company & About
    </button>
   </div>

   {isSiteContent ? (
    <SiteContentEditor />
   ) : (
   <div className="overflow-hidden rounded-lg border border-outline-variant bg-white dark:border-dark-outline-variant dark:bg-dark-surface">
    <div className="flex items-center justify-between gap-4 border-b border-outline-variant p-stack-lg dark:border-dark-outline-variant">
     <h3 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand">
      {resource.label} <span className="text-body-sm font-normal text-ink-muted">({items.length})</span>
     </h3>
     <Button variant="primary" size="md" icon={<Icon name="add" />} onClick={showForm ? () => setShowForm(false) : startCreate}>
      {showForm ? 'Close' : `New ${singularize(resource.label) || 'Item'}`}
     </Button>
    </div>

    {showForm && (
     <form onSubmit={handleSubmit} className="space-y-4 border-b border-outline-variant bg-surface-container p-stack-lg dark:border-dark-outline-variant dark:bg-dark-surface-container">
      <div className="grid gap-4 sm:grid-cols-2">
       {resource.fields.map((f) => (
        <div key={f.name} className={['textarea', 'list', 'labelList', 'qaList', 'linkList'].includes(f.kind) ? 'sm:col-span-2' : ''}>
         <label className="mb-1 block text-body-sm font-medium text-ink dark:text-white">{f.label}</label>
         <Field field={f} value={form[f.name] ?? ''} onChange={(name, value) => setForm((prev) => ({ ...prev, [name]: value }))} />
         {fieldErrors[f.name] && (
          <p className="mt-1 flex items-center gap-1 text-body-xs font-semibold text-status-error-text">{fieldErrors[f.name]}</p>
         )}
        </div>
       ))}
      </div>
      {error && (
       <div className="rounded-lg border border-status-error bg-status-error/10 px-4 py-3">
        <p className="flex items-center gap-1 text-body-sm font-semibold text-status-error-text"><Icon name="error" className="text-base" />{error}</p>
        {Object.keys(fieldErrors).length > 0 && (
         <ul className="mt-2 list-inside list-disc text-body-xs text-status-error-text">
          {Object.entries(fieldErrors).map(([field, msg]) => (
           <li key={field}><strong>{resource.fields.find((f) => f.name === field)?.label || field}:</strong> {msg}</li>
          ))}
         </ul>
        )}
       </div>
      )}
      <div className="flex gap-2">
       <Button type="submit" variant="primary" size="md" disabled={submitting}>
        {submitting ? 'Saving...' : editing ? 'Update' : 'Create'}
       </Button>
       <Button type="button" variant="outline" size="md" onClick={() => setShowForm(false)}>Cancel</Button>
      </div>
     </form>
    )}

    {loading ? (
     <div className="p-stack-lg"><SkeletonTable rows={6} columns={3} /></div>
    ) : (
     <div className="responsive-table overflow-x-auto">
      <table className="w-full text-left">
       <thead className="bg-surface-container font-label-caps text-label-caps uppercase text-ink-muted dark:bg-dark-surface-container dark:text-dark-ink-muted">
        <tr>
         <th className="px-stack-lg py-4">Name</th>
         <th className="px-stack-lg py-4">Status</th>
         <th className="px-stack-lg py-4 text-right">Actions</th>
        </tr>
       </thead>
       <tbody className="divide-y divide-outline-variant dark:divide-dark-outline-variant">
        {items.map((item) => (
         <tr key={item.id} className="transition-colors hover:bg-accent-cyan-pale dark:bg-blue-900/30">
          <td data-label="Name" className="px-stack-lg py-4 text-body-md text-brand-dark dark:text-dark-brand">{resource.title(item)}</td>
          <td data-label="Status" className="px-stack-lg py-4">
           {hasPublish ? (
            <button onClick={() => togglePublish(item)} className="cursor-pointer">
             <StatusBadge variant={item.is_published ? 'success' : 'neutral'}>{item.is_published ? 'published' : 'draft'}</StatusBadge>
            </button>
           ) : (
            <StatusBadge variant="neutral">{item.slug || item.category || '—'}</StatusBadge>
           )}
          </td>
          <td data-label="Actions" className="px-stack-lg py-4 text-right">
           <div className="flex justify-end gap-2">
            <button onClick={() => startEdit(item)} aria-label={`Edit ${resource.title(item)}`} className="text-ink-muted transition-colors hover:text-brand" title="Edit">
             <Icon name="edit" className="text-lg" />
            </button>
            <button onClick={() => remove(item)} aria-label={`Delete ${resource.title(item)}`} className="text-ink-muted transition-colors hover:text-status-error-text" title="Delete">
             <Icon name="delete" className="text-lg" />
            </button>
           </div>
          </td>
         </tr>
        ))}
        {!items.length && (
         <tr><td data-label="Name" colSpan={3} className="px-stack-lg py-8 text-center text-body-sm text-ink-muted">No {resource.label.toLowerCase()} found.</td></tr>
        )}
       </tbody>
      </table>
     </div>
    )}
   </div>
   )}
  </div>
 );
}
