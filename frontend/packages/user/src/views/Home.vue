<template>
  <div class="home">
    <div class="header">
      <div class="header-top">
        <div class="greeting">Hi，{{ userName || '用户' }}</div>
        <van-icon name="bell" size="22" color="#fff" @click="$router.push('/notifications')" />
      </div>
      <div class="header-sub">AICall 智慧会诊平台</div>
    </div>

    <div class="content">
      <div class="quick-grid">
        <div class="quick-item" @click="$router.push('/departments')">
          <div class="quick-icon" style="background: linear-gradient(135deg, #1989fa, #4fc3f7);">
            <van-icon name="guide-o" size="24" color="#fff" />
          </div>
          <span>挂号</span>
        </div>
        <div class="quick-item" @click="$router.push('/consultation/start')">
          <div class="quick-icon" style="background: linear-gradient(135deg, #07c160, #6dd400);">
            <van-icon name="add-o" size="24" color="#fff" />
          </div>
          <span>发起会诊</span>
        </div>
        <div class="quick-item" @click="$router.push('/meetings')">
          <div class="quick-icon" style="background: linear-gradient(135deg, #ff976a, #ff6034);">
            <van-icon name="records-o" size="24" color="#fff" />
          </div>
          <span>我的会诊</span>
        </div>
        <div class="quick-item" @click="$router.push('/followup')">
          <div class="quick-icon" style="background: linear-gradient(135deg, #9b59b6, #c39bd3);">
            <van-icon name="todo-o" size="24" color="#fff" />
          </div>
          <span>随访</span>
        </div>
      </div>

      <div class="section-title">最近会诊</div>
      <van-loading v-if="loadingRecent" size="20" />
      <div v-else-if="recentList.length === 0" class="empty-tip">暂无会诊记录，点击上方"挂号"开始</div>
      <div v-else class="recent-list">
        <div v-for="item in recentList" :key="item.id" class="recent-card" @click="goDetail(item)">
          <div class="recent-left">
            <div class="recent-no">{{ item.consultationNo }}</div>
            <div class="recent-dept">{{ item.department || '未指定科室' }}</div>
          </div>
          <van-tag :type="statusType(item.status)" size="medium">{{ statusText(item.status) }}</van-tag>
        </div>
      </div>
    </div>

    <ChatWidget />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import ChatWidget from '@/components/ChatWidget.vue';
import { queryConsultations } from '@aicall/shared';

const router = useRouter();
const userName = ref(localStorage.getItem('patientName') || '');
const recentList = ref<any[]>([]);
const loadingRecent = ref(true);

const STATUS_MAP: Record<number, string> = {
  0: '草稿', 1: '摘要已生成', 2: '待审核', 3: '待会诊', 4: '会诊中', 5: '报告已签', 6: '已完成', 7: '已取消', 8: '已退回'
};
const STATUS_TYPE: Record<number, string> = {
  0: 'default', 1: 'primary', 2: 'warning', 3: 'success', 4: 'success', 5: 'primary', 6: 'default', 7: 'danger', 8: 'danger'
};
function statusText(s: number) { return STATUS_MAP[s] || '未知'; }
function statusType(s: number) { return STATUS_TYPE[s] || 'default'; }

function goDetail(item: any) {
  if (item.status >= 3) {
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
.home { min-height: 100vh; background: #f7f8fa; padding-bottom: 70px; }
.header {
  background: linear-gradient(135deg, #1989fa, #4fc3f7);
  padding: 24px 20px 28px;
  color: #fff;
}
.header-top { display: flex; justify-content: space-between; align-items: center; }
.greeting { font-size: 22px; font-weight: 600; }
.header-sub { font-size: 13px; opacity: 0.85; margin-top: 4px; }
.content { padding: 0 16px; margin-top: -12px; }
.quick-grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;
  background: #fff; border-radius: 12px; padding: 20px 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
}
.quick-item { display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer; }
.quick-item:active { opacity: 0.7; }
.quick-icon { width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; }
.quick-item span { font-size: 13px; color: #323233; }
.section-title { font-size: 16px; font-weight: 600; color: #323233; margin: 20px 0 12px; }
.empty-tip { text-align: center; color: #969799; font-size: 14px; padding: 20px 0; }
.recent-list { display: flex; flex-direction: column; gap: 10px; }
.recent-card {
  background: #fff; border-radius: 10px; padding: 14px 16px;
  display: flex; justify-content: space-between; align-items: center;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05); cursor: pointer;
}
.recent-card:active { background: #f5f5f5; }
.recent-no { font-size: 14px; font-weight: 500; color: #323233; }
.recent-dept { font-size: 12px; color: #969799; margin-top: 4px; }
</style>