import { del, get, post, put } from './request';
import type { PaginatedResult } from '../types';

export interface AdminLoginResponse {
  token: string;
  adminId: number;
  name: string;
  role: string;
}

export interface AdminDoctorListItem {
  id: number;
  name: string;
  title: string;
  department: string;
  phone: string;
  status: number;
  createTime: string;
}

export interface AdminDoctorDetail extends AdminDoctorListItem {
  username: string;
  introduction: string;
  consultationCount: number;
  recentSchedules: AdminDoctorSchedule[];
}

export interface AdminDoctorSchedule {
  id: number;
  doctorId: number;
  scheduleDate: string;
  startTime: string;
  endTime: string;
  status: number;
}

export interface AdminConsultationListItem {
  id: number;
  consultationNo: string;
  patientName: string;
  department: string;
  status: number;
  fee: number;
  paymentStatus: number;
  createTime: string;
}

export interface AdminDashboardData {
  consultationTotal: number;
  consultationByStatus: Record<string, number>;
  newThisMonth: number;
  newThisWeek: number;
  byDepartment: Record<string, number>;
  doctorWorkload: { doctorId: number; name: string; consultationCount: number }[];
  revenue: { total: number; paid: number; refunded: number };
  dailyTrend: { date: string; count: number }[];
  dailyRevenue: { date: string; amount: number }[];
}

export function adminLogin(username: string, password: string) {
  return post<AdminLoginResponse>('/admin/auth/login', { username, password });
}

export function getAdminDashboard() {
  return get<AdminDashboardData>('/admin/dashboard');
}

export function getAdminDoctors(params: { keyword?: string; department?: string; page: number; size: number }) {
  return get<PaginatedResult<AdminDoctorListItem>>('/admin/doctors', { params });
}

export function createAdminDoctor(data: Record<string, unknown>) {
  return post('/admin/doctors', data);
}

export function updateAdminDoctor(id: number, data: Record<string, unknown>) {
  return put(`/admin/doctors/${id}`, data);
}

export function updateAdminDoctorStatus(id: number, status: number) {
  return put(`/admin/doctors/${id}/status`, { status });
}

export function getAdminDoctorDetail(id: number) {
  return get<AdminDoctorDetail>(`/admin/doctors/${id}`);
}

export function getAdminDoctorSchedules(id: number, date?: string) {
  return get<AdminDoctorSchedule[]>(`/admin/doctors/${id}/schedules`, { params: { date } });
}

export function createAdminDoctorSchedule(id: number, data: Record<string, unknown>) {
  return post(`/admin/doctors/${id}/schedules`, data);
}

export function updateAdminDoctorSchedule(id: number, scheduleId: number, data: Record<string, unknown>) {
  return put(`/admin/doctors/${id}/schedules/${scheduleId}`, data);
}

export function deleteAdminDoctorSchedule(id: number, scheduleId: number) {
  return del(`/admin/doctors/${id}/schedules/${scheduleId}`);
}

export function getAdminConsultations(params: { status?: number; keyword?: string; page: number; size: number }) {
  return get<PaginatedResult<AdminConsultationListItem>>('/admin/consultations', { params });
}

export function getAdminConsultationDetail(id: number) {
  return get(`/admin/consultations/${id}`);
}

export function cancelAdminConsultation(id: number, reason: string) {
  return put(`/admin/consultations/${id}/cancel`, { reason });
}

export function assignConsultationDoctors(id: number, doctors: { doctorId: number; role: number }[]) {
  return post(`/admin/consultations/${id}/doctors`, { doctors });
}

export interface AdminDepartment {
  id: number;
  name: string;
  description: string;
  status: number;
  createTime: string;
  updateTime: string;
}

export function getAdminDepartments() {
  return get<AdminDepartment[]>('/admin/departments');
}

export function createAdminDepartment(data: { name: string; description?: string }) {
  return post<AdminDepartment>('/admin/departments', data);
}

export function updateAdminDepartment(id: number, data: { name: string; description?: string }) {
  return put(`/admin/departments/${id}`, data);
}

export function deleteAdminDepartment(id: number) {
  return del(`/admin/departments/${id}`);
}

export interface AdminPatientListItem {
  id: number;
  name: string;
  phone: string;
  gender: number;
  age: number;
  status: number;
  profileComplete: number;
  createTime: string;
}

export function getAdminPatients(params: { keyword?: string; page: number; size: number }) {
  return get<PaginatedResult<AdminPatientListItem>>('/admin/patients', { params });
}

export function updateAdminPatientStatus(id: number, status: number) {
  return put(`/admin/patients/${id}/status`, { status });
}

export function resetAdminPatientPassword(id: number) {
  return put(`/admin/patients/${id}/reset-password`);
}

export function exportAdminDashboard() {
  return get('/admin/dashboard/export', { responseType: 'blob' });
}