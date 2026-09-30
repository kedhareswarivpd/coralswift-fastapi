import { apiRequest, toQueryString } from './client.js';

export function fetchProjects({ industry, ...rest } = {}) {
  const params = { limit: 12, ...rest };
  if (industry && industry !== 'All') params.industry = industry;
  return apiRequest(`/projects${toQueryString(params)}`);
}

// The backend accepts either a UUID or a slug at this path
// (backend/app/routers/projects.py's GET /{identifier}), so this hits a
// real single-item endpoint rather than fetching the whole list to filter.
export function fetchProjectBySlug(slug) {
  return apiRequest(`/projects/${encodeURIComponent(slug)}`);
}

export function postProjectUpdate(projectId, updateText, hoursLogged) {
  return apiRequest(`/projects/${projectId}/updates`, {
    method: 'POST',
    body: { update_text: updateText, hours_logged: hoursLogged || null },
  });
}
