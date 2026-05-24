import type { RouteRecordRaw } from 'vue-router';
import Home from '@/views/Home.vue';
import Login from '@/views/Login.vue';
import Start from '@/views/consultation/Start.vue';
import Chat from '@/views/consultation/Chat.vue';
import Form from '@/views/consultation/Form.vue';
import Summary from '@/views/consultation/Summary.vue';
import Upload from '@/views/consultation/Upload.vue';
import SelectType from '@/views/consultation/SelectType.vue';
import Pay from '@/views/consultation/Pay.vue';
import Success from '@/views/consultation/Success.vue';
import Query from '@/views/consultation/Query.vue';

const routes: RouteRecordRaw[] = [
  { path: '/login', name: 'Login', component: Login, meta: { title: '登录' } },
  { path: '/', name: 'Home', component: Home, meta: { title: '首页', requiresAuth: true } },
  { path: '/consultation/start', name: 'Start', component: Start, meta: { title: '选择预问诊方式', requiresAuth: true } },
  { path: '/consultation/:id/chat', name: 'Chat', component: Chat, meta: { title: 'AI预问诊', requiresAuth: true } },
  { path: '/consultation/:id/form', name: 'Form', component: Form, meta: { title: '填写病情', requiresAuth: true } },
  { path: '/consultation/:id/summary', name: 'Summary', component: Summary, meta: { title: '病情摘要', requiresAuth: true } },
  { path: '/consultation/:id/upload', name: 'Upload', component: Upload, meta: { title: '上传资料', requiresAuth: true } },
  { path: '/consultation/:id/select-type', name: 'SelectType', component: SelectType, meta: { title: '选择会诊类型', requiresAuth: true } },
  { path: '/consultation/:id/pay', name: 'Pay', component: Pay, meta: { title: '确认支付', requiresAuth: true } },
  { path: '/consultation/:id/success', name: 'Success', component: Success, meta: { title: '支付成功', requiresAuth: true } },
  { path: '/consultation/query', name: 'Query', component: Query, meta: { title: '查询会诊', requiresAuth: true } },
];

export default routes;
