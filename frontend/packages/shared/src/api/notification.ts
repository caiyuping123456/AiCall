import { get, put } from './request';

export interface NotificationItem {
  id: number;
  userType: number;
  userId: number;
  type: number;
  title: string;
  content: string;
  status: number;
  sendTime: string;
  createTime: string;
}

export function getUserNotifications(page = 1, size = 20) {
  return get<NotificationItem[]>('/user/notification', { params: { page, size } });
}

export function getUserUnreadCount() {
  return get<{ count: number }>('/user/notification/unread-count');
}

export function markNotificationRead(id: number) {
  return put<void>(`/user/notification/${id}/read`);
}

export function getDoctorNotifications(page = 1, size = 20) {
  return get<NotificationItem[]>('/doctor/notification', { params: { page, size } });
}

export function getDoctorUnreadCount() {
  return get<{ count: number }>('/doctor/notification/unread-count');
}

export function markDoctorNotificationRead(id: number) {
  return put<void>(`/doctor/notification/${id}/read`);
}
