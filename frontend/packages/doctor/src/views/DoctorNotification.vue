<template>
  <div>
    <el-page-header @back="router.back()" title="返回" content="通知中心" style="margin-bottom: 20px" />
    <el-table :data="list" v-loading="loading" stripe>
      <el-table-column prop="title" label="标题" width="200" />
      <el-table-column prop="content" label="内容" min-width="300" />
      <el-table-column prop="sendTime" label="时间" width="180" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 2 ? 'info' : 'warning'" size="small">
            {{ row.status === 2 ? '已读' : '未读' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="80">
        <template #default="{ row }">
          <el-button v-if="row.status !== 2" link type="primary" @click="handleRead(row)">标已读</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { getDoctorNotifications, markDoctorNotificationRead, type NotificationItem } from '@aicall/shared';

const router = useRouter();
const list = ref<NotificationItem[]>([]);
const loading = ref(false);

onMounted(async () => {
  loading.value = true;
  try { list.value = await getDoctorNotifications(); }
  catch (e: any) { ElMessage.error(e.message || '加载失败'); }
  finally { loading.value = false; }
});

async function handleRead(item: NotificationItem) {
  try { await markDoctorNotificationRead(item.id); item.status = 2; }
  catch {}
}
</script>
