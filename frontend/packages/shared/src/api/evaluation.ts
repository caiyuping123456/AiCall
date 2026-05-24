import { get, put } from './request';

export interface EvaluationItem {
  id: number;
  consultationId: number;
  doctorScore: number;
  serviceScore: number;
  comment: string;
  createTime: string;
  consultationNo: string;
}

export function getPendingEvaluations() {
  return get<EvaluationItem[]>('/user/evaluation/pending');
}

export function submitEvaluation(consultationId: number, data: { doctorScore: number; serviceScore: number; comment: string }) {
  return put<void>(`/user/evaluation/${consultationId}`, data);
}
