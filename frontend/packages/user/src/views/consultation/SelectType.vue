<template>
  <div class="page">
    <van-nav-bar title="选择会诊类型" left-arrow @click-left="router.push('/consultation/upload')" />
    <van-steps :active="4" active-color="#1989fa">
      <van-step>登录</van-step>
      <van-step>预问诊</van-step>
      <van-step>摘要</van-step>
      <van-step>上传资料</van-step>
      <van-step>选择类型</van-step>
      <van-step>支付</van-step>
    </van-steps>
    <div class="content">
      <van-cell-group inset>
        <van-cell title="单学科会诊" label="¥500.00 · 一位专家看诊" is-link @click="select(1)" />
        <van-cell title="多学科MDT会诊" label="¥1,500.00 · 多位专家联合看诊" is-link @click="select(2)" />
      </van-cell-group>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useConsultationFlowStore } from '@/stores/consultationFlow';

const router = useRouter();
const flow = useConsultationFlowStore();

function select(type: number) {
  flow.setSelectedType(type);
  // Navigate to pay - doctor selection will be done via department/doctor list
  // For now, clear any previous doctor selection
  flow.setSelectedDoctorIds([]);
  flow.nextStep(6);
  router.push('/consultation/pay');
}
</script>

<style scoped>
.page { min-height: 100vh; background: #f7f8fa; }
.content { padding: 16px; }
</style>
