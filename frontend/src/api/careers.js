import { apiRequest } from './client.js';

/**
 * Submits a job application as multipart/form-data to the apply endpoint.
 * `fields` maps to the backend's Form params: full_name, email, phone,
 * cover_letter, linkedin_url and resume (a File object).
 */
export function submitJobApplication(careerId, fields) {
  const formData = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') formData.append(key, value);
  });
  return apiRequest(`/careers/${careerId}/apply`, { method: 'POST', body: formData });
}