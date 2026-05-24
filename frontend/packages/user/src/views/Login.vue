<template>
  <div class="login-page">
    <van-nav-bar title="AICall 在线会诊" />
    <div class="form-area">
      <van-cell-group inset>
        <van-field v-model="phone" label="手机号" placeholder="请输入手机号" type="tel" maxlength="11" />
        <van-field v-model="password" label="密码" placeholder="请输入密码" type="password" />
      </van-cell-group>
      <div class="btn-area">
        <van-button type="primary" block @click="handleLogin" :loading="loading">登录</van-button>
      </div>
      <div class="link-area">
        <span>还没有账号？</span>
        <a @click="$router.push('/register')">立即注册</a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import { login } from '@aicall/shared';

const router = useRouter();
const phone = ref('');
const password = ref('');
const loading = ref(false);

async function handleLogin() {
  if (!phone.value || phone.value.length !== 11) {
    showToast('请输入正确的手机号');
    return;
  }
  if (!password.value) {
    showToast('请输入密码');
    return;
  }
  loading.value = true;
  try {
    const res = await login(phone.value, password.value);
    localStorage.setItem('token', res.token);
    localStorage.setItem('patientId', String(res.patientId));
    showToast('登录成功');
    router.push('/');
  } catch (e: any) {
    showToast(e.message || '登录失败');
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-page { min-height: 100vh; background: #f7f8fa; }
.form-area { padding: 40px 0; }
.btn-area { padding: 24px 16px; }
.link-area { text-align: center; font-size: 14px; color: #999; }
.link-area a { color: #1989fa; cursor: pointer; }
</style>
