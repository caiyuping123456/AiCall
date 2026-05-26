import { get, put } from './request';
export function getPendingFollowUps() {
    return get('/user/followup/pending');
}
export function getFollowUpDetail(id) {
    return get(`/user/followup/${id}/detail`);
}
export function submitFollowUpAnswer(id, answer) {
    return put(`/user/followup/${id}/answer`, { answer });
}
export function getDoctorFollowUps(consultationId) {
    return get(`/doctor/followup/${consultationId}`);
}
export function getDoctorFollowUpDetail(id) {
    return get(`/doctor/followup/${id}/detail`);
}
export function getAbnormalFollowUps() {
    return get('/doctor/followup/abnormal');
}
