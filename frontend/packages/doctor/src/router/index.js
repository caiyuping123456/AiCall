import { createRouter, createWebHistory } from 'vue-router';
import Login from '@/views/Login.vue';
const routes = [
    { path: '/login', name: 'Login', component: Login, meta: { title: '医生登录' } },
    {
        path: '/',
        component: () => import('@/layout/MainLayout.vue'),
        meta: { requiresAuth: true },
        children: [
            { path: '', name: 'Dashboard', component: () => import('@/views/Dashboard.vue'), meta: { title: '工作台' } },
            { path: 'consultations', name: 'ConsultationList', component: () => import('@/views/ConsultationList.vue'), meta: { title: '会诊列表' } },
            { path: 'consultations/:id', name: 'ConsultationDetail', component: () => import('@/views/ConsultationDetail.vue'), meta: { title: '会诊详情' } },
            { path: 'consultations/:id/report', name: 'ReportEditor', component: () => import('@/views/ReportEditor.vue'), meta: { title: '报告编辑' } },
            { path: 'consultations/:id/room', name: 'ConsultationRoom', component: () => import('@/views/ConsultationRoom.vue'), meta: { title: '会诊室' } },
            { path: 'notifications', name: 'DoctorNotification', component: () => import('@/views/DoctorNotification.vue'), meta: { title: '通知中心' } },
        ],
    },
];
const router = createRouter({
    history: createWebHistory(),
    routes,
});
router.beforeEach((to, _from, next) => {
    const token = localStorage.getItem('token');
    if (to.meta.requiresAuth && !token) {
        next('/login');
    }
    else {
        next();
    }
});
export default router;
