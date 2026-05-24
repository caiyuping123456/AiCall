<template>
  <el-container style="min-height: 100vh">
    <el-aside width="220px" style="background: #304156">
      <div style="height: 60px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 18px; font-weight: 600;">
        AICall 管理端
      </div>
      <el-menu :default-active="route.path" router background-color="#304156" text-color="#bfcbd9" active-text-color="#409eff">
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
    </el-aside>
    <el-container>
      <el-header style="display: flex; justify-content: flex-end; align-items: center; gap: 12px; border-bottom: 1px solid #e6e6e6;">
        <span>{{ adminStore.name }}</span>
        <el-button link type="danger" @click="logout">退出登录</el-button>
      </el-header>
      <el-main>
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