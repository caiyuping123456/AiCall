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
import { post } from '@aicall/shared';
import type { LoginResponse } from '@aicall/shared';

const form = reactive({ username: '', password: '' });
const loading = ref(false);

async function handleLogin() {
  loading.value = true;
  try {
    const res = await post<LoginResponse>('/admin/login', form);
    localStorage.setItem('token', res.token);
    localStorage.setItem('userName', res.name);
  } catch (e: any) {
    console.error(e.message);
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
