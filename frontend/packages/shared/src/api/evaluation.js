import { get, put } from './request';
export function getPendingEvaluations() {
    return get('/user/evaluation/pending');
}
export function submitEvaluation(consultationId, data) {
    return put(`/user/evaluation/${consultationId}`, data);
}
