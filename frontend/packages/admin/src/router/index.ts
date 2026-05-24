import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import Login from '@/views/Login.vue';

const routes: RouteRecordRaw[] = [
  { path: '/login', name: 'Login', component: Login },
  {
    path: '/',
    component: () => import('@/layout/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'Dashboard', component: () => import('@/views/Dashboard.vue') },
      { path: 'departments', name: 'Departments', component: () => import('@/views/DepartmentList.vue') },
      { path: 'patients', name: 'Patients', component: () => import('@/views/PatientList.vue') },
      { path: 'doctors', name: 'Doctors', component: () => import('@/views/DoctorList.vue') },
      { path: 'doctors/:id', name: 'DoctorDetail', component: () => import('@/views/DoctorDetail.vue') },
      { path: 'knowledge', name: 'Knowledge', component: () => import('@/views/KnowledgeList.vue') },
      { path: 'consultations', name: 'Consultations', component: () => import('@/views/ConsultationList.vue') },
      { path: 'consultations/:id', name: 'ConsultationDetail', component: () => import('@/views/ConsultationDetail.vue') },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const token = localStorage.getItem('token');
  if (to.meta.requiresAuth && !token) {
    return '/login';
  }
  if (to.path === '/login' && token) {
    return '/';
  }
});

export default router;