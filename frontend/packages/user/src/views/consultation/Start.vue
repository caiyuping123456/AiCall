<template>
  <div class="page">
    <van-nav-bar title="选择预问诊方式" left-arrow @click-left="$router.back()" />
    <van-steps :active="1" active-color="#1989fa">
      <van-step>登录</van-step>
      <van-step>预问诊</van-step>
      <van-step>摘要</van-step>
      <van-step>上传资料</van-step>
      <van-step>选择类型</van-step>
      <van-step>支付</van-step>
    </van-steps>
    <div class="content">
      <van-cell-group inset>
        <van-cell title="对话模式" label="与AI护士对话，逐步描述病情" is-link @click="startChat" />
        <van-cell title="表单模式" label="填写表单，AI生成摘要" is-link @click="startForm" />
      </van-cell-group>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useConsultationFlowStore } from '@/stores/consultationFlow';

const router = useRouter();
const flow = useConsultationFlowStore();

onMounted(() => {
  if (flow.state.step > 1 && !flow.isExpired) {
    navigateToStep(flow.state.step);
  } else {
    flow.reset();
  }
});

function navigateToStep(step: number) {
  const routes: Record<number, string> = {
    2: '/consultation/chat',
    3: '/consultation/summary',
    4: '/consultation/upload',
    5: '/consultation/select-type',
    6: '/consultation/pay',
    7: '/consultation/success',
  };
  const path = routes[step];
  if (path) router.push(path);
}

function startChat() {
  flow.reset();
  flow.nextStep(2);
  router.push('/consultation/chat');
}

function startForm() {
  flow.reset();
  flow.nextStep(2);
  router.push('/consultation/form');
}
</script>

<style scoped>
.page { min-height: 100vh; background: #f7f8fa; }
.content { padding: 16px; }
</style>
