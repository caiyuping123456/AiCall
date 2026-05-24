<template>
  <div class="register-page">
    <van-nav-bar title="注册" left-arrow @click-left="$router.back()" />
    <div class="form-area">
      <van-cell-group inset>
        <van-field v-model="phone" label="手机号" placeholder="请输入手机号" type="tel" maxlength="11" />
        <van-field v-model="name" label="姓名" placeholder="请输入姓名（选填）" />
        <van-field v-model="password" label="密码" placeholder="请输入密码(6-20位)" type="password" />
        <van-field v-model="confirmPassword" label="确认密码" placeholder="请再次输入密码" type="password" />
      </van-cell-group>
      <div class="btn-area">
        <van-button type="primary" block @click="handleRegister" :loading="loading">注册</van-button>
      </div>
      <div class="link-area">
        <span>已有账号？</span>
        <a @click="$router.push('/login')">去登录</a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import { register } from '@aicall/shared';

const router = useRouter();
const phone = ref('');
const name = ref('');
const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);

async function handleRegister() {
  if (!phone.value || phone.value.length !== 11) {
    showToast('请输入正确的手机号');
    return;
  }
  if (!password.value || password.value.length < 6 || password.value.length > 20) {
    showToast('密码长度6-20位');
    return;
  }
  if (password.value !== confirmPassword.value) {
    showToast('两次密码不一致');
    return;
  }
  loading.value = true;
  try {
    await register(phone.value, password.value, name.value || undefined);
    showToast('注册成功');
    router.push('/login');
  } catch (e: any) {
    showToast(e.message || '注册失败');
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.register-page { min-height: 100vh; background: #f7f8fa; }
.form-area { padding: 40px 0; }
.btn-area { padding: 24px 16px; }
.link-area { text-align: center; font-size: 14px; color: #999; }
.link-area a { color: #1989fa; cursor: pointer; }
</style>
