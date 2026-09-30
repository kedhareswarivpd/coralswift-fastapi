import { apiRequest } from './client.js';

export function getStats() {
  return apiRequest('/stats');
}
