<template>
  <div class="page">
    <van-nav-bar title="会诊评价" />
    <div class="content">
      <van-empty v-if="!loading && list.length === 0" description="暂无待评价会诊" />
      <div v-for="item in list" :key="item.id" class="eval-card">
        <div class="eval-header">{{ item.consultationNo }}</div>
        <div class="eval-row"><span>医生评分</span><van-rate v-model="scores[item.consultationId]" :count="5" /></div>
        <div class="eval-row"><span>服务评分</span><van-rate v-model="services[item.consultationId]" :count="5" /></div>
        <van-field v-model="comments[item.consultationId]" type="textarea" :rows="2" placeholder="文字评价（可选）" />
        <van-button type="primary" size="small" :loading="submitting === item.consultationId"
          @click="handleSubmit(item.consultationId)" style="margin-top: 8px">提交评价</van-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { showToast } from 'vant';
import { getPendingEvaluations, submitEvaluation, type EvaluationItem } from '@aicall/shared';

const list = ref<EvaluationItem[]>([]);
const loading = ref(false);
const submitting = ref(0);
const scores = reactive<Record<number, number>>({});
const services = reactive<Record<number, number>>({});
const comments = reactive<Record<number, string>>({});

onMounted(async () => {
  loading.value = true;
  try {
    list.value = await getPendingEvaluations();
    list.value.forEach(e => { scores[e.consultationId] = 0; services[e.consultationId] = 0; comments[e.consultationId] = ''; });
  } catch (e: any) { showToast(e.message || '加载失败'); }
  finally { loading.value = false; }
});

async function handleSubmit(consultationId: number) {
  submitting.value = consultationId;
  try {
    await submitEvaluation(consultationId, {
      doctorScore: scores[consultationId],
      serviceScore: services[consultationId],
      comment: comments[consultationId],
    });
    showToast('感谢反馈');
    list.value = list.value.filter(e => e.consultationId !== consultationId);
  } catch (e: any) { showToast(e.message || '提交失败'); }
  finally { submitting.value = 0; }
}
</script>

<style scoped>
.page { min-height: 100vh; background: #f7f8fa; }
.content { padding: 12px; }
.eval-card { background: #fff; border-radius: 8px; padding: 16px; margin-bottom: 12px; }
.eval-header { font-size: 16px; font-weight: 600; margin-bottom: 12px; }
.eval-row { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
</style>
