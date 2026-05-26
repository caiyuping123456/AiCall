<template>
  <div>
    <van-nav-bar title="会诊报告" left-arrow @click-left="router.back()" />
    <div style="padding: 16px" v-if="report">
      <van-cell-group v-for="(label, key) in labels" :key="key" :title="label" style="margin-bottom: 8px">
        <van-cell :value="report.fields?.[key] || '无'" />
      </van-cell-group>
    </div>
    <van-empty v-else-if="!loading" description="报告不存在或尚未签发" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getUserReport } from '@aicall/shared';
import { showToast } from 'vant';

const route = useRoute();
const router = useRouter();
const id = Number(route.params.id);
const loading = ref(false);
const report = ref<any>(null);

const labels: Record<string, string> = {
  chiefComplaint: '主诉',
  presentIllness: '现病史',
  pastHistory: '既往史',
  examinationFindings: '检查所见',
  diagnosis: '诊断意见',
  analysis: '分析说明',
  recommendation: '建议',
  followUp: '随访建议',
};

onMounted(async () => {
  loading.value = true;
  try {
    report.value = await getUserReport(id);
  } catch (e: any) {
    showToast(e.message || '加载失败');
  } finally {
    loading.value = false;
  }
});
</script>
