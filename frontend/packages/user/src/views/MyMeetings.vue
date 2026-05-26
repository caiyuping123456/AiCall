<template>
  <div class="page">
    <van-nav-bar title="我的会诊" left-arrow @click-left="$router.back()" />
    <div class="content">
      <van-empty v-if="!loading && list.length === 0" description="暂无已确认的会诊" />
      <van-cell-group inset v-for="item in list" :key="item.id" style="margin-bottom: 12px">
        <van-cell :title="item.consultationNo" :label="item.department || '未知科室'" is-link @click="goDetail(item)">
          <template #value>
            <van-tag :type="statusTag[String(item.status)] || 'default'" size="medium">
              {{ statusMap[item.status] || '未知' }}
            </van-tag>
          </template>
        </van-cell>
        <van-cell :title="'费用'" :value="'¥' + (item.fee ?? 0)" />
        <van-cell :title="'创建时间'" :value="formatDate(item.createTime)" />
      </van-cell-group>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import type { TagType } from 'vant';
import { getMeetings } from '@aicall/shared';

const router = useRouter();
const loading = ref(false);
const list = ref<any[]>([]);

const statusMap: Record<string, string> = {
  '3': '已排期', '4': '待会诊', '5': '报告已签发', '6': '已完成',
};
const statusTag: Record<string, TagType> = {
  '3': 'primary', '4': 'warning', '5': 'primary', '6': 'success',
};

onMounted(loadData);

async function loadData() {
  loading.value = true;
  try {
    list.value = await getMeetings() as any[];
  } catch (e: any) {
    showToast(e.message || '加载失败');
  } finally {
    loading.value = false;
  }
}

function goDetail(item: any) {
  if (item.status === 3 || item.status === 4) {
    router.push(`/consultation/${item.id}/room`);
  } else if (item.status >= 3) {
    router.push(`/consultation/${item.id}/status`);
  } else {
    router.push(`/consultation/${item.id}/summary`);
  }
}

function formatDate(date: string) {
  return date ? date.substring(0, 10) : '';
}
</script>

<style scoped>
.page { min-height: 100vh; background: #f7f8fa; }
.content { padding: 16px; }
</style>
