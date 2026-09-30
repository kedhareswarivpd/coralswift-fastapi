import { apiRequest, toQueryString } from './client.js';

export function fetchServices(params = {}) {
  return apiRequest(`/services${toQueryString({ limit: 20, is_published: true, ...params })}`);
}
