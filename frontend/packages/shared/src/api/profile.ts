import { get, put } from './request';

export function completeProfile(data: { name: string; age: number; gender: number }) {
  return put('/user/profile/complete', data);
}

export function getProfile() {
  return get('/user/profile');
}
