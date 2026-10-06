import { apiRequest } from './client.js';

export function submitContactForm(rawPayload) {
  const payload = { ...rawPayload };
  ['service_id', 'industry_id', 'phone', 'company', 'department', 'subject', 'requirements'].forEach((key) => {
    if (typeof payload[key] === 'string' && !payload[key].trim()) {
      payload[key] = null;
    }
  });

  if (payload.expected_budget === '' || payload.expected_budget === null || payload.expected_budget === undefined) {
    payload.expected_budget = null;
  } else {
    payload.expected_budget = Number(payload.expected_budget);
  }

  return apiRequest('/contact', { method: 'POST', body: payload });
}

