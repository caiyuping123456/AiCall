<template>
  <div class="page">
    <van-nav-bar title="随访问卷" />
    <div class="content" v-if="detail">
      <div class="info-card">
        <div class="info-title">第{{ detail.planDay }}天随访</div>
        <div class="info-sub">会诊编号：{{ detail.consultationNo }}</div>
      </div>

      <div v-if="detail.status >= 2">
        <div class="section-title">回答内容</div>
        <div class="answer-box">{{ detail.answer || '暂无' }}</div>
        <div v-if="detail.aiAnalysis" class="section-title">AI 分析</div>
        <div class="answer-box" style="background: #fff3e0" v-if="detail.aiAnalysis">{{ detail.aiAnalysis }}</div>
      </div>

      <div v-else>
        <div class="section-title">问卷</div>
        <div v-for="(q, idx) in questions" :key="idx" class="question-card">
          <div class="q-title">{{ idx + 1 }}. {{ q.question }}</div>
          <van-radio-group v-if="q.type === 'radio'" v-model="answers[idx]" direction="horizontal">
            <van-radio v-for="opt in q.options" :key="opt" :name="opt">{{ opt }}</van-radio>
          </van-radio-group>
          <van-field v-else v-model="answers[idx]" type="textarea" :rows="3" placeholder="请输入" />
        </div>
        <van-button type="primary" block :loading="submitting" @click="handleSubmit" style="margin-top: 16px">
          提交问卷
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showToast } from 'vant';
import { getFollowUpDetail, submitFollowUpAnswer } from '@aicall/shared';

const route = useRoute();
const router = useRouter();
const id = Number(route.params.id);
const detail = ref<any>(null);
const questions = ref<any[]>([]);
const answers = ref<string[]>([]);
const submitting = ref(false);

onMounted(async () => {
  try {
    detail.value = await getFollowUpDetail(id);
    if (detail.value.questionnaire) {
      const raw = detail.value.questionnaire.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
      questions.value = JSON.parse(raw);
      answers.value = new Array(questions.value.length).fill('');
    }
  } catch (e: any) { showToast(e.message || '加载失败'); }
});

async function handleSubmit() {
  submitting.value = true;
  try {
    await submitFollowUpAnswer(id, JSON.stringify(answers.value));
    showToast('提交成功');
    router.push('/followup');
  } catch (e: any) {
    showToast(e.message || '提交失败');
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped>
.page { min-height: 100vh; background: #f7f8fa; }
.content { padding: 12px; }
.info-card { background: #fff; border-radius: 8px; padding: 16px; margin-bottom: 12px; }
.info-title { font-size: 18px; font-weight: 600; }
.info-sub { color: #999; font-size: 13px; margin-top: 4px; }
.section-title { font-size: 15px; font-weight: 600; margin: 12px 0 8px; padding-left: 4px; }
.answer-box { background: #fff; border-radius: 8px; padding: 16px; white-space: pre-wrap; line-height: 1.6; }
.question-card { background: #fff; border-radius: 8px; padding: 14px; margin-bottom: 10px; }
.q-title { font-weight: 500; margin-bottom: 10px; }
</style>
