import { get, put } from './request';
export function getUserNotifications(page = 1, size = 20) {
    return get('/user/notification', { params: { page, size } });
}
export function getUserUnreadCount() {
    return get('/user/notification/unread-count');
}
export function markNotificationRead(id) {
    return put(`/user/notification/${id}/read`);
}
export function getDoctorNotifications(page = 1, size = 20) {
    return get('/doctor/notification', { params: { page, size } });
}
export function getDoctorUnreadCount() {
    return get('/doctor/notification/unread-count');
}
export function markDoctorNotificationRead(id) {
    return put(`/doctor/notification/${id}/read`);
}
