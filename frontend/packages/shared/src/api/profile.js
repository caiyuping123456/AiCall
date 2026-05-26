import { get, put } from './request';
export function completeProfile(data) {
    return put('/user/profile/complete', data);
}
export function getProfile() {
    return get('/user/profile');
}
