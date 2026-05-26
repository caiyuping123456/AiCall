<template>
  <div class="page">
    <van-nav-bar title="支付成功" />
    <div class="success-area">
      <van-icon name="checked" size="64" color="#07c160" />
      <h2>支付成功</h2>
      <p>会诊申请已提交，请耐心等待专家确认</p>
      <van-button type="primary" @click="$router.push('/')" style="margin-top: 24px;">返回首页</van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useConsultationFlowStore } from '@/stores/consultationFlow';

const flow = useConsultationFlowStore();

onMounted(() => {
  flow.reset();
});
</script>

<style scoped>
.page { min-height: 100vh; background: #f7f8fa; }
.success-area { display: flex; flex-direction: column; align-items: center; padding-top: 80px; }
.success-area h2 { margin: 16px 0 8px; }
.success-area p { color: #999; }
</style>
