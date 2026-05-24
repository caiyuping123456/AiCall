import { get, post, put } from './request';

export function doctorLogin(username: string, password: string) {
  return post<{ token: string; doctorId: number; name: string; department: string; title: string }>(
    '/doctor/auth/login',
    { username, password }
  );
}

export function getWorkbench() {
  return get<{
    pendingReviewCount: number;
    reportEditingCount: number;
    pendingQcCount: number;
    recentConsultations: ConsultationListItem[];
  }>('/doctor/workbench');
}

export function getDoctorConsultations(status?: number) {
  return get<ConsultationListItem[]>('/doctor/consultations', { params: { status } });
}

export function getDoctorConsultationDetail(id: number) {
  return get<DoctorConsultationDetail>(`/doctor/consultations/${id}`);
}

export function confirmConsultation(id: number) {
  return post(`/doctor/consultations/${id}/confirm`);
}

export function rejectConsultation(id: number, reason: string) {
  return post(`/doctor/consultations/${id}/reject`, { reason });
}

export function generateReport(id: number) {
  return post<ReportData>(`/doctor/consultations/${id}/generate-report`);
}

export function getReport(id: number) {
  return get<ReportData>(`/doctor/consultations/${id}/report`);
}

export function updateReport(id: number, content: string) {
  return put(`/doctor/consultations/${id}/report`, { content });
}

export function submitReport(id: number) {
  return post<QcResultData>(`/doctor/consultations/${id}/submit-report`);
}

export function getQcResult(id: number) {
  return get<QcResultData>(`/doctor/consultations/${id}/qc-result`);
}

export function signReport(id: number) {
  return post(`/doctor/consultations/${id}/sign`);
}

export function getDoctorProfile() {
  return get<{ id: number; name: string; title: string; department: string; phone: string; avatar: string; introduction: string }>('/doctor/profile');
}

export interface ConsultationListItem {
  consultationId: number;
  patientName: string;
  chiefComplaint: string;
  department: string;
  status: number;
  createTime: string;
}

export interface DoctorConsultationDetail {
  consultationId: number;
  patientName: string;
  patientAge: number;
  patientGender: string;
  chiefComplaint: string;
  department: string;
  medicalSummary: string;
  status: number;
  createTime: string;
  uploads: UploadItem[];
  chatHistory: { role: string; content: string }[];
  report: ReportData | null;
}

export interface UploadItem {
  id: number;
  fileName: string;
  fileUrl: string;
  fileType: number;
  ocrResult: string;
}

export interface ReportData {
  id: number;
  content: string;
  status: number;
  signedByName: string;
  signedTime: string;
  qcResult: QcResultData | null;
}

export interface QcResultData {
  id: number;
  completenessScore: number;
  standardScore: number;
  consistencyScore: number;
  totalScore: number;
  issues: string;
  status: number;
}
