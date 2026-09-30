import { apiRequest } from './client.js';

export const fetchMyProfile  = () => apiRequest('/clients/me/profile',  {});
export const fetchMyProjects = () => apiRequest('/clients/me/projects',  {});
export const fetchMyInvoices = () => apiRequest('/clients/me/invoices',  {});
export const fetchMyTickets  = () => apiRequest('/clients/me/tickets',   {});
export const fetchMyPayments = () => apiRequest('/clients/me/payments',  {});
export const fetchMyMeetings = () => apiRequest('/clients/me/meetings',  {});
export const fetchMyFiles    = () => apiRequest('/clients/me/files',     {});
export const fetchMyReports  = () => apiRequest('/clients/me/reports',   {});
export const createTicket    = (payload) => apiRequest('/clients/me/tickets', { method: 'POST', body: payload });

export const fetchMyProposals  = () => apiRequest('/clients/me/proposals', {});
export const acceptMyProposal  = (id) => apiRequest(`/clients/me/proposals/${id}/accept`, { method: 'POST' });
export const rejectMyProposal  = (id, reason) => apiRequest(`/clients/me/proposals/${id}/reject`, { method: 'POST', body: { reason } });
export const fetchMyContracts  = () => apiRequest('/clients/me/contracts', {});

// --- Project workflow: milestones, deliverables, progress updates, approval ---
export const fetchMyProjectUpdates     = (projectId) => apiRequest(`/clients/me/projects/${projectId}/updates`, {});
export const fetchMyProjectMilestones  = (projectId) => apiRequest(`/clients/me/projects/${projectId}/milestones`, {});
export const fetchMyProjectDeliverables = (projectId) => apiRequest(`/clients/me/projects/${projectId}/deliverables`, {});
export const reviewDeliverable         = (projectId, deliverableId, payload) =>
  apiRequest(`/clients/me/projects/${projectId}/deliverables/${deliverableId}/review`, { method: 'POST', body: payload });
export const approveProjectDelivery    = (projectId) =>
  apiRequest(`/clients/me/projects/${projectId}/approve-delivery`, { method: 'POST' });
export const requestProjectChanges     = (projectId, reason) =>
  apiRequest(`/clients/me/projects/${projectId}/request-changes`, { method: 'POST', body: { reason } });

