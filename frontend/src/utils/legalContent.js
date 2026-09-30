// Adapts a `PageContent` API record (backend/app/models/page_content.py —
// { slug, title, content, is_published }) into the shape LegalContent.jsx
// renders live CMS content with. `content` is admin-authored HTML (see
// backend/app/seeders/cms_seed.py's legal-page seed entries), sanitized at
// render time. There's no dedicated "last updated" field on the model, so
// this reuses the row's own `updated_at` timestamp — it changes exactly
// when an admin edits the content, which is what the label is for.
export function adaptPageContent(item) {
 return {
  title: item.title,
  lastUpdated: item.updated_at
   ? new Date(item.updated_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
   : '',
  html: item.content || '',
 };
}
