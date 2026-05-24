import { defineStore } from 'pinia';

export const useAdminStore = defineStore('admin', {
  state: () => ({
    adminId: Number(localStorage.getItem('adminId') || 0),
    name: localStorage.getItem('adminName') || '',
    role: localStorage.getItem('adminRole') || '',
  }),
  actions: {
    setAuth(payload: { adminId: number; name: string; role: string; token: string }) {
      this.adminId = payload.adminId;
      this.name = payload.name;
      this.role = payload.role;
      localStorage.setItem('token', payload.token);
      localStorage.setItem('adminId', String(payload.adminId));
      localStorage.setItem('adminName', payload.name);
      localStorage.setItem('adminRole', payload.role);
    },
    logout() {
      this.adminId = 0;
      this.name = '';
      this.role = '';
      localStorage.removeItem('token');
      localStorage.removeItem('adminId');
      localStorage.removeItem('adminName');
      localStorage.removeItem('adminRole');
    },
  },
});