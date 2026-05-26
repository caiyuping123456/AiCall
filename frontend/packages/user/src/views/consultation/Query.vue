<template>
  <div class="page">
    <van-nav-bar title="查询会诊" left-arrow @click-left="$router.back()" />
    <div class="content">
      <van-cell-group inset v-if="list.length > 0">
        <van-cell v-for="item in list" :key="item.id" :title="item.consultationNo" :label="`状态: ${statusText(item.status)}`" is-link @click="goDetail(item)">
          <template #extra>
            <van-button v-if="item.status >= 5" size="small" type="primary" @click.stop="viewReport(item)">查看报告</van-button>
          </template>
        </van-cell>
      </van-cell-group>
      <van-empty v-else description="暂无会诊记录" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { queryConsultations } from '@aicall/shared';

const router = useRouter();
const list = ref<any[]>([]);
const STATUS_MAP: Record<number, string> = { 0: '草稿', 1: '资料审核中', 2: '已提交', 3: '已排期', 4: '待会诊', 5: '会诊中', 6: '已完成', 7: '已取消', 8: '已退回' };
function statusText(s: number) { return STATUS_MAP[s] || '未知'; }

function goDetail(item: any) {
  if (item.status >= 3) {
    router.push(`/consultation/${item.id}/status`);
  } else {
    router.push(`/consultation/${item.id}/summary`);
  }
}

function viewReport(item: any) {
  router.push(`/consultation/${item.id}/report`);
}

onMounted(async () => {
  try { list.value = await queryConsultations() as any[]; } catch {}
});
</script>

<style scoped>
.page { min-height: 100vh; background: #f7f8fa; }
.content { padding: 16px; }
</style>
