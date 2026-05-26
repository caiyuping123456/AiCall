<template>
  <el-container class="admin-shell">
    <el-aside width="236px" class="admin-sidebar">
      <div class="brand">
        <div class="brand-mark">AI</div>
        <div>
          <div class="brand-title">AICall</div>
          <div class="brand-subtitle">运营管理中心</div>
        </div>
      </div>
      <el-menu :default-active="route.path" router class="side-menu">
        <el-menu-item index="/">
          <el-icon><Odometer /></el-icon>
          <span>仪表盘</span>
        </el-menu-item>
        <el-menu-item index="/departments">
          <el-icon><Grid /></el-icon>
          <span>科室管理</span>
        </el-menu-item>
        <el-menu-item index="/patients">
          <el-icon><UserFilled /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
        <el-menu-item index="/doctors">
          <el-icon><User /></el-icon>
          <span>医生管理</span>
        </el-menu-item>
        <el-menu-item index="/knowledge">
          <el-icon><Collection /></el-icon>
          <span>知识库管理</span>
        </el-menu-item>
        <el-menu-item index="/consultations">
          <el-icon><Document /></el-icon>
          <span>会诊管理</span>
        </el-menu-item>
      </el-menu>
      <div class="sidebar-card">
        <div class="sidebar-card-title">平台状态</div>
        <div class="sidebar-card-text">AI 会诊服务运行中</div>
      </div>
    </el-aside>
    <el-container class="admin-main">
      <el-header class="admin-header">
        <div>
          <div class="header-title">管理控制台</div>
          <div class="header-subtitle">统一管理医生、患者、知识库与会诊流程</div>
        </div>
        <div class="admin-profile">
          <div class="profile-avatar">{{ adminStore.name?.charAt(0) || '管' }}</div>
          <div class="profile-text">
            <div class="profile-name">{{ adminStore.name || '管理员' }}</div>
            <div class="profile-meta">{{ adminStore.role || 'admin' }}</div>
          </div>
          <el-button plain type="danger" @click="logout">退出登录</el-button>
        </div>
      </el-header>
      <el-main class="admin-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { useAdminStore } from '@/stores/admin';
import { Odometer, User, UserFilled, Document, Grid, Collection } from '@element-plus/icons-vue';

const route = useRoute();
const router = useRouter();
const adminStore = useAdminStore();

function logout() {
  adminStore.logout();
  router.push('/login');
}
</script>

<style scoped>
.admin-shell {
  min-height: 100vh;
  background: var(--aicall-bg);
}

.admin-sidebar {
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

.sidebar-card {
  margin-top: 18px;
  padding: 14px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.06);
}

.sidebar-card-title {
  font-size: 13px;
  font-weight: 700;
}

.sidebar-card-text {
  margin-top: 6px;
  color: rgba(255, 255, 255, 0.66);
  font-size: 12px;
}

.admin-main {
  min-width: 0;
}

.admin-header {
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

.admin-profile {
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

.admin-content {
  padding: 24px;
  background: transparent;
}
</style>
