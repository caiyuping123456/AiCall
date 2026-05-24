<template>
  <div class="page">
    <van-nav-bar title="上传资料" left-arrow @click-left="$router.back()" />
    <van-steps :active="3" active-color="#1989fa">
      <van-step>登录</van-step>
      <van-step>预问诊</van-step>
      <van-step>摘要</van-step>
      <van-step>上传资料</van-step>
      <van-step>选择类型</van-step>
      <van-step>支付</van-step>
    </van-steps>
    <div class="content">
      <van-cell-group inset title="上传检查资料">
        <van-uploader :after-read="onUpload" multiple :max-size="10 * 1024 * 1024" @oversize="() => showToast('文件不能超过10MB')" />
      </van-cell-group>
      <van-cell-group inset title="已上传" style="margin-top: 12px;">
        <van-cell v-for="item in uploads" :key="item.id" :title="item.fileName" :label="item.ocrResult?.substring(0, 60) || '识别中...'" />
      </van-cell-group>
      <div class="btn-area">
        <van-button type="primary" block @click="$router.push(`/consultation/${consultationId}/select-type`)">下一步</van-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { showToast } from 'vant';
import { uploadFile, getUploads } from '@aicall/shared';

const route = useRoute();
const consultationId = Number(route.params.id);
const uploads = ref<any[]>([]);

onMounted(loadUploads);

async function loadUploads() {
  try { uploads.value = await getUploads(consultationId); } catch {}
}

async function onUpload(file: any) {
  const files = Array.isArray(file) ? file : [file];
  for (const f of files) {
    try {
      await uploadFile(consultationId, f.file);
      showToast('上传成功');
    } catch (e: any) {
      showToast(e.message || '上传失败');
    }
  }
  await loadUploads();
}
</script>

<style scoped>
.page { min-height: 100vh; background: #f7f8fa; }
.content { padding: 16px; }
.btn-area { padding: 24px 16px; }
</style>
