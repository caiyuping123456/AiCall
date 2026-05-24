<template>
  <div class="page">
    <van-nav-bar title="我的随访" />
    <div class="content">
      <van-empty v-if="!loading && list.length === 0" description="暂无随访记录" />
      <van-cell-group inset v-for="item in list" :key="item.id" style="margin-bottom: 8px">
        <van-cell :title="'第' + item.planDay + '天随访'" :label="item.consultationNo" is-link
          :value="statusText(item.status)" @click="$router.push('/followup/' + item.id)" />
      </van-cell-group>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { showToast } from 'vant';
import { getPendingFollowUps, type FollowUpItem } from '@aicall/shared';

const list = ref<FollowUpItem[]>([]);
const loading = ref(false);

onMounted(async () => {
  loading.value = true;
  try {
    list.value = await getPendingFollowUps();
  } catch (e: any) {
    showToast(e.message || '加载失败');
  } finally {
    loading.value = false;
  }
});

function statusText(status: number) {
  return ['待发送', '已发送', '已回复', '异常'][status] || '未知';
}
</script>

<style scoped>
.page { min-height: 100vh; background: #f7f8fa; }
.content { padding: 12px; }
</style>
