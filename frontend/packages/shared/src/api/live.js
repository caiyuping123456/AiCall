import { get, post, put } from './request';
export function createLiveRoom(consultationId) {
    return post('/live/rooms', { consultationId });
}
export function getLiveRoomByConsultation(consultationId) {
    return get(`/live/rooms/consultation/${consultationId}`);
}
export function startLiveRoom(roomId) {
    return put(`/live/rooms/${roomId}/start`);
}
export function endLiveRoom(roomId) {
    return put(`/live/rooms/${roomId}/end`);
}
export function getTRTCUserSig(roomId) {
    return get(`/live/rooms/${roomId}/sig`);
}
export function getLiveRecordings(roomId) {
    return get(`/live/rooms/${roomId}/recordings`);
}
export function saveLiveRecording(roomId, data) {
    return post(`/live/rooms/${roomId}/recordings`, data);
}
