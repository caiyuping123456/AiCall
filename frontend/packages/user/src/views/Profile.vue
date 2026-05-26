<template>
  <div class="page">
    <van-nav-bar title="我的" />
    <div class="content">
      <div class="profile-card">
        <div class="avatar-row">
          <div class="avatar-placeholder">{{ userName.charAt(0) }}</div>
          <div class="user-meta">
            <div class="user-name">{{ userName || '用户' }}</div>
            <div class="user-phone">{{ phone }}</div>
          </div>
        </div>
      </div>

      <van-cell-group inset style="margin-top: 16px;">
        <van-cell title="完善资料" is-link icon="edit" @click="$router.push('/profile/complete')" />
        <van-cell title="通知中心" is-link icon="bell" @click="$router.push('/notifications')" />
        <van-cell title="我的会诊" is-link icon="records" @click="$router.push('/meetings')" />
      </van-cell-group>

      <div class="logout-area">
        <van-button plain type="danger" block round @click="handleLogout">退出登录</van-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { showDialog, showToast } from 'vant';

const router = useRouter();
const userName = ref(localStorage.getItem('patientName') || '用户');
const phone = ref(localStorage.getItem('phone') || '');

function handleLogout() {
  showDialog({
    title: '提示',
    message: '确定退出登录吗？',
    showCancelButton: true,
  }).then(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('patientId');
    localStorage.removeItem('patientName');
    localStorage.removeItem('phone');
    localStorage.removeItem('profileComplete');
    router.push('/login');
  }).catch(() => {});
}
</script>

<style scoped>
.page { min-height: 100vh; background: #f7f8fa; padding-bottom: 70px; }
.content { padding: 16px; }
.profile-card {
  background: linear-gradient(135deg, #1989fa, #4fc3f7);
  border-radius: 12px; padding: 24px 20px;
}
.avatar-row { display: flex; align-items: center; gap: 16px; }
.avatar-placeholder {
  width: 56px; height: 56px; border-radius: 50%; background: rgba(255,255,255,0.3);
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-size: 24px; font-weight: 600;
}
.user-name { font-size: 18px; font-weight: 600; color: #fff; }
.user-phone { font-size: 13px; color: rgba(255,255,255,0.8); margin-top: 4px; }
.logout-area { margin-top: 32px; padding: 0 16px; }
</style>