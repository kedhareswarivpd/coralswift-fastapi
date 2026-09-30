import { apiRequest, toQueryString } from './client.js';

export function fetchEvents(params = {}) {
  return apiRequest(`/events${toQueryString({ is_published: true, ...params })}`);
}
