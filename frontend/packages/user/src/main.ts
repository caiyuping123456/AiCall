import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';
import routes from './router';
import 'vant/lib/index.css';

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token');
  if (to.meta.requiresAuth && !token) {
    next('/login');
    return;
  }
  if (token && to.name !== 'ProfileComplete' && to.name !== 'ConsultationStatus') {
    const profileComplete = localStorage.getItem('profileComplete');
    if (profileComplete !== '1') {
      next('/profile/complete');
      return;
    }
  }
  if (token && to.name === 'ProfileComplete' && localStorage.getItem('profileComplete') === '1') {
    next('/');
    return;
  }
  next();
});

const app = createApp(App);
app.use(router);
app.mount('#app');
