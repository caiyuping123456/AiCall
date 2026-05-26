<template>
  <div class="page-shell">
    <div class="page-header">
      <div>
        <h2 class="page-title">医生工作台</h2>
        <div class="page-subtitle">快速处理待审核会诊、报告编辑与 AI 质控任务</div>
      </div>
      <el-button type="primary" @click="store.loadWorkbench()">刷新工作台</el-button>
    </div>

    <el-row :gutter="20" class="stats-row">
      <el-col :span="8">
        <el-card shadow="never" class="stat-card stat-blue">
          <div class="stat-meta">待审核会诊</div>
          <div class="stat-value">{{ store.pendingReviewCount }}</div>
          <el-button type="primary" link @click="router.push('/consultations?status=2')">查看待办</el-button>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="never" class="stat-card stat-amber">
          <div class="stat-meta">报告编辑中</div>
          <div class="stat-value">{{ store.reportEditingCount }}</div>
          <el-button type="warning" link @click="router.push('/consultations')">进入列表</el-button>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="never" class="stat-card stat-teal">
          <div class="stat-meta">待质控</div>
          <div class="stat-value">{{ store.pendingQcCount }}</div>
          <el-button type="success" link @click="router.push('/consultations')">处理报告</el-button>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="recent-card" shadow="never">
      <template #header>
        <div class="card-header">
          <div>
            <div class="card-title">最近会诊</div>
            <div class="card-subtitle">按照创建时间展示最近需要关注的会诊</div>
          </div>
          <el-button type="primary" link @click="router.push('/consultations')">查看全部</el-button>
        </div>
      </template>
      <el-table :data="store.recentConsultations" stripe>
        <el-table-column prop="consultationId" label="ID" width="80" />
        <el-table-column prop="patientName" label="患者" width="100" />
        <el-table-column prop="chiefComplaint" label="主诉" min-width="180" />
        <el-table-column prop="department" label="科室" width="110" />
        <el-table-column prop="status" label="状态" width="120">
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

<style scoped>
.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  min-height: 154px;
}

.stat-card :deep(.el-card__body) {
  padding: 22px;
}

.stat-meta {
  color: var(--aicall-muted);
  font-size: 13px;
  font-weight: 700;
}

.stat-value {
  margin: 10px 0 8px;
  color: var(--aicall-text);
  font-size: 38px;
  line-height: 1;
  font-weight: 900;
}

.stat-blue { background: linear-gradient(135deg, #ffffff, #eff6ff); }
.stat-amber { background: linear-gradient(135deg, #ffffff, #fffbeb); }
.stat-teal { background: linear-gradient(135deg, #ffffff, #ecfdf5); }

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.card-title {
  color: var(--aicall-text);
  font-weight: 800;
}

.card-subtitle {
  margin-top: 4px;
  color: var(--aicall-muted);
  font-size: 12px;
}
</style>
