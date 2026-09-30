import { apiRequest } from './client.js';

export function fetchMyProfile() {
  return apiRequest('/employees/me/profile', {});
}

export function checkIn() {
  return apiRequest('/employees/me/attendance/check-in', { method: 'POST' });
}

export function checkOut() {
  return apiRequest('/employees/me/attendance/check-out', { method: 'POST' });
}

export function applyLeave(payload) {
  return apiRequest('/employees/me/leaves', { method: 'POST', body: payload });
}

export function submitTimesheet(payload) {
  return apiRequest('/employees/me/timesheets', { method: 'POST', body: payload });
}

export function fetchMyPayslips() {
  return apiRequest('/employees/me/payslips', {});
}

export function fetchMyDocuments() {
  return apiRequest('/employees/me/documents', {});
}

export function fetchMyPerformanceReviews() {
  return apiRequest('/employees/me/performance-reviews', {});
}

export function fetchMyTrainingEnrollments() {
  return apiRequest('/trainings/my-enrollments', {});
}

export function fetchTrainingCatalog() {
  return apiRequest('/trainings/courses?limit=50', {});
}

export function enrollInCourse(courseId) {
  return apiRequest(`/trainings/enroll?course_id=${courseId}`, { method: 'POST' });
}
