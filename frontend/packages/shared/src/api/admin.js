import { del, get, post, put } from './request';
export function adminLogin(username, password) {
    return post('/admin/auth/login', { username, password });
}
export function getAdminDashboard() {
    return get('/admin/dashboard');
}
export function getAdminDoctors(params) {
    return get('/admin/doctors', { params });
}
export function createAdminDoctor(data) {
    return post('/admin/doctors', data);
}
export function updateAdminDoctor(id, data) {
    return put(`/admin/doctors/${id}`, data);
}
export function updateAdminDoctorStatus(id, status) {
    return put(`/admin/doctors/${id}/status`, { status });
}
export function getAdminDoctorDetail(id) {
    return get(`/admin/doctors/${id}`);
}
export function getAdminDoctorSchedules(id, date) {
    return get(`/admin/doctors/${id}/schedules`, { params: { date } });
}
export function createAdminDoctorSchedule(id, data) {
    return post(`/admin/doctors/${id}/schedules`, data);
}
export function updateAdminDoctorSchedule(id, scheduleId, data) {
    return put(`/admin/doctors/${id}/schedules/${scheduleId}`, data);
}
export function deleteAdminDoctorSchedule(id, scheduleId) {
    return del(`/admin/doctors/${id}/schedules/${scheduleId}`);
}
export function getAdminConsultations(params) {
    return get('/admin/consultations', { params });
}
export function getAdminConsultationDetail(id) {
    return get(`/admin/consultations/${id}`);
}
export function cancelAdminConsultation(id, reason) {
    return put(`/admin/consultations/${id}/cancel`, { reason });
}
export function assignConsultationDoctors(id, doctors) {
    return post(`/admin/consultations/${id}/doctors`, { doctors });
}
export function getConsultationTimeline(id) {
    return get(`/admin/consultations/${id}/timeline`);
}
export function getAdminDepartments() {
    return get('/admin/departments');
}
export function createAdminDepartment(data) {
    return post('/admin/departments', data);
}
export function updateAdminDepartment(id, data) {
    return put(`/admin/departments/${id}`, data);
}
export function deleteAdminDepartment(id) {
    return del(`/admin/departments/${id}`);
}
export function getAdminPatients(params) {
    return get('/admin/patients', { params });
}
export function updateAdminPatientStatus(id, status) {
    return put(`/admin/patients/${id}/status`, { status });
}
export function resetAdminPatientPassword(id) {
    return put(`/admin/patients/${id}/reset-password`);
}
export function exportAdminDashboard() {
    return get('/admin/dashboard/export', { responseType: 'blob' });
}
