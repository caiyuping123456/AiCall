import type { RouteRecordRaw } from 'vue-router';
import Home from '@/views/Home.vue';
import ProfileComplete from '@/views/ProfileComplete.vue';
import MyMeetings from '@/views/MyMeetings.vue';
import Login from '@/views/Login.vue';
import Register from '@/views/Register.vue';
import Start from '@/views/consultation/Start.vue';
import Chat from '@/views/consultation/Chat.vue';
import Form from '@/views/consultation/Form.vue';
import Summary from '@/views/consultation/Summary.vue';
import Upload from '@/views/consultation/Upload.vue';
import SelectType from '@/views/consultation/SelectType.vue';
import Pay from '@/views/consultation/Pay.vue';
import Success from '@/views/consultation/Success.vue';
import Query from '@/views/consultation/Query.vue';
import Status from '@/views/consultation/Status.vue';
import Room from '@/views/consultation/Room.vue';
import FollowUpList from '@/views/FollowUpList.vue';
import FollowUpDetail from '@/views/FollowUpDetail.vue';
import EvaluationView from '@/views/EvaluationView.vue';
import NotificationCenter from '@/views/NotificationCenter.vue';

const routes: RouteRecordRaw[] = [
  { path: '/login', name: 'Login', component: Login, meta: { title: '登录' } },
  { path: '/register', name: 'Register', component: Register, meta: { title: '注册' } },
  { path: '/profile/complete', name: 'ProfileComplete', component: ProfileComplete, meta: { title: '完善资料', requiresAuth: true } },
  { path: '/', name: 'Home', component: Home, meta: { title: '首页', requiresAuth: true } },
  { path: '/consultation/start', name: 'Start', component: Start, meta: { title: '选择预问诊方式', requiresAuth: true } },
  { path: '/consultation/chat', name: 'Chat', component: Chat, meta: { title: 'AI预问诊', requiresAuth: true } },
  { path: '/consultation/form', name: 'Form', component: Form, meta: { title: '填写病情', requiresAuth: true } },
  { path: '/consultation/summary', name: 'Summary', component: Summary, meta: { title: '病情摘要', requiresAuth: true } },
  { path: '/consultation/upload', name: 'Upload', component: Upload, meta: { title: '上传资料', requiresAuth: true } },
  { path: '/consultation/select-type', name: 'SelectType', component: SelectType, meta: { title: '选择会诊类型', requiresAuth: true } },
  { path: '/consultation/pay', name: 'Pay', component: Pay, meta: { title: '确认支付', requiresAuth: true } },
  { path: '/consultation/success', name: 'Success', component: Success, meta: { title: '支付成功', requiresAuth: true } },
  // Legacy route for viewing existing consultation summary with ID
  { path: '/consultation/:id/summary', component: Summary, meta: { title: '病情摘要', requiresAuth: true } },
  { path: '/consultation/:id/status', name: 'ConsultationStatus', component: Status, meta: { title: '会诊详情', requiresAuth: true } },
  { path: '/consultation/:id/room', name: 'ConsultationRoom', component: Room, meta: { title: '会诊室', requiresAuth: true } },
  { path: '/consultation/query', name: 'Query', component: Query, meta: { title: '查询会诊', requiresAuth: true } },
  { path: '/followup', name: 'FollowUpList', component: FollowUpList, meta: { title: '我的随访', requiresAuth: true } },
  { path: '/followup/:id', name: 'FollowUpDetail', component: FollowUpDetail, meta: { title: '随访问卷', requiresAuth: true } },
  { path: '/meetings', name: 'MyMeetings', component: MyMeetings, meta: { title: '我的会诊', requiresAuth: true } },
  { path: '/evaluation', name: 'EvaluationView', component: EvaluationView, meta: { title: '会诊评价', requiresAuth: true } },
  { path: '/notifications', name: 'NotificationCenter', component: NotificationCenter, meta: { title: '通知中心', requiresAuth: true } },
  { path: '/departments', name: 'DepartmentList', component: () => import('../views/DepartmentList.vue'), meta: { title: '选择科室', requiresAuth: true } },
  { path: '/departments/:id/doctors', name: 'DoctorList', component: () => import('../views/DoctorList.vue'), meta: { title: '选择医生', requiresAuth: true } },
  { path: '/doctors/:id', name: 'DoctorDetail', component: () => import('../views/DoctorDetail.vue'), meta: { title: '医生详情', requiresAuth: true } },
  { path: '/profile', name: 'Profile', component: () => import('../views/Profile.vue'), meta: { title: '我的', requiresAuth: true } },
];

export default routes;
