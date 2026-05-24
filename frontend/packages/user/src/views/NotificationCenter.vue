<template>
  <div class="page">
    <van-nav-bar title="通知中心" />
    <div class="content">
      <van-empty v-if="!loading && list.length === 0" description="暂无通知" />
      <van-cell-group inset>
        <van-cell v-for="item in list" :key="item.id"
          :title="item.title" :label="item.content" :value="item.createTime?.slice(0, 10)"
          @click="handleRead(item)" />
      </van-cell-group>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { showToast } from 'vant';
import { getUserNotifications, markNotificationRead, type NotificationItem } from '@aicall/shared';

const list = ref<NotificationItem[]>([]);
const loading = ref(false);

onMounted(async () => {
  loading.value = true;
  try { list.value = await getUserNotifications(); }
  catch (e: any) { showToast(e.message || '加载失败'); }
  finally { loading.value = false; }
});

async function handleRead(item: NotificationItem) {
  if (item.status !== 2) {
    try { await markNotificationRead(item.id); item.status = 2; } catch {}
  }
}
</script>

<style scoped>
.page { min-height: 100vh; background: #f7f8fa; }
.content { padding: 12px; }
</style>
