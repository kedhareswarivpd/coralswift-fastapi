import { apiRequest, toQueryString } from './client.js';

export function fetchIndustries(params = {}) {
  return apiRequest(`/industries${toQueryString({ is_published: true, ...params })}`);
}

export function fetchTechnologies(params = {}) {
  return apiRequest(`/technologies${toQueryString({ limit: 100, ...params })}`);
}

export function fetchProducts(params = {}) {
  return apiRequest(`/products${toQueryString({ is_published: true, ...params })}`);
}

export function fetchAwards(params = {}) {
  return apiRequest(`/awards${toQueryString({ is_published: true, ...params })}`);
}

export function fetchAnnouncements(params = {}) {
  return apiRequest(`/announcements${toQueryString({ is_published: true, ...params })}`);
}

export function fetchFaqs(params = {}) {
  return apiRequest(`/faqs${toQueryString({ is_published: true, ...params })}`);
}

// Single CMS page-content section by slug (e.g. legal pages) — the
// `page-content` router filters server-side on `slug` (see
// backend/app/routers/page_content.py's allowed_filters), so this returns
// at most one row in `data`.
export function fetchPageContent(slug) {
  return apiRequest(`/page-content${toQueryString({ slug, is_published: true })}`);
}

export function fetchGallery(params = {}) {
  return apiRequest(`/gallery${toQueryString({ is_published: true, limit: 100, ...params })}`);
}

export function fetchPortfolio(params = {}) {
  return apiRequest(`/portfolio${toQueryString({ limit: 100, ...params })}`);
}

export function fetchResources(params = {}) {
  return apiRequest(`/resources${toQueryString({ is_published: true, limit: 100, ...params })}`);
}

export function fetchSolutions(params = {}) {
  return apiRequest(`/solutions${toQueryString({ is_published: true, ...params })}`);
}

export function fetchCaseStudies(params = {}) {
  return apiRequest(`/case-studies${toQueryString({ is_published: true, ...params })}`);
}

export function fetchDownloads(params = {}) {
  return apiRequest(`/downloads${toQueryString({ is_published: true, ...params })}`);
}

export function fetchCategories(params = {}) {
  return apiRequest(`/categories${toQueryString({ ...params })}`);
}

export function fetchTestimonials(params = {}) {
  return apiRequest(`/testimonials${toQueryString({ ...params })}`);
}

export function fetchPartners(params = {}) {
  return apiRequest(`/partners${toQueryString({ is_published: true, ...params })}`);
}

export function fetchLeadership(params = {}) {
  return apiRequest(`/leadership${toQueryString({ is_published: true, ...params })}`);
}

export function fetchOffices(params = {}) {
  return apiRequest(`/offices${toQueryString({ is_published: true, ...params })}`);
}

export function fetchCompanyInfo() {
  return apiRequest('/site-content/company-info');
}

export function fetchAboutContent() {
  return apiRequest('/site-content/about-content');
}

const crudApi = (endpoint) => ({
  list: (params = {}) => apiRequest(`${endpoint}${toQueryString({ limit: 100, ...params })}`),
  create: (body) => apiRequest(endpoint, { method: 'POST', body }),
  update: (id, body) => apiRequest(`${endpoint}/${id}`, { method: 'PUT', body }),
  remove: (id) => apiRequest(`${endpoint}/${id}`, { method: 'DELETE' }),
});

export const servicesApi = crudApi('/services');
export const eventsApi = crudApi('/events');
export const blogsApi = crudApi('/blogs');
export const solutionsApi = crudApi('/solutions');
export const caseStudiesApi = crudApi('/case-studies');
export const downloadsApi = crudApi('/downloads');
export const industriesApi = crudApi('/industries');
export const technologiesApi = crudApi('/technologies');
export const productsApi = crudApi('/products');
export const awardsApi = crudApi('/awards');
export const announcementsApi = crudApi('/announcements');
export const faqsApi = crudApi('/faqs');
export const galleryApi = crudApi('/gallery');
export const portfolioApi = crudApi('/portfolio');
export const resourcesApi = crudApi('/resources');
export const categoriesApi = crudApi('/categories');
export const testimonialsApi = crudApi('/testimonials');
export const partnersApi = crudApi('/partners');
export const seoApi = crudApi('/seo');

// D11 (UAT_REPORT.md): the admin "SEO" resource existed and was editable,
// but nothing on the public site ever read from it — this is the fetch the
// new useSeoMeta hook (hooks/useSeoMeta.js) uses to actually apply it.
export function fetchSeoForPath(pagePath) {
  return apiRequest(`/seo${toQueryString({ page_path: pagePath })}`);
}
export const pageContentApi = crudApi('/page-content');
export const careersApi = crudApi('/careers');
export const leadershipApi = crudApi('/leadership');
export const officesApi = crudApi('/offices');

// Company info / about-page content — singleton settings-style resources
// (not a list), so they get a dedicated get/update pair rather than the
// generic list-CRUD `crudApi()` shape used above.
export const companyInfoApi = {
  get: () => apiRequest('/site-content/company-info'),
  update: (value) => apiRequest('/site-content/company-info', { method: 'PUT', body: { value } }),
};
export const aboutContentApi = {
  get: () => apiRequest('/site-content/about-content'),
  update: (value) => apiRequest('/site-content/about-content', { method: 'PUT', body: { value } }),
};

// Blog comments — public read (approved only, scoped to one post) and
// public create (rate-limited 5/min server-side); moderation itself is
// admin-only and lives in api/admin.js.
export function fetchBlogComments(blogId) {
  return apiRequest(`/comments${toQueryString({ blog_id: blogId, limit: 100 })}`);
}
export function submitComment(body) {
  return apiRequest('/comments', { method: 'POST', body });
}

// Newsletter — public subscribe/unsubscribe (rate-limited 5/min server-side).
export function subscribeNewsletter(body) {
  return apiRequest('/newsletter/subscribe', { method: 'POST', body });
}
