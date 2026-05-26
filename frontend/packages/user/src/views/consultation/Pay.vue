<template>
  <div class="page">
    <van-nav-bar title="确认支付" left-arrow @click-left="$router.back()" />
    <van-steps :active="5" active-color="#1989fa">
      <van-step>登录</van-step>
      <van-step>预问诊</van-step>
      <van-step>摘要</van-step>
      <van-step>上传资料</van-step>
      <van-step>选择类型</van-step>
      <van-step>支付</van-step>
    </van-steps>
    <div class="content">
      <van-cell-group inset>
        <van-cell title="会诊类型" :value="consultationTypeLabel" />
        <van-cell title="会诊费用" :value="feeLabel" />
      </van-cell-group>
      <div class="btn-area">
        <van-button type="primary" block @click="handlePay" :loading="loading">
          确认支付 {{ feeLabel }}
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import { submitConsultation } from '@aicall/shared';
import { useConsultationFlowStore } from '@/stores/consultationFlow';

const router = useRouter();
const flow = useConsultationFlowStore();
const loading = ref(false);

const consultationTypeLabel = computed(() =>
  flow.state.selectedType === 2 ? '多学科MDT会诊' : '单学科会诊'
);

const feeCents = computed(() =>
  flow.state.selectedType === 2 ? 1500.00 : 500.00
);

const feeLabel = computed(() => `¥${feeCents.value.toFixed(2)}`);

async function handlePay() {
  if (!flow.state.chiefComplaint) {
    showToast('缺少主诉信息，请返回重新填写');
    return;
  }

  loading.value = true;
  try {
    await submitConsultation({
      department: flow.state.department || '未指定',
      type: flow.state.selectedType || 1,
      doctorIds: flow.state.selectedDoctorIds,
      chiefComplaint: flow.state.chiefComplaint,
      medicalSummary: flow.state.medicalSummary,
      chatHistory: flow.state.chatHistory,
      fileIds: flow.state.uploadedFileIds,
    });
    flow.nextStep(7);
    router.push('/consultation/success');
  } catch (e: any) {
    showToast(e.message || '提交失败');
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.page { min-height: 100vh; background: #f7f8fa; }
.content { padding: 16px; }
.btn-area { padding: 24px 16px; }
</style>
