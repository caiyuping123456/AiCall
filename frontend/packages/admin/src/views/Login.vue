<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <h2>AICall 管理后台</h2>
      </template>
      <el-form :model="form" @submit.prevent="handleLogin">
        <el-form-item label="账号">
          <el-input v-model="form.username" placeholder="请输入账号" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" native-type="submit" :loading="loading" style="width: 100%">
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { adminLogin } from '@aicall/shared';
import { useAdminStore } from '@/stores/admin';

const router = useRouter();
const adminStore = useAdminStore();
const form = reactive({ username: '', password: '' });
const loading = ref(false);

async function handleLogin() {
  loading.value = true;
  try {
    const res = await adminLogin(form.username, form.password);
    adminStore.setAuth({ token: res.token, adminId: res.adminId, name: res.name, role: res.role });
    ElMessage.success('登录成功');
    router.push('/');
  } catch (e: any) {
    ElMessage.error(e.message || '登录失败');
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f0f2f5;
}
.login-card {
  width: 400px;
}
.login-card h2 {
  text-align: center;
  margin: 0;
}
</style>