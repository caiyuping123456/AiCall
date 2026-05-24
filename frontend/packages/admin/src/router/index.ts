import type { RouteRecordRaw } from 'vue-router';
import Login from '@/views/Login.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
];

export default routes;
