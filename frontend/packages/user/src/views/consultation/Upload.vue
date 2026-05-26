<template>
  <div class="page">
    <van-nav-bar title="上传资料" left-arrow @click-left="goBack" />
    <van-steps :active="3" active-color="#1989fa">
      <van-step>登录</van-step>
      <van-step>预问诊</van-step>
      <van-step>摘要</van-step>
      <van-step>上传资料</van-step>
      <van-step>选择类型</van-step>
      <van-step>支付</van-step>
    </van-steps>
    <div class="content">
      <van-cell-group inset title="患者信息" style="margin-bottom: 12px;">
        <van-cell title="姓名" :value="patientName || '未填写'" />
        <van-cell title="主诉" :value="chiefComplaint || '未填写'" />
        <van-cell v-if="flow.state.department" title="科室" :value="flow.state.department" />
      </van-cell-group>
      <van-cell-group inset title="上传检查资料">
        <van-uploader :after-read="onUpload" multiple :max-size="10 * 1024 * 1024" @oversize="() => showToast('文件不能超过10MB')" />
      </van-cell-group>
      <van-cell-group inset :title="uploads.length > 0 ? '已上传 (' + uploads.length + ')' : '待上传'" style="margin-top: 12px;">
        <van-cell v-for="item in uploads" :key="item.id" :class="{ 'upload-success': recentIds.has(item.id) }">
          <template #title>
            <span>{{ item.fileName }}</span>
            <van-icon v-if="recentIds.has(item.id)" name="success" color="#07c160" style="margin-left: 6px" />
          </template>
          <template #label>{{ formatOcrLabel(item.ocrResult) }}</template>
        </van-cell>
      </van-cell-group>
      <div class="btn-area">
        <van-button type="primary" block @click="goNext">下一步</van-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import { uploadFile, getUploads, createDraft, getConsultationDetail, formatOcrLabel } from '@aicall/shared';
import { useConsultationFlowStore } from '@/stores/consultationFlow';

const router = useRouter();
const flow = useConsultationFlowStore();
const patientName = ref(localStorage.getItem('patientName') || '');
const chiefComplaint = ref(flow.state.chiefComplaint || '');
const uploads = ref<any[]>([]);
const recentIds = ref(new Set<number>());
let draftId: number | null = null;

// Registration flow already has a consultation; full flow needs to create one
const isRegistration = flow.state.consultationId != null;

function goBack() {
  if (isRegistration) {
    router.push(`/consultation/${flow.state.consultationId}/summary`);
  } else {
    router.push('/consultation/summary');
  }
}

onMounted(async () => {
  if (isRegistration) {
    draftId = flow.state.consultationId;
    // If store doesn't have chiefComplaint, fetch from API
    if (!chiefComplaint.value && draftId) {
      try {
        const detail = await getConsultationDetail(draftId) as any;
        if (detail?.chiefComplaint) {
          chiefComplaint.value = detail.chiefComplaint;
          flow.setChiefComplaint(detail.chiefComplaint);
        }
        if (detail?.department) {
          flow.setDepartment(detail.department);
        }
      } catch { /* use whatever we have */ }
    }
    await loadUploads();
  } else {
    try {
      draftId = await createDraft(
        flow.state.chiefComplaint || '待补充',
        flow.state.department || undefined,
      );
    } catch {
      // Continue without draft
    }
    if (draftId) {
      await loadUploads();
    }
  }
});

async function loadUploads() {
  if (!draftId) return;
  try { uploads.value = await getUploads(draftId) as any[]; } catch {}
}

function goNext() {
  if (isRegistration) {
    // Registration flow: type & fee already set, go directly to pay
    flow.setSelectedType(1); // single consultation
    flow.nextStep(5);
    router.push('/consultation/pay');
  } else {
    // Full flow: choose consultation type first
    flow.nextStep(5);
    router.push('/consultation/select-type');
  }
}

async function onUpload(file: any) {
  if (!draftId) {
    showToast('上传服务暂不可用');
    return;
  }
  const files = Array.isArray(file) ? file : [file];
  for (const f of files) {
    try {
      await uploadFile(draftId, f.file);
      showToast(`${f.file.name} 上传成功`);
    } catch (e: any) {
      showToast(e.message || '上传失败');
    }
  }
  await loadUploads();
  uploads.value.forEach(item => {
    recentIds.value.add(item.id);
    flow.addFileId(item.id);
    setTimeout(() => recentIds.value.delete(item.id), 3000);
  });
  // Poll for OCR results
  pollOcrResults();
}

function pollOcrResults() {
  let attempts = 0;
  const maxAttempts = 15;
  const interval = setInterval(async () => {
    attempts++;
    await loadUploads();
    const allDone = uploads.value.every((item: any) => item.ocrResult);
    if (allDone || attempts >= maxAttempts) {
      clearInterval(interval);
    }
  }, 2000);
}
</script>

<style scoped>
.page { min-height: 100vh; background: #f7f8fa; }
.content { padding: 16px; }
.btn-area { padding: 24px 16px; }
.upload-success :deep(.van-cell__title) { color: #07c160; }
</style>
