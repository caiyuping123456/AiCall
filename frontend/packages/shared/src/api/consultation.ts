import { get, post, put, del } from './request';

export function register(phone: string, password: string, name?: string) {
  return post('/user/auth/register', { phone, password, name });
}

export function login(phone: string, password: string) {
  return post<{ token: string; patientId: number; patientName: string; phone: string; profileComplete: number }>('/user/auth/login', { phone, password });
}

export function createDraft(chiefComplaint: string, department?: string) {
  return post<number>('/user/consultation/draft', { chiefComplaint, department });
}

export function chatMessage(consultationId: number, message: string) {
  return post<{ reply: string; finished: boolean }>(`/user/consultation/${consultationId}/chat`, { message });
}

export function formSubmit(consultationId: number, data: {
  chiefComplaint: string; onsetTime?: string; symptomDescription?: string;
  pastHistory?: string; allergyHistory?: string;
}) {
  return post<string>(`/user/consultation/${consultationId}/form-submit`, data);
}

export function generateSummary(consultationId: number) {
  return post<string>(`/user/consultation/${consultationId}/generate-summary`);
}

export function getSummary(consultationId: number) {
  return get<string>(`/user/consultation/${consultationId}/summary`);
}

export function updateSummary(consultationId: number, medicalSummary: string) {
  return put(`/user/consultation/${consultationId}/summary`, { medicalSummary });
}

export function uploadFile(consultationId: number, file: File, fileType: number = 4) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('fileType', String(fileType));
  return post(`/user/consultation/${consultationId}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export function getUploads(consultationId: number) {
  return get(`/user/consultation/${consultationId}/uploads`);
}

export function deleteUpload(consultationId: number, uploadId: number) {
  return del(`/user/consultation/${consultationId}/upload/${uploadId}`);
}

export function calculateFee(consultationId: number, type: number) {
  return post<number>(`/user/consultation/${consultationId}/calculate-fee`, { type });
}

export function payConsultation(consultationId: number) {
  return post(`/user/consultation/${consultationId}/pay`);
}

export function getConsultationDetail(consultationId: number) {
  return get(`/user/consultation/${consultationId}`);
}

export function getMeetings() {
  return get('/user/consultation/meetings');
}

export function queryConsultations() {
  return get('/user/consultation/query');
}

export function getUserReport(consultationId: number) {
  return get<{ id: number; content: string; status: number; fields: Record<string, string> }>(`/user/consultation/${consultationId}/report`);
}

export interface SubmitConsultationRequest {
  department: string;
  type: number;
  doctorIds: number[];
  chiefComplaint: string;
  medicalSummary: string;
  chatHistory: { role: string; content: string }[];
  fileIds: number[];
}

export function submitConsultation(data: SubmitConsultationRequest) {
  return post<{ consultationId: number }>('/user/registration', data);
}
