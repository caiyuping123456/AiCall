import { get, post, del } from './request';

export interface KnowledgeDocument {
  id: number;
  fileName: string;
  fileUrl: string;
  chunkCount: number;
  createTime: string;
}

export interface KnowledgeChatResponse {
  answer: string;
  sources: { fileName: string; snippet: string }[];
}

export function chatWithKnowledge(question: string) {
  return post<KnowledgeChatResponse>('/user/knowledge/chat', { question });
}

export function getKnowledgeDocuments() {
  return get<KnowledgeDocument[]>('/admin/knowledge/documents');
}

export function uploadKnowledgeDocument(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return post<KnowledgeDocument>('/admin/knowledge/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export function deleteKnowledgeDocument(id: number) {
  return del(`/admin/knowledge/documents/${id}`);
}
