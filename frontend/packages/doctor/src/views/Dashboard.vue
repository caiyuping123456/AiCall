<template>
  <div>
    <el-row :gutter="20" style="margin-bottom: 20px">
      <el-col :span="8">
        <el-card shadow="hover">
          <el-statistic title="待审核会诊" :value="store.pendingReviewCount">
            <template #suffix>
              <el-button type="primary" link @click="router.push('/consultations?status=2')">查看</el-button>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <el-statistic title="报告编辑中" :value="store.reportEditingCount">
            <template #suffix>
              <el-button type="warning" link @click="router.push('/consultations')">查看</el-button>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <el-statistic title="待质控" :value="store.pendingQcCount">
            <template #suffix>
              <el-button type="success" link @click="router.push('/consultations')">查看</el-button>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
    </el-row>

    <el-card>
      <template #header>最近会诊</template>
      <el-table :data="store.recentConsultations" stripe>
        <el-table-column prop="consultationId" label="ID" width="80" />
        <el-table-column prop="patientName" label="患者" width="100" />
        <el-table-column prop="chiefComplaint" label="主诉" />
        <el-table-column prop="department" label="科室" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)">{{ statusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="时间" width="180" />
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button type="primary" link @click="router.push(`/consultations/${row.consultationId}`)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useDoctorStore } from '@/stores/doctor';

const router = useRouter();
const store = useDoctorStore();

onMounted(() => {
  store.loadWorkbench();
});

function statusLabel(status: number) {
  const map: Record<number, string> = { 2: '待审核', 3: '进行中', 4: '已生成报告', 5: '已完成', 8: '已拒绝' };
  return map[status] || '未知';
}

function statusType(status: number) {
  const map: Record<number, string> = { 2: 'warning', 3: '', 4: 'success', 5: 'info', 8: 'danger' };
  return map[status] || '';
}
</script>
