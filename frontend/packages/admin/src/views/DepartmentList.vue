<template>
  <div v-loading="loading">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px">
      <h2>科室管理</h2>
      <el-button type="primary" @click="openCreate">新增科室</el-button>
    </div>

    <el-table :data="departments" stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="科室名称" />
      <el-table-column prop="description" label="描述" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'">{{ row.status === 1 ? '启用' : '禁用' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="160" />
      <el-table-column label="操作" width="160">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
          <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="showDialog" :title="isEdit ? '编辑科室' : '新增科室'" width="450px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="科室名称" required>
          <el-input v-model="form.name" placeholder="请输入科室名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入描述（选填）" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="actionLoading">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getAdminDepartments, createAdminDepartment, updateAdminDepartment, deleteAdminDepartment, type AdminDepartment } from '@aicall/shared';

const loading = ref(false);
const actionLoading = ref(false);
const departments = ref<AdminDepartment[]>([]);
const showDialog = ref(false);
const isEdit = ref(false);
const editId = ref<number | null>(null);
const form = ref({ name: '', description: '' });

onMounted(loadData);

async function loadData() {
  loading.value = true;
  try {
    departments.value = await getAdminDepartments();
  } catch (e: any) {
    ElMessage.error(e.message || '加载失败');
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  isEdit.value = false;
  editId.value = null;
  form.value = { name: '', description: '' };
  showDialog.value = true;
}

function openEdit(row: AdminDepartment) {
  isEdit.value = true;
  editId.value = row.id;
  form.value = { name: row.name, description: row.description || '' };
  showDialog.value = true;
}

async function handleSubmit() {
  if (!form.value.name) { ElMessage.warning('请输入科室名称'); return; }
  actionLoading.value = true;
  try {
    if (isEdit.value && editId.value) {
      await updateAdminDepartment(editId.value, form.value);
      ElMessage.success('更新成功');
    } else {
      await createAdminDepartment(form.value);
      ElMessage.success('创建成功');
    }
    showDialog.value = false;
    loadData();
  } catch (e: any) {
    ElMessage.error(e.message || '操作失败');
  } finally {
    actionLoading.value = false;
  }
}

async function handleDelete(row: AdminDepartment) {
  try {
    await ElMessageBox.confirm(`确定要删除科室「${row.name}」吗？`, '确认删除', { type: 'warning' });
  } catch { return; }
  try {
    await deleteAdminDepartment(row.id);
    ElMessage.success('已删除');
    loadData();
  } catch (e: any) {
    ElMessage.error(e.message || '删除失败');
  }
}
</script>
