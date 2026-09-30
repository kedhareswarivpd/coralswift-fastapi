/**
 * Backend records use snake_case fields tailored to the CMS/admin schema.
 * These adapters translate them into the shape the (originally static-data-driven)
 * presentation components expect, so ServiceCard/ProjectCard don't need to know
 * or care whether their data came from the API or the local demo dataset.
 */

const FALLBACK_PROJECT_IMAGE =
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80';

export function adaptService(service) {
  return {
    slug: service.slug,
    icon: service.icon || 'domain',
    title: service.name,
    description: service.overview || '',
    features: (service.features || []).slice(0, 2),
    benefit: service.benefits?.[0] || service.solutions || '',
  };
}

export function adaptProject(project) {
  return {
    slug: project.slug,
    industry: project.industry || 'Enterprise',
    services: project.services || [],
    // Backend projects expose at most a service_id FK — no service name — so
    // the id is preserved here and resolved to a portfolio category later
    // (see serviceTaxonomyCategories / ProjectGallery's enrichment step).
    serviceId: project.service_id || null,
    version: `v${Math.max(1, Math.round((project.progress_percent || 100) / 10) / 10).toFixed(1)}`,
    title: project.title,
    description: project.overview || project.challenge || '',
    tags: (project.technology_stack || []).slice(0, 3),
    image: project.cover_image || FALLBACK_PROJECT_IMAGE,
  };
}

// Portfolio service filters are presentation-level categories ("AI & ML",
// "ERP Systems", "Cloud Architecture") that the backend project model does
// not carry. This maps a backend *service* record (name/slug) onto those
// categories so projects linked to a service can still be filtered.
// Keyword patterns are word-bounded where a naive substring would misfire
// ("maintenance" contains "ai").
const TAXONOMY_RULES = [
  { category: 'AI & ML', pattern: /\bai\b|machine[ -]?learning|analytic|intelligen/ },
  { category: 'ERP Systems', pattern: /\berp\b|\bcrm\b|software|development|app\b|web|mobile|platform|automation/ },
  { category: 'Cloud Architecture', pattern: /\bcloud\b|infrastructure|devops|migrat|kubernetes|\bsre\b/ },
];

export function serviceTaxonomyCategories(service) {
  const haystack = `${service?.slug ?? ''} ${service?.name ?? ''}`.toLowerCase();
  if (!haystack.trim()) return [];
  const categories = TAXONOMY_RULES.filter((rule) => rule.pattern.test(haystack)).map((rule) => rule.category);
  // A service that matched nothing still belongs to the broadest bucket so
  // its projects don't silently vanish from every service filter.
  return categories.length ? categories : ['ERP Systems'];
}

// Keyword patterns over real project metadata (title/overview/tech stack).
// Word-bounded where a naive substring would misfire ("maintenance"
// contains "ai"; "suggestion" contains "gest"... etc).
const PROJECT_SIGNALS = [
  { category: 'AI & ML', pattern: /\bai\b|machine[ -]?learning|tensorflow|pytorch|\bllm\b|neural|predictive|recommendation|intelligen|fraud detection/ },
  { category: 'Cloud Architecture', pattern: /\bcloud\b|kubernetes|docker|aws|azure|\bgcp\b|terraform|devops|ci[ /]?cd|microservice|serverless|infrastructure/ },
  { category: 'ERP Systems', pattern: /\berp\b|\bcrm\b|billing|inventory|warehouse|\blms\b|portal|booking|\bsuite\b|platform|dashboard|management|\bsaas\b|commerce|marketplace|workflow|tracking/ },
];

// Last-resort inference when a project carries no explicit services metadata
// AND its service_id is missing/unresolvable (the seeded CMS projects are
// all in this state: the backend project model exposes service_id but the
// seed leaves it null). Classifies from the project's own words so every
// project lands in at least one portfolio category. Accepts both the raw
// API shape (overview/challenge/technology_stack) and the adapted shape
// (description/tags), since resolution runs after adaptProject.
export function inferProjectServiceCategories(project) {
  const haystack = [
    project?.title,
    project?.overview,
    project?.challenge,
    project?.description,
    ...(project?.technology_stack || []),
    ...(project?.tags || []),
  ]
   .filter(Boolean)
   .join(' ')
   .toLowerCase();
  if (!haystack.trim()) return ['ERP Systems'];
  const categories = PROJECT_SIGNALS.filter((rule) => rule.pattern.test(haystack)).map((rule) => rule.category);
  return categories.length ? categories : ['ERP Systems'];
}

/**
 * Single resolution point for a project's portfolio service categories.
 * Precedence: explicit `services` metadata (demo dataset) > linked service
 * record (service_id resolved against the fetched services list) >
 * inference from the project's own metadata. Returns e.g. ["AI & ML"].
 */
export function resolveProjectServiceCategories(project, taxonomyByServiceId = {}) {
  if (project.services?.length) return project.services;
  const linked = project.serviceId && taxonomyByServiceId[project.serviceId];
  if (linked?.length) return linked;
  return inferProjectServiceCategories(project);
}
