import { get, post, put } from './request';
export function doctorLogin(username, password) {
    return post('/doctor/auth/login', { username, password });
}
export function getWorkbench() {
    return get('/doctor/workbench');
}
export function getDoctorConsultations(status) {
    return get('/doctor/consultations', { params: { status } });
}
export function getDoctorConsultationDetail(id) {
    return get(`/doctor/consultations/${id}`);
}
export function confirmConsultation(id) {
    return post(`/doctor/consultations/${id}/confirm`);
}
export function rejectConsultation(id, reason) {
    return post(`/doctor/consultations/${id}/reject`, { reason });
}
export function generateReport(id) {
    return post(`/doctor/consultations/${id}/generate-report`);
}
export function getReport(id) {
    return get(`/doctor/consultations/${id}/report`);
}
export function updateReport(id, content) {
    return put(`/doctor/consultations/${id}/report`, { content });
}
export function submitReport(id) {
    return post(`/doctor/consultations/${id}/submit-report`);
}
export function getQcResult(id) {
    return get(`/doctor/consultations/${id}/qc-result`);
}
export function signReport(id) {
    return post(`/doctor/consultations/${id}/sign`);
}
export function getDoctorProfile() {
    return get('/doctor/profile');
}
