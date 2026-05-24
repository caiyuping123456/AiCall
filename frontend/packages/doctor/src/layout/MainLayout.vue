<template>
  <el-container style="height: 100vh">
    <el-aside width="200px" style="background: #304156">
      <div style="color: #fff; padding: 20px; font-size: 18px; font-weight: bold; text-align: center">AICall 医生端</div>
      <el-menu :default-active="route.path" router background-color="#304156" text-color="#bfcbd9" active-text-color="#409eff">
        <el-menu-item index="/">
          <el-icon><Odometer /></el-icon>
          <span>工作台</span>
        </el-menu-item>
        <el-menu-item index="/consultations">
          <el-icon><Document /></el-icon>
          <span>会诊列表</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header style="display: flex; align-items: center; justify-content: flex-end; border-bottom: 1px solid #eee">
        <span style="margin-right: 16px">{{ doctorName }} | {{ department }}</span>
        <el-button type="text" @click="handleLogout">退出</el-button>
      </el-header>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Odometer, Document } from '@element-plus/icons-vue';

const route = useRoute();
const router = useRouter();

const doctorName = computed(() => localStorage.getItem('doctorName') || '');
const department = computed(() => localStorage.getItem('department') || '');

function handleLogout() {
  localStorage.removeItem('token');
  localStorage.removeItem('doctorId');
  localStorage.removeItem('doctorName');
  localStorage.removeItem('department');
  router.push('/login');
}
</script>
