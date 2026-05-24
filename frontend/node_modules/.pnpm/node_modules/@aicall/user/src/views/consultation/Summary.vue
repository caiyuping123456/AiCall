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
      <van-cell-group inset title="AI生成的病情摘要">
        <van-field v-model="summary" type="textarea" rows="10" autosize />
      </van-cell-group>
      <div class="btn-area">
        <van-button type="primary" block @click="confirm" :loading="loading">确认并继续</van-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showToast } from 'vant';
import { getSummary, updateSummary } from '@aicall/shared';

const route = useRoute();
const router = useRouter();
const consultationId = Number(route.params.id);
const summary = ref('');
const loading = ref(false);

onMounted(async () => {
  try {
    summary.value = await getSummary(consultationId);
  } catch (e: any) {
    showToast(e.message || '获取摘要失败');
  }
});

async function confirm() {
  if (!summary.value) {
    showToast('摘要不能为空');
    return;
  }
  loading.value = true;
  try {
    await updateSummary(consultationId, summary.value);
    router.push(`/consultation/${consultationId}/upload`);
  } catch (e: any) {
    showToast(e.message || '保存失败');
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
