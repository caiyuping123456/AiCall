<template>
  <div class="chat-widget">
    <div v-if="!visible" class="chat-fab" @click="visible = true">
      <van-icon name="chat-o" size="24" color="#fff" />
    </div>

    <div v-else class="chat-panel">
      <div class="chat-header">
        <span>AI 医学助手</span>
        <van-icon name="cross" @click="visible = false" />
      </div>

      <div class="chat-messages" ref="msgListRef">
        <div v-if="messages.length === 0" class="empty-tip">您好，我是AI医学助手，可以为您解答常见医学问题。请注意，回答仅供参考。</div>
        <div v-for="(msg, idx) in messages" :key="idx" :class="['msg', msg.role]">
          <div class="msg-content">{{ msg.content }}</div>
          <div v-if="msg.sources && msg.sources.length" class="msg-sources">
            <div class="sources-title">参考来源：</div>
            <div v-for="(s, si) in msg.sources" :key="si" class="source-item">
              <span class="source-name">{{ s.fileName }}</span>
              <span class="source-snippet">{{ s.snippet }}</span>
            </div>
          </div>
        </div>
        <div v-if="sending" class="msg ai"><div class="msg-content typing">正在思考...</div></div>
      </div>

      <div class="chat-input">
        <input v-model="input" placeholder="请输入医学问题..." @keyup.enter="send" :disabled="sending" />
        <van-button size="small" type="primary" @click="send" :loading="sending" :disabled="!input.trim()">发送</van-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue';
import { chatWithKnowledge } from '@aicall/shared';

interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
  sources?: { fileName: string; snippet: string }[];
}

const visible = ref(false);
const input = ref('');
const sending = ref(false);
const messages = ref<ChatMessage[]>([]);
const msgListRef = ref<HTMLElement>();

async function send() {
  const q = input.value.trim();
  if (!q || sending.value) return;

  messages.value.push({ role: 'user', content: q });
  input.value = '';
  sending.value = true;
  await nextTick();
  scrollBottom();

  try {
    const res = await chatWithKnowledge(q);
    messages.value.push({ role: 'ai', content: res.answer, sources: res.sources });
  } catch (e: any) {
    messages.value.push({ role: 'ai', content: '抱歉，请求失败：' + (e.message || '未知错误') });
  } finally {
    sending.value = false;
    await nextTick();
    scrollBottom();
  }
}

function scrollBottom() {
  if (msgListRef.value) {
    msgListRef.value.scrollTop = msgListRef.value.scrollHeight;
  }
}
</script>

<style scoped>
.chat-widget { position: fixed; bottom: 80px; right: 16px; z-index: 1000; }
.chat-fab {
  width: 56px; height: 56px; border-radius: 50%; background: #1989fa;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 2px 12px rgba(0,0,0,0.2); cursor: pointer;
}
.chat-panel {
  width: 340px; max-height: 500px; background: #fff; border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15); display: flex; flex-direction: column; overflow: hidden;
}
.chat-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 16px; background: #1989fa; color: #fff; font-size: 16px; font-weight: 600;
}
.chat-messages { flex: 1; overflow-y: auto; padding: 12px; max-height: 350px; background: #f5f7fa; }
.empty-tip { text-align: center; color: #999; font-size: 13px; padding: 20px 0; }
.msg { margin-bottom: 12px; }
.msg.user { display: flex; justify-content: flex-end; }
.msg.user .msg-content { background: #1989fa; color: #fff; border-radius: 12px 12px 0 12px; }
.msg.ai .msg-content { background: #fff; border-radius: 12px 12px 12px 0; }
.msg-content { padding: 8px 12px; max-width: 80%; font-size: 14px; line-height: 1.6; word-break: break-word; }
.typing { color: #999; }
.msg-sources { margin-top: 4px; padding: 6px 8px; background: #f0f0f0; border-radius: 6px; font-size: 12px; }
.sources-title { color: #666; margin-bottom: 2px; }
.source-item { margin: 2px 0; }
.source-name { color: #1989fa; margin-right: 6px; }
.source-snippet { color: #999; }
.chat-input { display: flex; gap: 8px; padding: 8px 12px; border-top: 1px solid #eee; align-items: center; }
.chat-input input { flex: 1; border: 1px solid #e0e0e0; border-radius: 20px; padding: 6px 12px; font-size: 14px; outline: none; }
</style>
