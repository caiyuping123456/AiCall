import { get, put } from './request';

export interface FollowUpItem {
  id: number;
  consultationId: number;
  planDay: number;
  questionnaire: string;
  answer: string;
  aiAnalysis: string;
  status: number;
  sendTime: string;
  answerTime: string;
  createTime: string;
  consultationNo: string;
  patientName: string;
}

export function getPendingFollowUps() {
  return get<FollowUpItem[]>('/user/followup/pending');
}

export function getFollowUpDetail(id: number) {
  return get<FollowUpItem>(`/user/followup/${id}/detail`);
}

export function submitFollowUpAnswer(id: number, answer: string) {
  return put<void>(`/user/followup/${id}/answer`, { answer });
}

export function getDoctorFollowUps(consultationId: number) {
  return get<FollowUpItem[]>(`/doctor/followup/${consultationId}`);
}

export function getDoctorFollowUpDetail(id: number) {
  return get<FollowUpItem>(`/doctor/followup/${id}/detail`);
}

export function getAbnormalFollowUps() {
  return get<FollowUpItem[]>('/doctor/followup/abnormal');
}
