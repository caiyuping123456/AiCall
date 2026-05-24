import { get, post, put } from './request';

export interface LiveRoom {
  id: number;
  consultationId: number;
  roomId: string;
  status: number;
  startTime: string;
  endTime: string;
  createTime: string;
}

export interface UserSig {
  userSig: string;
  sdkAppId: number;
  roomId: string;
  userId: string;
}

export interface Recording {
  id: number;
  fileUrl: string;
  fileSize: number;
  duration: number;
  createTime: string;
}

export function createLiveRoom(consultationId: number) {
  return post<LiveRoom>('/live/rooms', { consultationId });
}

export function getLiveRoomByConsultation(consultationId: number) {
  return get<LiveRoom>(`/live/rooms/consultation/${consultationId}`);
}

export function startLiveRoom(roomId: number) {
  return put<LiveRoom>(`/live/rooms/${roomId}/start`);
}

export function endLiveRoom(roomId: number) {
  return put<LiveRoom>(`/live/rooms/${roomId}/end`);
}

export function getTRTCUserSig(roomId: number) {
  return get<UserSig>(`/live/rooms/${roomId}/sig`);
}

export function getLiveRecordings(roomId: number) {
  return get<Recording[]>(`/live/rooms/${roomId}/recordings`);
}

export function saveLiveRecording(roomId: number, data: { fileUrl: string; fileSize: number; duration: number }) {
  return post<Recording>(`/live/rooms/${roomId}/recordings`, data);
}
