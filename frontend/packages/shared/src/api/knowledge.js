import { get, post, del } from './request';
export function chatWithKnowledge(question) {
    return post('/user/knowledge/chat', { question });
}
export function getKnowledgeDocuments() {
    return get('/admin/knowledge/documents');
}
export function uploadKnowledgeDocument(file) {
    const formData = new FormData();
    formData.append('file', file);
    return post('/admin/knowledge/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
}
export function deleteKnowledgeDocument(id) {
    return del(`/admin/knowledge/documents/${id}`);
}
