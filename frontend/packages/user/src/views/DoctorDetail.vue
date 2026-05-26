<template>
  <div class="page">
    <van-nav-bar title="医生详情" left-arrow @click-left="$router.back()" />
    <div class="content">
      <div class="profile-card mobile-card">
        <div class="profile-top">
          <div class="profile-avatar">
            <van-image v-if="doctor.avatar" :src="doctor.avatar" round width="76" height="76" fit="cover" />
            <div v-else class="avatar-placeholder">{{ doctor.name?.charAt(0) || '医' }}</div>
          </div>
          <div class="profile-meta">
            <div class="profile-name">{{ doctor.name || '医生' }}</div>
            <div class="profile-tags">
              <van-tag type="primary" size="medium">{{ doctor.title || '医师' }}</van-tag>
              <van-tag plain size="medium">{{ doctor.department }}</van-tag>
            </div>
          </div>
        </div>
        <div class="profile-intro-section">
          <div class="section-title">医生介绍</div>
          <div class="intro-text">{{ doctor.introduction || '暂无介绍信息' }}</div>
        </div>
      </div>

      <div class="register-section">
        <van-button type="primary" block round size="large" @click="showDialog = true" :loading="registering">
          挂号预约
        </van-button>
      </div>

      <van-dialog v-model:show="showDialog" title="挂号预约" show-cancel-button :before-close="beforeClose" :confirm-loading="registering">
        <div class="dialog-content">
          <van-field v-model="chiefComplaint" label="主诉" placeholder="请描述您的主要症状" type="textarea" rows="3" maxlength="200" show-word-limit />
        </div>
      </van-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { showToast } from 'vant';
import { getDoctorDetail, registerConsultation } from '@aicall/shared';
import { useConsultationFlowStore } from '@/stores/consultationFlow';
import type { UserDoctor } from '@aicall/shared';

const router = useRouter();
const route = useRoute();
const flow = useConsultationFlowStore();
const doctor = ref<UserDoctor>({ id: 0, name: '', title: '', department: '', avatar: '', introduction: '' });
const showDialog = ref(false);
const chiefComplaint = ref('');
const registering = ref(false);

async function handleRegister() {
  if (!chiefComplaint.value.trim()) {
    showToast('请输入主诉');
    throw new Error('VALIDATION'); // prevent dialog from closing
  }
  const consultationId = await registerConsultation({
    chiefComplaint: chiefComplaint.value,
    doctorId: doctor.value.id,
    department: doctor.value.department,
  }) as number;
  // Save registration data to flow store for downstream pages (Upload, Pay)
  flow.setChiefComplaint(chiefComplaint.value);
  flow.setDepartment(doctor.value.department);
  flow.setConsultationId(consultationId);
  // Close dialog before navigation
  showDialog.value = false;
  showToast('挂号成功，AI正在生成摘要...');
  router.push(`/consultation/${consultationId}/summary`);
}

async function beforeClose(action: string) {
  if (action === 'cancel') return true;
  if (registering.value) return false;
  registering.value = true;
  try {
    await handleRegister();
  } catch (e: any) {
    if (e?.message !== 'VALIDATION') {
      showToast(e.message || '挂号失败');
    }
    registering.value = false;
    return false;
  }
  registering.value = false;
  return false; // Dialog already closed manually on success, or we navigated away
}

onMounted(async () => {
  try {
    doctor.value = await getDoctorDetail(Number(route.params.id)) as any;
  } catch {
    showToast('获取医生信息失败');
    router.back();
  }
});
</script>

<style scoped>
.profile-card {
  position: relative;
  overflow: hidden;
  padding: 22px 18px;
  margin-bottom: 18px;
}

.profile-card::before {
  content: '';
  position: absolute;
  inset: 0 0 auto;
  height: 86px;
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.12), rgba(20, 184, 166, 0.13));
}

.profile-top {
  position: relative;
  display: flex;
  align-items: center;
  gap: 16px;
}

.avatar-placeholder {
  width: 76px;
  height: 76px;
  border-radius: 22px;
  background: linear-gradient(135deg, #2563eb, #14b8a6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 28px;
  font-weight: 800;
  box-shadow: 0 12px 30px rgba(37, 99, 235, 0.22);
}

.profile-name {
  font-size: 21px;
  font-weight: 800;
  color: var(--text-color);
  margin-bottom: 9px;
}

.profile-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.profile-intro-section {
  position: relative;
  margin-top: 22px;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
}

.section-title {
  font-size: 15px;
  font-weight: 800;
  color: var(--text-color);
  margin-bottom: 10px;
}

.intro-text {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.7;
}

.register-section {
  padding: 0 0 16px;
}

.dialog-content {
  padding: 16px;
}
</style>
