import { apiRequest, toQueryString } from './client.js';

// ---------- Leads ----------
export function fetchLeads(params = {}) {
  return apiRequest(`/leads${toQueryString(params)}`, {});
}

export function createLead(payload) {
  return apiRequest('/leads', { method: 'POST', body: payload });
}

export function updateLead(leadId, payload) {
  return apiRequest(`/leads/${leadId}`, { method: 'PATCH', body: payload });
}

export function fetchLead(leadId) {
  return apiRequest(`/leads/${leadId}`, {});
}

export function fetchLeadActivities(leadId) {
  return apiRequest(`/leads/${leadId}/activities`, {});
}

export function logLeadCall(leadId, notes) {
  return apiRequest(`/leads/${leadId}/log-call`, { method: 'POST', body: { notes } });
}

export function markRequirementGathering(leadId, notes) {
  return apiRequest(`/leads/${leadId}/requirement-gathering`, { method: 'POST', body: { notes } });
}

export function disqualifyLead(leadId, reason) {
  return apiRequest(`/leads/${leadId}/disqualify`, { method: 'POST', body: { reason } });
}

export function convertLead(leadId) {
  return apiRequest(`/leads/${leadId}/convert`, { method: 'POST' });
}

// ---------- Proposals ----------
export function fetchProposals(params = {}) {
  return apiRequest(`/proposals${toQueryString(params)}`, {});
}

export function createProposal(payload) {
  return apiRequest('/proposals', { method: 'POST', body: payload });
}

export function sendProposal(proposalId) {
  return apiRequest(`/proposals/${proposalId}/send`, { method: 'POST' });
}

export function acceptProposal(proposalId) {
  return apiRequest(`/proposals/${proposalId}/accept`, { method: 'POST' });
}

export function rejectProposal(proposalId, reason) {
  return apiRequest(`/proposals/${proposalId}/reject`, { method: 'POST', body: reason ? { reason } : {} });
}

// ---------- Contracts ----------
export function fetchContracts(params = {}) {
  return apiRequest(`/contracts${toQueryString(params)}`, {});
}

export function createContract(proposalId) {
  return apiRequest('/contracts', { method: 'POST', body: { proposal_id: proposalId } });
}

export function signContract(contractId, payload = {}) {
  return apiRequest(`/contracts/${contractId}/sign`, { method: 'POST', body: payload });
}

// ---------- Meetings ----------
export function fetchMeetings(params = {}) {
  return apiRequest(`/meetings${toQueryString(params)}`, {});
}

export function createMeeting(payload) {
  return apiRequest('/meetings', { method: 'POST', body: payload });
}

export function updateMeeting(meetingId, payload) {
  return apiRequest(`/meetings/${meetingId}`, { method: 'PATCH', body: payload });
}

export function deleteMeeting(meetingId) {
  return apiRequest(`/meetings/${meetingId}`, { method: 'DELETE' });
}

// ---------- Contact Submissions ----------
export function fetchContactSubmissions(params = {}) {
  return apiRequest(`/contact${toQueryString(params)}`, {});
}

export function updateContactStatus(id, status) {
  return apiRequest(`/contact/${id}`, { method: 'PATCH', body: { status } });
}
