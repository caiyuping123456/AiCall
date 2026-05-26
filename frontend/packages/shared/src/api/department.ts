import { get, post } from './request';

export interface UserDepartment {
  id: number;
  name: string;
  description: string;
}

export interface UserDoctor {
  id: number;
  name: string;
  title: string;
  department: string;
  avatar: string;
  introduction: string;
}

export function getDepartments() {
  return get<UserDepartment[]>('/user/departments');
}

export function getDoctorsByDepartment(departmentId: number) {
  return get<UserDoctor[]>(`/user/departments/${departmentId}/doctors`);
}

export function getDoctorDetail(doctorId: number) {
  return get<UserDoctor>(`/user/doctors/${doctorId}`);
}

export function registerConsultation(data: { chiefComplaint: string; doctorId: number; department?: string }) {
  return post<number>('/user/registration', data);
}