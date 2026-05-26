<template>
  <div class="app-container">
    <router-view />
    <van-tabbar v-model="active" route v-if="showTabbar">
      <van-tabbar-item icon="home-o" to="/">首页</van-tabbar-item>
      <van-tabbar-item icon="guide-o" to="/departments">挂号</van-tabbar-item>
      <van-tabbar-item icon="records-o" to="/meetings">会诊</van-tabbar-item>
      <van-tabbar-item icon="user-o" to="/profile">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const active = ref(0);

const hiddenRoutes = ['/login', '/register', '/profile/complete',
  '/consultation/start', '/consultation/query',
  '/followup', '/evaluation', '/notifications'];

const showTabbar = computed(() => {
  const path = route.path;
  if (path.includes('/chat') || path.includes('/form') || path.includes('/room')) return false;
  if (path.includes('/consultation/') && !path.includes('/query') && !path.includes('/start')) return false;
  return !hiddenRoutes.some(r => path === r);
});
</script>

<style>
:root {
  --primary-color: #1989fa;
  --bg-color: #f7f8fa;
  --card-bg: #ffffff;
  --text-color: #323233;
  --text-secondary: #969799;
}
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: var(--bg-color);
  color: var(--text-color);
}
.app-container { min-height: 100vh; }
</style>