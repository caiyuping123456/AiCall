<template>
  <div class="page-shell">
    <div class="page-header">
      <div>
        <h2 class="page-title">会诊列表</h2>
        <div class="page-subtitle">按状态筛选并进入会诊详情处理患者资料与报告</div>
      </div>
    </div>

    <div class="table-panel">
      <el-tabs v-model="activeStatus" class="status-tabs" @tab-change="loadData">
        <el-tab-pane label="全部" name="all" />
        <el-tab-pane label="待审核" name="2" />
        <el-tab-pane label="进行中" name="3" />
        <el-tab-pane label="已生成报告" name="4" />
        <el-tab-pane label="已完成" name="5" />
      </el-tabs>

      <el-table :data="list" v-loading="loading" stripe>
        <el-table-column prop="consultationId" label="ID" width="80" />
        <el-table-column prop="patientName" label="患者" width="100" />
        <el-table-column prop="chiefComplaint" label="主诉" min-width="220" />
        <el-table-column prop="department" label="科室" width="110" />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)">{{ statusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="router.push(`/consultations/${row.consultationId}`)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getDoctorConsultations, type ConsultationListItem } from '@aicall/shared';

const router = useRouter();
const loading = ref(false);
const list = ref<ConsultationListItem[]>([]);
const activeStatus = ref('all');

onMounted(() => {
  const params = new URLSearchParams(window.location.search);
  const status = params.get('status');
  if (status) activeStatus.value = status;
  loadData();
});

async function loadData() {
  loading.value = true;
  try {
    const status = activeStatus.value === 'all' ? undefined : Number(activeStatus.value);
    list.value = await getDoctorConsultations(status);
  } catch (e: any) {
    console.error(e);
  } finally {
    loading.value = false;
  }
}

function statusLabel(status: number) {
  const map: Record<number, string> = { 2: '待审核', 3: '进行中', 4: '已生成报告', 5: '已完成', 8: '已拒绝' };
  return map[status] || '未知';
}

function statusType(status: number) {
  const map: Record<number, string> = { 2: 'warning', 3: '', 4: 'success', 5: 'info', 8: 'danger' };
  return map[status] || '';
}
</script>

<style scoped>
.status-tabs {
  margin-bottom: 8px;
}

.status-tabs :deep(.el-tabs__nav-wrap::after) {
  height: 1px;
  background: #eef2f7;
}
</style>
