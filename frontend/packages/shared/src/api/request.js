import axios from 'axios';
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const instance = axios.create({
    baseURL: BASE_URL,
    timeout: 30000,
    headers: { 'Content-Type': 'application/json' },
});
instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
instance.interceptors.response.use((response) => {
    if (response.config.responseType === 'blob') {
        return response.data;
    }
    const { code, message, data } = response.data;
    if (code !== 200) {
        if (code === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('patientId');
            localStorage.removeItem('doctorId');
            window.location.href = '/login';
        }
        return Promise.reject(new Error(message || '请求失败'));
    }
    return data;
}, (error) => {
    if (error.response?.status === 401 || error.response?.data?.code === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('patientId');
        localStorage.removeItem('doctorId');
        window.location.href = '/login';
        return Promise.reject(new Error('会话已过期，请重新登录'));
    }
    const message = error.response?.data?.message || error.message || '网络异常';
    return Promise.reject(new Error(message));
});
export function get(url, config) {
    return instance.get(url, config);
}
export function post(url, data, config) {
    return instance.post(url, data, config);
}
export function put(url, data, config) {
    return instance.put(url, data, config);
}
export function del(url, config) {
    return instance.delete(url, config);
}
export default instance;
