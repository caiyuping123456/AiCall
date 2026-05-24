<template>
  <div class="login-page">
    <van-nav-bar title="AICall 在线会诊" />
    <div class="form-area">
      <van-cell-group inset>
        <van-field v-model="phone" label="手机号" placeholder="请输入手机号" type="tel" maxlength="11" />
        <van-field v-model="code" label="验证码" placeholder="请输入验证码" type="digit" maxlength="6">
          <template #button>
            <van-button size="small" type="primary" @click="handleSendCode" :disabled="countdown > 0">
              {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
            </van-button>
          </template>
        </van-field>
      </van-cell-group>
      <div class="btn-area">
        <van-button type="primary" block @click="handleLogin" :loading="loading">登录</van-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import { sendCode, loginByCode } from '@aicall/shared';

const router = useRouter();
const phone = ref('');
const code = ref('');
const loading = ref(false);
const countdown = ref(0);

async function handleSendCode() {
  if (!phone.value || phone.value.length !== 11) {
    showToast('请输入正确的手机号');
    return;
  }
  try {
    await sendCode(phone.value);
    showToast('验证码已发送');
    countdown.value = 60;
    const timer = setInterval(() => {
      countdown.value--;
      if (countdown.value <= 0) clearInterval(timer);
    }, 1000);
  } catch (e: any) {
    showToast(e.message || '发送失败');
  }
}

async function handleLogin() {
  if (!phone.value || !code.value) {
    showToast('请输入手机号和验证码');
    return;
  }
  loading.value = true;
  try {
    const res = await loginByCode(phone.value, code.value);
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
</style>
