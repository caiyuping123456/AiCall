<template>
  <div class="page-shell" v-loading="loading">
    <div class="page-header">
      <div>
        <h2 class="page-title">数据概览</h2>
        <div class="page-subtitle">实时查看平台会诊、收入、科室分布和医生工作量</div>
      </div>
      <el-button type="primary" @click="loadData" :loading="loading">刷新数据</el-button>
    </div>

    <el-row :gutter="16" class="stats-row">
      <el-col :span="6">
        <el-card shadow="never" class="stat-card stat-blue">
          <div class="stat-label">会诊总数</div>
          <div class="stat-value">{{ data?.consultationTotal ?? 0 }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="stat-card stat-teal">
          <div class="stat-label">本月新增</div>
          <div class="stat-value">{{ data?.newThisMonth ?? 0 }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="stat-card stat-amber">
          <div class="stat-label">本周新增</div>
          <div class="stat-value">{{ data?.newThisWeek ?? 0 }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="stat-card stat-green">
          <div class="stat-label">已收金额</div>
          <div class="stat-value money">¥{{ data?.revenue?.paid ?? 0 }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="chart-row">
      <el-col :span="8">
        <el-card header="科室分布" shadow="never" class="chart-card">
          <div ref="deptChartRef" class="chart-box" />
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card header="状态分布" shadow="never" class="chart-card">
          <div ref="statusChartRef" class="chart-box" />
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card header="近30天趋势" shadow="never" class="chart-card">
          <div ref="trendChartRef" class="chart-box" />
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="chart-row">
      <el-col :span="24">
        <el-card header="近30天收入趋势" shadow="never" class="chart-card">
          <div ref="revenueChartRef" class="chart-box wide" />
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never" class="workload-card">
      <template #header>
        <div class="card-header">
          <div>
            <div class="card-title">医生工作量排名</div>
            <div class="card-subtitle">统计医生参与会诊数量</div>
          </div>
          <el-button type="primary" @click="handleExport">导出报表</el-button>
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
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import * as echarts from 'echarts';
import { getAdminDashboard, exportAdminDashboard, type AdminDashboardData } from '@aicall/shared';
import { ElMessage } from 'element-plus';

const loading = ref(false);
const data = ref<AdminDashboardData | null>(null);
const deptChartRef = ref<HTMLElement>();
const statusChartRef = ref<HTMLElement>();
const trendChartRef = ref<HTMLElement>();
const revenueChartRef = ref<HTMLElement>();

const chartInstances: echarts.ECharts[] = [];

const consultationStatusMap: Record<number, string> = {
  0: '已提交', 1: '资料审核中', 2: '专家确认中', 3: '已排期',
  4: '待会诊', 5: '报告已签发', 6: '已完成', 7: '已取消', 8: '已退回',
};

function initChart(el: HTMLElement | undefined): echarts.ECharts | null {
  if (!el) return null;
  const chart = echarts.init(el);
  chartInstances.push(chart);
  return chart;
}

function handleResize() {
  chartInstances.forEach(c => c.resize());
}

onMounted(() => {
  window.addEventListener('resize', handleResize);
  loadData();
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  chartInstances.forEach(c => c.dispose());
  chartInstances.length = 0;
});

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
  try { renderDeptChart(); } catch (e) { console.error('Dept chart', e); }
  try { renderStatusChart(); } catch (e) { console.error('Status chart', e); }
  try { renderTrendChart(); } catch (e) { console.error('Trend chart', e); }
  try { renderRevenueChart(); } catch (e) { console.error('Revenue chart', e); }
}

function renderDeptChart() {
  const chart = initChart(deptChartRef.value);
  if (!chart) return;
  const deptData = Object.entries(data.value!.byDepartment).map(([name, value]) => ({ name, value }));
  chart.setOption({
    tooltip: { trigger: 'item' },
    legend: { orient: 'horizontal', bottom: 0, left: 'center', textStyle: { fontSize: 11 } },
    series: [{
      type: 'pie', radius: ['40%', '68%'], center: ['50%', '45%'],
      data: deptData,
      label: { show: deptData.length <= 6, fontSize: 10 },
    }],
  });
}

function renderStatusChart() {
  const chart = initChart(statusChartRef.value);
  if (!chart) return;
  const statusData = Object.entries(data.value!.consultationByStatus).map(([status, value]) => ({
    name: consultationStatusMap[Number(status)] || status, value,
  }));
  chart.setOption({
    tooltip: { trigger: 'item' },
    legend: { orient: 'horizontal', bottom: 0, left: 'center', textStyle: { fontSize: 11 } },
    series: [{
      type: 'pie', radius: ['40%', '68%'], center: ['50%', '45%'],
      data: statusData,
      label: { show: statusData.length <= 6, fontSize: 10 },
    }],
  });
}

function renderTrendChart() {
  const chart = initChart(trendChartRef.value);
  if (!chart) return;
  chart.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: data.value!.dailyTrend.map(i => i.date) },
    yAxis: { type: 'value' },
    series: [{ type: 'line', data: data.value!.dailyTrend.map(i => i.count), smooth: true, areaStyle: {} }],
  });
}

function renderRevenueChart() {
  if (!data.value?.dailyRevenue) return;
  const chart = initChart(revenueChartRef.value);
  if (!chart) return;
  chart.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: data.value.dailyRevenue.map(i => i.date) },
    yAxis: { type: 'value', axisLabel: { formatter: '¥{value}' } },
    series: [{ type: 'bar', data: data.value.dailyRevenue.map(i => i.amount), itemStyle: { color: '#14b8a6' } }],
  });
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

<style scoped>
.stats-row,
.chart-row {
  margin-bottom: 18px;
}

.stat-card :deep(.el-card__body) {
  min-height: 132px;
  padding: 22px;
}

.stat-label {
  color: var(--aicall-muted);
  font-size: 13px;
  font-weight: 700;
}

.stat-value {
  margin-top: 14px;
  color: var(--aicall-text);
  font-size: 34px;
  line-height: 1;
  font-weight: 900;
}

.money {
  font-size: 30px;
}

.stat-blue { background: linear-gradient(135deg, #fff, #eff6ff); }
.stat-teal { background: linear-gradient(135deg, #fff, #f0fdfa); }
.stat-amber { background: linear-gradient(135deg, #fff, #fffbeb); }
.stat-green { background: linear-gradient(135deg, #fff, #ecfdf5); }

.chart-card :deep(.el-card__body) {
  padding: 10px 12px 16px;
}

.chart-box {
  height: 300px;
}

.chart-box.wide {
  height: 310px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
