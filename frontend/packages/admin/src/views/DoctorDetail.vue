<template>
  <div v-loading="loading">
    <el-page-header @back="router.back()" title="返回" :content="detail?.name || '医生详情'" style="margin-bottom: 20px" />

    <template v-if="detail">
      <el-descriptions :column="2" border style="margin-bottom: 20px">
        <el-descriptions-item label="姓名">{{ detail.name }}</el-descriptions-item>
        <el-descriptions-item label="账号">{{ detail.username }}</el-descriptions-item>
        <el-descriptions-item label="职称">{{ detail.title }}</el-descriptions-item>
        <el-descriptions-item label="科室">{{ detail.department }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ detail.phone }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="detail.status === 1 ? 'success' : 'danger'">{{ detail.status === 1 ? '启用' : '禁用' }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="会诊数">{{ detail.consultationCount }}</el-descriptions-item>
        <el-descriptions-item label="简介" :span="2">{{ detail.introduction || '暂无' }}</el-descriptions-item>
      </el-descriptions>

      <el-card style="margin-bottom: 20px">
        <template #header>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>排班列表</span>
            <div style="display: flex; gap: 8px;">
              <el-date-picker v-model="scheduleDate" type="date" placeholder="按日期筛选" clearable @change="loadSchedules" />
              <el-button type="primary" size="small" @click="showScheduleDialog = true">新增排班</el-button>
            </div>
          </div>
        </template>
        <el-table :data="schedules" stripe>
          <el-table-column prop="scheduleDate" label="日期" />
          <el-table-column prop="startTime" label="开始时间" />
          <el-table-column prop="endTime" label="结束时间" />
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === 1 ? 'success' : 'warning'">{{ row.status === 1 ? '可用' : '已预约' }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120">
            <template #default="{ row }">
              <el-button link type="danger" @click="handleDeleteSchedule(row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </template>

    <el-dialog v-model="showScheduleDialog" title="新增排班" width="400px">
      <el-form :model="scheduleForm" label-width="80px">
        <el-form-item label="日期" required><el-date-picker v-model="scheduleForm.scheduleDate" type="date" style="width: 100%" /></el-form-item>
        <el-form-item label="开始时间" required><el-time-picker v-model="scheduleForm.startTime" format="HH:mm" style="width: 100%" /></el-form-item>
        <el-form-item label="结束时间" required><el-time-picker v-model="scheduleForm.endTime" format="HH:mm" style="width: 100%" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showScheduleDialog = false">取消</el-button>
        <el-button type="primary" :loading="actionLoading" @click="handleCreateSchedule">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getAdminDoctorDetail, getAdminDoctorSchedules, createAdminDoctorSchedule, deleteAdminDoctorSchedule, type AdminDoctorDetail, type AdminDoctorSchedule } from '@aicall/shared';

const route = useRoute();
const router = useRouter();
const id = Number(route.params.id);
const loading = ref(false);
const actionLoading = ref(false);
const detail = ref<AdminDoctorDetail | null>(null);
const schedules = ref<AdminDoctorSchedule[]>([]);
const scheduleDate = ref('');
const showScheduleDialog = ref(false);
const scheduleForm = ref({ scheduleDate: '', startTime: '', endTime: '' });

onMounted(() => { loadData(); loadSchedules(); });

async function loadData() {
  loading.value = true;
  try {
    detail.value = await getAdminDoctorDetail(id);
  } catch (e: any) {
    ElMessage.error(e.message || '加载失败');
  } finally {
    loading.value = false;
  }
}

async function loadSchedules() {
  try {
    const dateStr = scheduleDate.value ? new Date(scheduleDate.value).toISOString().slice(0, 10) : undefined;
    schedules.value = await getAdminDoctorSchedules(id, dateStr);
  } catch (e: any) {
    ElMessage.error(e.message || '加载排班失败');
  }
}

async function handleCreateSchedule() {
  actionLoading.value = true;
  try {
    await createAdminDoctorSchedule(id, {
      scheduleDate: scheduleForm.value.scheduleDate ? new Date(scheduleForm.value.scheduleDate).toISOString().slice(0, 10) : '',
      startTime: scheduleForm.value.startTime,
      endTime: scheduleForm.value.endTime,
    });
    ElMessage.success('排班已添加');
    showScheduleDialog.value = false;
    loadSchedules();
  } catch (e: any) {
    ElMessage.error(e.message || '添加失败');
  } finally {
    actionLoading.value = false;
  }
}

async function handleDeleteSchedule(scheduleId: number) {
  try {
    await ElMessageBox.confirm('确定删除该排班？', '提示', { type: 'warning' });
    await deleteAdminDoctorSchedule(id, scheduleId);
    ElMessage.success('已删除');
    loadSchedules();
  } catch {}
}
</script>