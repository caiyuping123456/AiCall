<template>
  <div class="home">
    <section class="hero-card">
      <div class="hero-top">
        <div>
          <div class="eyebrow">AI 医疗会诊</div>
          <h1>Hi，{{ userName || '用户' }}</h1>
          <p>用智能预问诊整理病情，连接医生完成线上会诊。</p>
        </div>
        <button class="notify-btn" type="button" @click="$router.push('/notifications')">
          <van-icon name="bell" size="21" />
        </button>
      </div>
      <div class="hero-actions">
        <button type="button" @click="$router.push('/consultation/start')">发起会诊</button>
        <button type="button" class="secondary" @click="$router.push('/departments')">预约医生</button>
      </div>
    </section>

    <main class="content">
      <section class="quick-grid mobile-card">
        <div class="quick-item" @click="$router.push('/departments')">
          <div class="quick-icon blue"><van-icon name="guide-o" size="23" /></div>
          <span>挂号</span>
        </div>
        <div class="quick-item" @click="$router.push('/consultation/start')">
          <div class="quick-icon teal"><van-icon name="add-o" size="23" /></div>
          <span>发起会诊</span>
        </div>
        <div class="quick-item" @click="$router.push('/meetings')">
          <div class="quick-icon amber"><van-icon name="records-o" size="23" /></div>
          <span>我的会诊</span>
        </div>
        <div class="quick-item" @click="$router.push('/followup')">
          <div class="quick-icon violet"><van-icon name="todo-o" size="23" /></div>
          <span>随访</span>
        </div>
      </section>

      <section class="section-heading">
        <div>
          <h2>最近会诊</h2>
          <p>跟踪当前会诊进度和报告状态</p>
        </div>
        <button type="button" @click="$router.push('/meetings')">全部</button>
      </section>

      <van-loading v-if="loadingRecent" size="20" class="center-loading" />
      <div v-else-if="recentList.length === 0" class="empty-state mobile-card">
        <van-icon name="records-o" size="32" color="#94a3b8" />
        <div>暂无会诊记录</div>
        <p>可以从挂号或 AI 预问诊开始</p>
      </div>
      <div v-else class="recent-list">
        <div v-for="item in recentList" :key="item.id" class="recent-card mobile-card" @click="goDetail(item)">
          <div class="recent-main">
            <div class="recent-no">{{ item.consultationNo }}</div>
            <div class="recent-dept">{{ item.department || '未指定科室' }}</div>
          </div>
          <van-tag :type="statusType(item.status)" size="medium">{{ statusText(item.status) }}</van-tag>
        </div>
      </div>
    </main>

    <ChatWidget />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import type { TagType } from 'vant';
import ChatWidget from '@/components/ChatWidget.vue';
import { queryConsultations } from '@aicall/shared';

const router = useRouter();
const userName = ref(localStorage.getItem('patientName') || '');
const recentList = ref<any[]>([]);
const loadingRecent = ref(true);

const STATUS_MAP: Record<number, string> = {
  0: '草稿', 1: '摘要已生成', 2: '已提交', 3: '已排期', 4: '待会诊', 5: '报告已签发', 6: '已完成', 7: '已取消', 8: '已退回'
};
const STATUS_TYPE: Record<number, TagType> = {
  0: 'default', 1: 'primary', 2: 'warning', 3: 'success', 4: 'warning', 5: 'primary', 6: 'default', 7: 'danger', 8: 'danger'
};
function statusText(s: number) { return STATUS_MAP[s] || '未知'; }
function statusType(s: number): TagType { return STATUS_TYPE[s] || 'default'; }

function goDetail(item: any) {
  if (item.status === 3 || item.status === 4) {
    router.push(`/consultation/${item.id}/room`);
  } else if (item.status >= 3) {
    router.push(`/consultation/${item.id}/status`);
  } else {
    router.push(`/consultation/${item.id}/summary`);
  }
}

onMounted(async () => {
  try {
    const list = await queryConsultations() as any[];
    recentList.value = list.slice(0, 3);
  } catch {}
  loadingRecent.value = false;
});
</script>

<style scoped>
.home {
  min-height: 100vh;
  padding-bottom: 90px;
  background: transparent;
}

.hero-card {
  margin: 14px 14px 0;
  padding: 20px;
  color: #fff;
  border-radius: 18px;
  background:
    linear-gradient(135deg, rgba(37, 99, 235, 0.95), rgba(20, 184, 166, 0.86)),
    #2563eb;
  box-shadow: 0 18px 42px rgba(37, 99, 235, 0.24);
}

.hero-top {
  display: flex;
  justify-content: space-between;
  gap: 14px;
}

.eyebrow {
  font-size: 12px;
  font-weight: 700;
  opacity: 0.82;
}

h1 {
  margin: 6px 0 4px;
  font-size: 25px;
  line-height: 1.2;
}

p {
  margin: 0;
}

.hero-card p {
  max-width: 240px;
  color: rgba(255, 255, 255, 0.78);
  font-size: 13px;
  line-height: 1.55;
}

.notify-btn {
  width: 42px;
  height: 42px;
  border: 1px solid rgba(255, 255, 255, 0.26);
  border-radius: 14px;
  color: #fff;
  background: rgba(255, 255, 255, 0.16);
}

.hero-actions {
  display: flex;
  gap: 10px;
  margin-top: 18px;
}

.hero-actions button {
  height: 40px;
  padding: 0 16px;
  border: 0;
  border-radius: 10px;
  color: #1d4ed8;
  background: #fff;
  font-weight: 800;
}

.hero-actions .secondary {
  color: #fff;
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.24);
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  padding: 16px 10px;
}

.quick-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--text-color);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.quick-icon {
  width: 46px;
  height: 46px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.quick-icon.blue { background: linear-gradient(135deg, #2563eb, #60a5fa); }
.quick-icon.teal { background: linear-gradient(135deg, #0f766e, #14b8a6); }
.quick-icon.amber { background: linear-gradient(135deg, #d97706, #f59e0b); }
.quick-icon.violet { background: linear-gradient(135deg, #7c3aed, #a78bfa); }

.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 20px 0 12px;
}

.section-heading h2 {
  margin: 0;
  color: var(--text-color);
  font-size: 17px;
}

.section-heading p {
  margin-top: 4px;
  color: var(--text-secondary);
  font-size: 12px;
}

.section-heading button {
  border: 0;
  color: var(--primary-color);
  background: transparent;
  font-weight: 700;
}

.empty-state {
  padding: 28px 16px;
  text-align: center;
  color: var(--text-color);
  font-weight: 700;
}

.empty-state p {
  margin-top: 6px;
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 400;
}

.recent-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.recent-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px;
  cursor: pointer;
}

.recent-main {
  min-width: 0;
}

.recent-no {
  color: var(--text-color);
  font-size: 14px;
  font-weight: 800;
}

.recent-dept {
  margin-top: 5px;
  color: var(--text-secondary);
  font-size: 12px;
}
</style>
