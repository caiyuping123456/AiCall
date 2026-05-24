<template>
  <div v-loading="loading">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px">
      <h2>知识库管理</h2>
      <el-upload :before-upload="handleUpload" :show-file-list="false" accept=".txt,.md,.pdf"
        :http-request="() => {}">
        <el-button type="primary">上传文档</el-button>
      </el-upload>
    </div>

    <el-table :data="documents" stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="fileName" label="文件名" />
      <el-table-column prop="chunkCount" label="分块数" width="100" />
      <el-table-column prop="createTime" label="上传时间" width="180" />
      <el-table-column label="操作" width="100">
        <template #default="{ row }">
          <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getKnowledgeDocuments, uploadKnowledgeDocument, deleteKnowledgeDocument, type KnowledgeDocument } from '@aicall/shared';

const loading = ref(false);
const documents = ref<KnowledgeDocument[]>([]);

onMounted(loadData);

async function loadData() {
  loading.value = true;
  try {
    documents.value = await getKnowledgeDocuments();
  } catch (e: any) {
    ElMessage.error(e.message || '加载失败');
  } finally {
    loading.value = false;
  }
}

async function handleUpload(file: File) {
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (!ext || !['txt', 'md', 'pdf'].includes(ext)) {
    ElMessage.warning('仅支持 TXT、MD、PDF 格式');
    return false;
  }
  loading.value = true;
  try {
    await uploadKnowledgeDocument(file);
    ElMessage.success('上传成功，正在处理中...');
    loadData();
  } catch (e: any) {
    ElMessage.error(e.message || '上传失败');
  } finally {
    loading.value = false;
  }
  return false;
}

async function handleDelete(row: KnowledgeDocument) {
  try {
    await ElMessageBox.confirm(`确定要删除文档「${row.fileName}」吗？`, '确认删除', { type: 'warning' });
  } catch { return; }
  try {
    await deleteKnowledgeDocument(row.id);
    ElMessage.success('已删除');
    loadData();
  } catch (e: any) {
    ElMessage.error(e.message || '删除失败');
  }
}
</script>
