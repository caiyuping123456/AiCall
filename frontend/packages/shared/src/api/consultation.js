import { get, post, put, del } from './request';
export function register(phone, password, name) {
    return post('/user/auth/register', { phone, password, name });
}
export function login(phone, password) {
    return post('/user/auth/login', { phone, password });
}
export function createDraft(chiefComplaint, department) {
    return post('/user/consultation/draft', { chiefComplaint, department });
}
export function chatMessage(consultationId, message) {
    return post(`/user/consultation/${consultationId}/chat`, { message });
}
export function formSubmit(consultationId, data) {
    return post(`/user/consultation/${consultationId}/form-submit`, data);
}
export function generateSummary(consultationId) {
    return post(`/user/consultation/${consultationId}/generate-summary`);
}
export function getSummary(consultationId) {
    return get(`/user/consultation/${consultationId}/summary`);
}
export function updateSummary(consultationId, medicalSummary) {
    return put(`/user/consultation/${consultationId}/summary`, { medicalSummary });
}
export function uploadFile(consultationId, file, fileType = 4) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileType', String(fileType));
    return post(`/user/consultation/${consultationId}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
}
export function getUploads(consultationId) {
    return get(`/user/consultation/${consultationId}/uploads`);
}
export function deleteUpload(consultationId, uploadId) {
    return del(`/user/consultation/${consultationId}/upload/${uploadId}`);
}
export function calculateFee(consultationId, type) {
    return post(`/user/consultation/${consultationId}/calculate-fee`, { type });
}
export function payConsultation(consultationId) {
    return post(`/user/consultation/${consultationId}/pay`);
}
export function getConsultationDetail(consultationId) {
    return get(`/user/consultation/${consultationId}`);
}
export function getMeetings() {
    return get('/user/consultation/meetings');
}
export function queryConsultations() {
    return get('/user/consultation/query');
}
export function getUserReport(consultationId) {
    return get(`/user/consultation/${consultationId}/report`);
}
export function submitConsultation(data) {
    return post('/user/registration', data);
}
