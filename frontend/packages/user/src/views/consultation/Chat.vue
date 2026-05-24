<template>
  <div class="page">
    <van-nav-bar title="AI预问诊" left-arrow @click-left="$router.back()" />
    <van-steps :active="1" active-color="#1989fa">
      <van-step>登录</van-step>
      <van-step>预问诊</van-step>
      <van-step>摘要</van-step>
      <van-step>上传资料</van-step>
      <van-step>选择类型</van-step>
      <van-step>支付</van-step>
    </van-steps>
    <div class="chat-area" ref="chatArea">
      <div v-for="(msg, i) in messages" :key="i" :class="['msg', msg.role === 'user' ? 'user' : 'ai']">
        <div class="bubble">{{ msg.content }}</div>
      </div>
      <div v-if="loading" class="msg ai"><div class="bubble">思考中...</div></div>
    </div>
    <div class="input-area">
      <van-field v-model="input" placeholder="请描述您的症状..." @keyup.enter="send" />
      <van-button type="primary" size="small" @click="send" :disabled="!input.trim() || loading">发送</van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showToast, showDialog } from 'vant';
import { chatMessage, generateSummary } from '@aicall/shared';

const route = useRoute();
const router = useRouter();
const consultationId = Number(route.params.id);

const messages = ref<{ role: 'user' | 'ai'; content: string }[]>([]);
const input = ref('');
const loading = ref(false);
const chatArea = ref<HTMLElement>();

onMounted(() => {
  messages.value.push({ role: 'ai', content: '您好，我是AICall分诊护士，请问您哪里不舒服？' });
});

async function send() {
  const text = input.value.trim();
  if (!text || loading.value) return;

  messages.value.push({ role: 'user', content: text });
  input.value = '';
  loading.value = true;
  scrollToBottom();

  try {
    const res = await chatMessage(consultationId, text);
    messages.value.push({ role: 'ai', content: res.reply });
    scrollToBottom();

    if (res.finished) {
      await showDialog({ title: '问诊完成', message: 'AI已收集足够信息，正在生成摘要...' });
      const summary = await generateSummary(consultationId);
      router.push(`/consultation/${consultationId}/summary`);
    }
  } catch (e: any) {
    showToast(e.message || '发送失败');
  } finally {
    loading.value = false;
  }
}

function scrollToBottom() {
  nextTick(() => {
    if (chatArea.value) chatArea.value.scrollTop = chatArea.value.scrollHeight;
  });
}
</script>

<style scoped>
.page { display: flex; flex-direction: column; height: 100vh; background: #f7f8fa; }
.chat-area { flex: 1; overflow-y: auto; padding: 12px; }
.msg { margin-bottom: 12px; display: flex; }
.msg.user { justify-content: flex-end; }
.msg.ai { justify-content: flex-start; }
.bubble { max-width: 75%; padding: 10px 14px; border-radius: 8px; font-size: 14px; line-height: 1.5; }
.msg.user .bubble { background: #1989fa; color: #fff; }
.msg.ai .bubble { background: #fff; color: #333; }
.input-area { display: flex; padding: 8px; background: #fff; border-top: 1px solid #eee; gap: 8px; align-items: center; }
.input-area .van-field { flex: 1; }
</style>
