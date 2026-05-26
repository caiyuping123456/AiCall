<template>
  <el-container class="doctor-shell">
    <el-aside width="232px" class="doctor-sidebar">
      <div class="brand">
        <div class="brand-mark">AI</div>
        <div>
          <div class="brand-title">AICall</div>
          <div class="brand-subtitle">医生工作台</div>
        </div>
      </div>
      <el-menu :default-active="route.path" router class="side-menu">
        <el-menu-item index="/">
          <el-icon><Odometer /></el-icon>
          <span>工作台</span>
        </el-menu-item>
        <el-menu-item index="/consultations">
          <el-icon><Document /></el-icon>
          <span>会诊列表</span>
        </el-menu-item>
        <el-menu-item index="/notifications">
          <el-icon><Bell /></el-icon>
          <span>通知</span>
          <el-badge v-if="unreadCount > 0" :value="unreadCount" :max="99" class="menu-badge" />
        </el-menu-item>
      </el-menu>
      <div class="sidebar-footer">
        <div class="status-dot" />
        <span>在线接诊中</span>
      </div>
    </el-aside>
    <el-container class="doctor-main">
      <el-header class="doctor-header">
        <div>
          <div class="header-title">医生协作中心</div>
          <div class="header-subtitle">查看会诊、编辑报告并完成质控签发</div>
        </div>
        <div class="doctor-profile">
          <div class="profile-avatar">{{ doctorName?.charAt(0) || '医' }}</div>
          <div class="profile-text">
            <div class="profile-name">{{ doctorName || '医生' }}</div>
            <div class="profile-meta">{{ department || '科室未设置' }}</div>
          </div>
          <el-button plain type="primary" @click="handleLogout">退出</el-button>
        </div>
      </el-header>
      <el-main class="doctor-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Odometer, Document, Bell } from '@element-plus/icons-vue';
import { getDoctorUnreadCount } from '@aicall/shared';

const route = useRoute();
const router = useRouter();

const doctorName = computed(() => localStorage.getItem('doctorName') || '');
const department = computed(() => localStorage.getItem('department') || '');
const unreadCount = ref(0);
let pollTimer: ReturnType<typeof setInterval> | null = null;

async function fetchUnread() {
  try {
    const res = await getDoctorUnreadCount() as any;
    unreadCount.value = res?.count ?? 0;
  } catch {}
}

function handleLogout() {
  localStorage.removeItem('token');
  localStorage.removeItem('doctorId');
  localStorage.removeItem('doctorName');
  localStorage.removeItem('department');
  router.push('/login');
}

onMounted(() => {
  fetchUnread();
  pollTimer = setInterval(fetchUnread, 60000);
});

onBeforeUnmount(() => {
  if (pollTimer) clearInterval(pollTimer);
});
</script>

<style scoped>
.doctor-shell {
  min-height: 100vh;
  background: var(--aicall-bg);
}

.doctor-sidebar {
  display: flex;
  flex-direction: column;
  padding: 18px 14px;
  background: linear-gradient(180deg, #0f172a 0%, #172033 58%, #123a45 100%);
  color: #fff;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 8px 22px;
}

.brand-mark {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #2563eb, #14b8a6);
  font-weight: 800;
  letter-spacing: 0;
  box-shadow: 0 12px 30px rgba(37, 99, 235, 0.38);
}

.brand-title {
  font-size: 18px;
  font-weight: 800;
}

.brand-subtitle {
  margin-top: 2px;
  color: rgba(255, 255, 255, 0.62);
  font-size: 12px;
}

.side-menu {
  flex: 1;
  border-right: 0;
  background: transparent;
}

.side-menu :deep(.el-menu-item) {
  height: 46px;
  margin: 5px 0;
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.72);
  font-weight: 600;
}

.side-menu :deep(.el-menu-item:hover) {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}

.side-menu :deep(.el-menu-item.is-active) {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.92), rgba(20, 184, 166, 0.78));
  color: #fff;
  box-shadow: 0 12px 24px rgba(20, 184, 166, 0.18);
}

.menu-badge {
  margin-left: auto;
}

.sidebar-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 18px;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.76);
  background: rgba(255, 255, 255, 0.06);
  font-size: 13px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #22c55e;
  box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.18);
}

.doctor-main {
  min-width: 0;
}

.doctor-header {
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  border-bottom: 1px solid rgba(229, 231, 235, 0.76);
  background: rgba(255, 255, 255, 0.86);
  backdrop-filter: blur(14px);
}

.header-title {
  color: var(--aicall-text);
  font-size: 18px;
  font-weight: 800;
}

.header-subtitle {
  margin-top: 3px;
  color: var(--aicall-muted);
  font-size: 12px;
}

.doctor-profile {
  display: flex;
  align-items: center;
  gap: 12px;
}

.profile-avatar {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #dbeafe, #ccfbf1);
  color: #1d4ed8;
  font-weight: 800;
}

.profile-name {
  color: var(--aicall-text);
  font-weight: 700;
}

.profile-meta {
  margin-top: 2px;
  color: var(--aicall-muted);
  font-size: 12px;
}

.doctor-content {
  padding: 24px;
  background: transparent;
}
</style>
