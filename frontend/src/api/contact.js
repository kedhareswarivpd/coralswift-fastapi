import { apiRequest } from './client.js';

export function submitContactForm(payload) {
  return apiRequest('/contact', { method: 'POST', body: payload });
}
