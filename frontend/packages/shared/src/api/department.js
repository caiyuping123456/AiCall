import { get, post } from './request';
export function getDepartments() {
    return get('/user/departments');
}
export function getDoctorsByDepartment(departmentId) {
    return get(`/user/departments/${departmentId}/doctors`);
}
export function getDoctorDetail(doctorId) {
    return get(`/user/doctors/${doctorId}`);
}
export function registerConsultation(data) {
    return post('/user/registration', data);
}
