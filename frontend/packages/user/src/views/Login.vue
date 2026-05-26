<template>
  <div class="login-page">
    <div class="header-area">
      <div class="brand-icon">
        <van-icon name="chat-o" size="40" color="#fff" />
      </div>
      <div class="brand-title">AICall 在线会诊</div>
      <div class="brand-sub">智慧医疗 视频会诊平台</div>
    </div>
    <div class="form-area">
      <van-cell-group inset>
        <van-field v-model="phone" label="手机号" placeholder="请输入手机号" type="tel" maxlength="11" />
        <van-field v-model="password" label="密码" placeholder="请输入密码" type="password" />
      </van-cell-group>
      <div class="btn-area">
        <van-button type="primary" block round @click="handleLogin" :loading="loading">登录</van-button>
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
    localStorage.setItem('patientName', res.patientName || '');
    localStorage.setItem('phone', phone.value);
    localStorage.setItem('profileComplete', String(res.profileComplete ?? 0));
    showToast('登录成功');
    if (res.profileComplete === 1) {
      router.push('/');
    } else {
      router.push('/profile/complete');
    }
  } catch (e: any) {
    showToast(e.message || '登录失败');
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-page { min-height: 100vh; background: #f7f8fa; }
.header-area {
  background: linear-gradient(135deg, #1989fa, #4fc3f7);
  padding: 48px 24px 36px; text-align: center;
}
.brand-icon {
  width: 72px; height: 72px; border-radius: 20px;
  background: rgba(255,255,255,0.2); display: flex;
  align-items: center; justify-content: center; margin: 0 auto 16px;
}
.brand-title { color: #fff; font-size: 22px; font-weight: 600; }
.brand-sub { color: rgba(255,255,255,0.8); font-size: 14px; margin-top: 6px; }
.form-area { padding: 32px 0; }
.btn-area { padding: 24px 16px; }
.link-area { text-align: center; font-size: 14px; color: #999; }
.link-area a { color: #1989fa; cursor: pointer; }
</style>