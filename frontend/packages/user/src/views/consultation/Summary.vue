<template>
  <div class="page">
    <van-nav-bar title="病情摘要" left-arrow @click-left="$router.back()" />
    <van-steps :active="2" active-color="#1989fa">
      <van-step>登录</van-step>
      <van-step>预问诊</van-step>
      <van-step>摘要</van-step>
      <van-step>上传资料</van-step>
      <van-step>选择类型</van-step>
      <van-step>支付</van-step>
    </van-steps>
    <div class="content">
      <template v-if="generating">
        <div class="generating">
          <van-loading size="24px" vertical>正在生成病情摘要...</van-loading>
        </div>
      </template>
      <template v-else>
        <van-cell-group inset title="病情摘要">
          <van-field v-model="summary" type="textarea" rows="10" autosize placeholder="请查看并编辑病情摘要" />
        </van-cell-group>
        <div class="btn-area">
          <van-button type="primary" block @click="confirm" :loading="loading">确认并继续</van-button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showToast } from 'vant';
import { getSummary, updateSummary } from '@aicall/shared';
import { useConsultationFlowStore } from '@/stores/consultationFlow';

const route = useRoute();
const router = useRouter();
const flow = useConsultationFlowStore();
const summary = ref('');
const loading = ref(false);
const generating = ref(false);

// If accessed with a consultation ID, load from API (legacy/external navigation)
// Otherwise use Pinia store (new flow)
const hasConsultationId = !!route.params.id;

onMounted(() => {
  if (hasConsultationId) {
    fetchSummary();
  } else {
    // Load from Pinia store for the new flow
    if (flow.state.medicalSummary) {
      summary.value = flow.state.medicalSummary;
    } else if (flow.state.chatHistory.length > 0) {
      generating.value = true;
      setTimeout(() => {
        summary.value = buildSummaryFromChat(flow.state.chatHistory);
        generating.value = false;
      }, 1500);
    } else {
      summary.value = flow.state.chiefComplaint
        ? `主诉：${flow.state.chiefComplaint}`
        : '';
    }
  }
});

function buildSummaryFromChat(chat: { role: string; content: string }[]): string {
  const userMessages = chat.filter(m => m.role === 'user').map(m => m.content);
  return [
    '主诉：' + (flow.state.chiefComplaint || userMessages[0] || ''),
    ...userMessages.slice(1).map((m, i) => `补充信息${i + 1}：${m}`),
  ].join('\n');
}

async function fetchSummary() {
  if (!hasConsultationId) return;
  const consultationId = Number(route.params.id);
  try {
    const result = await getSummary(consultationId);
    if (result) {
      summary.value = result;
      generating.value = false;
    } else {
      generating.value = true;
      setTimeout(fetchSummary, 2000);
    }
  } catch (e: any) {
    showToast(e.message || '获取摘要失败');
    generating.value = false;
  }
}

async function confirm() {
  if (!summary.value) {
    showToast('摘要不能为空');
    return;
  }
  loading.value = true;

  if (hasConsultationId) {
    // Legacy mode: save to API
    const consultationId = Number(route.params.id);
    try {
      await updateSummary(consultationId, summary.value);
      router.push(`/consultation/${consultationId}/upload`);
    } catch (e: any) {
      showToast(e.message || '保存失败');
    }
  } else {
    // New flow: store in Pinia and continue
    flow.setMedicalSummary(summary.value);
    flow.nextStep(4);
    router.push('/consultation/upload');
  }

  loading.value = false;
}
</script>

<style scoped>
.page { min-height: 100vh; background: #f7f8fa; }
.content { padding: 16px; }
.generating { text-align: center; padding: 48px 0; }
.btn-area { padding: 24px 16px; }
</style>
