<template>
  <div>
    <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
      <div style="display: flex; gap: 12px;">
        <el-input v-model="keyword" placeholder="搜索姓名/科室/手机号" style="width: 250px" clearable @clear="loadData" @keyup.enter="loadData" />
        <el-select v-model="departmentFilter" placeholder="全部科室" clearable style="width: 180px" @change="loadData">
          <el-option v-for="d in departmentList" :key="d.id" :label="d.name" :value="d.name" />
        </el-select>
      </div>
      <el-button type="primary" @click="showCreateDialog = true">新增医生</el-button>
    </div>

    <el-table :data="list" v-loading="loading" stripe>
      <el-table-column prop="name" label="姓名" />
      <el-table-column prop="title" label="职称" />
      <el-table-column prop="department" label="科室" />
      <el-table-column prop="phone" label="手机号" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-switch :model-value="row.status === 1" @change="(val: boolean) => handleStatusToggle(row.id, val)" />
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="180" />
      <el-table-column label="操作" width="120">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEditDialog(row)">编辑</el-button>
          <el-button link type="primary" @click="router.push(`/doctors/${row.id}`)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination style="margin-top: 16px; justify-content: flex-end;" v-model:current-page="page" v-model:page-size="size"
      :total="total" layout="total, prev, pager, next" @current-change="loadData" />

    <el-dialog v-model="showCreateDialog" title="新增医生" width="500px" @close="resetCreateForm">
      <el-form :model="createForm" label-width="80px">
        <el-form-item label="姓名" required><el-input v-model="createForm.name" /></el-form-item>
        <el-form-item label="职称"><el-input v-model="createForm.title" /></el-form-item>
        <el-form-item label="科室">
          <el-select v-model="createForm.department" placeholder="请选择科室" clearable style="width: 100%">
            <el-option v-for="d in departmentList" :key="d.id" :label="d.name" :value="d.name" />
          </el-select>
        </el-form-item>
        <el-form-item label="手机号"><el-input v-model="createForm.phone" /></el-form-item>
        <el-form-item label="密码" required><el-input v-model="createForm.password" type="password" show-password /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" :loading="actionLoading" @click="handleCreate">确认</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showEditDialog" title="编辑医生" width="500px">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="姓名" required><el-input v-model="editForm.name" /></el-form-item>
        <el-form-item label="职称"><el-input v-model="editForm.title" /></el-form-item>
        <el-form-item label="科室">
          <el-select v-model="editForm.department" placeholder="请选择科室" clearable style="width: 100%">
            <el-option v-for="d in departmentList" :key="d.id" :label="d.name" :value="d.name" />
          </el-select>
        </el-form-item>
        <el-form-item label="手机号"><el-input v-model="editForm.phone" /></el-form-item>
        <el-form-item label="简介"><el-input v-model="editForm.introduction" type="textarea" :rows="3" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" :loading="actionLoading" @click="handleEdit">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { getAdminDoctors, createAdminDoctor, updateAdminDoctor, updateAdminDoctorStatus, getAdminDepartments, type AdminDoctorListItem, type AdminDepartment } from '@aicall/shared';

const router = useRouter();
const loading = ref(false);
const actionLoading = ref(false);
const list = ref<AdminDoctorListItem[]>([]);
const keyword = ref('');
const departmentFilter = ref('');
const departmentList = ref<AdminDepartment[]>([]);
const page = ref(1);
const size = ref(10);
const total = ref(0);

const showCreateDialog = ref(false);
const showEditDialog = ref(false);
const editingId = ref(0);
const createForm = ref({ name: '', title: '', department: '', phone: '', password: '' });
const editForm = ref({ name: '', title: '', department: '', phone: '', introduction: '' });

onMounted(() => { loadData(); loadDepartments(); });

async function loadDepartments() {
  try { departmentList.value = await getAdminDepartments(); } catch { /* ignore */ }
}

async function loadData() {
  loading.value = true;
  try {
    const res = await getAdminDoctors({ keyword: keyword.value, department: departmentFilter.value, page: page.value, size: size.value });
    list.value = res.list;
    total.value = res.total;
  } finally {
    loading.value = false;
  }
}

async function handleCreate() {
  if (!createForm.value.name || !createForm.value.password) {
    ElMessage.warning('姓名和密码不能为空');
    return;
  }
  actionLoading.value = true;
  try {
    await createAdminDoctor(createForm.value);
    ElMessage.success('创建成功');
    showCreateDialog.value = false;
    loadData();
  } catch (e: any) {
    ElMessage.error(e.message || '创建失败');
  } finally {
    actionLoading.value = false;
  }
}

function openEditDialog(row: AdminDoctorListItem) {
  editingId.value = row.id;
  editForm.value = { name: row.name, title: row.title, department: row.department, phone: row.phone, introduction: '' };
  showEditDialog.value = true;
}

async function handleEdit() {
  actionLoading.value = true;
  try {
    await updateAdminDoctor(editingId.value, editForm.value);
    ElMessage.success('更新成功');
    showEditDialog.value = false;
    loadData();
  } catch (e: any) {
    ElMessage.error(e.message || '更新失败');
  } finally {
    actionLoading.value = false;
  }
}

async function handleStatusToggle(id: number, enabled: boolean) {
  try {
    await updateAdminDoctorStatus(id, enabled ? 1 : 0);
    loadData();
  } catch (e: any) {
    ElMessage.error(e.message || '操作失败');
  }
}

function resetCreateForm() {
  createForm.value = { name: '', title: '', department: '', phone: '', password: '' };
}
</script>