<template>
  <div v-loading="loading">
    <el-row :gutter="16" style="margin-bottom: 20px">
      <el-col :span="6">
        <el-card shadow="hover">
          <el-statistic title="会诊总数" :value="data?.consultationTotal ?? 0" />
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <el-statistic title="本月新增" :value="data?.newThisMonth ?? 0" />
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <el-statistic title="本周新增" :value="data?.newThisWeek ?? 0" />
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <el-statistic title="已收金额" :value="data?.revenue?.paid ?? 0" prefix="¥" />
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" style="margin-bottom: 20px">
      <el-col :span="8">
        <el-card header="科室分布">
          <div ref="deptChartRef" style="height: 300px" />
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card header="状态分布">
          <div ref="statusChartRef" style="height: 300px" />
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card header="近30天趋势">
          <div ref="trendChartRef" style="height: 300px" />
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" style="margin-bottom: 20px">
      <el-col :span="24">
        <el-card header="近30天收入趋势">
          <div ref="revenueChartRef" style="height: 300px" />
        </el-card>
      </el-col>
    </el-row>

    <el-card header="医生工作量排名">
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center">
          <span>医生工作量排名</span>
          <el-button type="primary" size="small" @click="handleExport">导出报表</el-button>
        </div>
      </template>
      <el-table :data="data?.doctorWorkload ?? []" stripe>
        <el-table-column prop="name" label="医生" />
        <el-table-column prop="consultationCount" label="会诊数" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import * as echarts from 'echarts';
import { getAdminDashboard, exportAdminDashboard, type AdminDashboardData } from '@aicall/shared';
import { ElMessage } from 'element-plus';

const loading = ref(false);
const data = ref<AdminDashboardData | null>(null);
const deptChartRef = ref<HTMLElement>();
const statusChartRef = ref<HTMLElement>();
const trendChartRef = ref<HTMLElement>();
const revenueChartRef = ref<HTMLElement>();

const consultationStatusMap: Record<string, string> = {
  '0': '已提交', '1': '资料审核中', '2': '专家确认中', '3': '已排期',
  '4': '待会诊', '5': '会诊中', '6': '已完成', '7': '已取消', '8': '已退回',
};

onMounted(() => loadData());

async function loadData() {
  loading.value = true;
  try {
    data.value = await getAdminDashboard();
    await nextTick();
    renderCharts();
  } finally {
    loading.value = false;
  }
}

function renderCharts() {
  if (!data.value) return;

  if (deptChartRef.value) {
    const chart = echarts.init(deptChartRef.value);
    chart.setOption({
      tooltip: { trigger: 'item' },
      series: [{
        type: 'pie', radius: ['40%', '70%'],
        data: Object.entries(data.value.byDepartment).map(([name, value]) => ({ name, value })),
      }],
    });
  }

  if (statusChartRef.value) {
    const chart = echarts.init(statusChartRef.value);
    chart.setOption({
      tooltip: { trigger: 'item' },
      series: [{
        type: 'pie', radius: ['40%', '70%'],
        data: Object.entries(data.value.consultationByStatus).map(([status, value]) => ({
          name: consultationStatusMap[status] || status, value,
        })),
      }],
    });
  }

  if (trendChartRef.value) {
    const chart = echarts.init(trendChartRef.value);
    chart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: data.value.dailyTrend.map(i => i.date) },
      yAxis: { type: 'value' },
      series: [{ type: 'line', data: data.value.dailyTrend.map(i => i.count), smooth: true, areaStyle: {} }],
    });
  }

  if (revenueChartRef.value && data.value.dailyRevenue) {
    const chart = echarts.init(revenueChartRef.value);
    chart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: data.value.dailyRevenue.map(i => i.date) },
      yAxis: { type: 'value', axisLabel: { formatter: '¥{value}' } },
      series: [{ type: 'bar', data: data.value.dailyRevenue.map(i => i.amount), itemStyle: { color: '#67c23a' } }],
    });
  }
}

async function handleExport() {
  try {
    const blob = await exportAdminDashboard() as any;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '数据报表.xlsx';
    a.click();
    URL.revokeObjectURL(url);
    ElMessage.success('导出成功');
  } catch (e: any) {
    ElMessage.error(e.message || '导出失败');
  }
}
</script>