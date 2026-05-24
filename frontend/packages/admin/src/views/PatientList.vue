<template>
  <div>
    <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
      <el-input v-model="keyword" placeholder="搜索姓名/手机号" style="width: 300px" clearable @clear="loadData" @keyup.enter="loadData" />
    </div>

    <el-table :data="list" v-loading="loading" stripe>
      <el-table-column prop="name" label="姓名" />
      <el-table-column prop="phone" label="手机号" />
      <el-table-column label="性别" width="80">
        <template #default="{ row }">{{ row.gender === 1 ? '男' : row.gender === 0 ? '女' : '未知' }}</template>
      </el-table-column>
      <el-table-column prop="age" label="年龄" width="80" />
      <el-table-column label="资料完善" width="100">
        <template #default="{ row }">
          <el-tag :type="row.profileComplete === 1 ? 'success' : 'warning'" size="small">
            {{ row.profileComplete === 1 ? '已完善' : '未完善' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-switch :model-value="row.status === 1" @change="(val: boolean) => handleStatusToggle(row.id, val)" />
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="注册时间" width="180" />
      <el-table-column label="操作" width="120">
        <template #default="{ row }">
          <el-button link type="primary" @click="handleResetPwd(row)">重置密码</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination style="margin-top: 16px; justify-content: flex-end;" v-model:current-page="page" v-model:page-size="size"
      :total="total" layout="total, prev, pager, next" @current-change="loadData" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getAdminPatients, updateAdminPatientStatus, resetAdminPatientPassword, type AdminPatientListItem } from '@aicall/shared';

const loading = ref(false);
const list = ref<AdminPatientListItem[]>([]);
const keyword = ref('');
const page = ref(1);
const size = ref(10);
const total = ref(0);

onMounted(() => loadData());

async function loadData() {
  loading.value = true;
  try {
    const res = await getAdminPatients({ keyword: keyword.value, page: page.value, size: size.value });
    list.value = res.list;
    total.value = res.total;
  } finally {
    loading.value = false;
  }
}

async function handleStatusToggle(id: number, enabled: boolean) {
  try {
    await updateAdminPatientStatus(id, enabled ? 1 : 0);
    loadData();
  } catch (e: any) {
    ElMessage.error(e.message || '操作失败');
  }
}

async function handleResetPwd(row: AdminPatientListItem) {
  try {
    await ElMessageBox.confirm(`确定要重置用户「${row.name}」的密码为 123456 吗？`, '确认重置密码', { type: 'warning' });
  } catch { return; }
  try {
    await resetAdminPatientPassword(row.id);
    ElMessage.success('密码已重置为 123456');
  } catch (e: any) {
    ElMessage.error(e.message || '操作失败');
  }
}
</script>
