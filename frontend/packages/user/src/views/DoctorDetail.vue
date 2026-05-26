<template>
  <div class="page">
    <van-nav-bar title="医生详情" left-arrow @click-left="$router.back()" />
    <div class="content">
      <div class="profile-card">
        <div class="profile-top">
          <div class="profile-avatar">
            <van-image v-if="doctor.avatar" :src="doctor.avatar" round width="72" height="72" fit="cover" />
            <div v-else class="avatar-placeholder">{{ doctor.name?.charAt(0) || '医' }}</div>
          </div>
          <div class="profile-meta">
            <div class="profile-name">{{ doctor.name }}</div>
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

      <van-dialog v-model:show="showDialog" title="挂号预约" show-cancel-button :before-close="beforeClose">
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
import type { UserDoctor } from '@aicall/shared';

const router = useRouter();
const route = useRoute();
const doctor = ref<UserDoctor>({ id: 0, name: '', title: '', department: '', avatar: '', introduction: '' });
const showDialog = ref(false);
const chiefComplaint = ref('');
const registering = ref(false);

async function handleRegister() {
  if (!chiefComplaint.value.trim()) {
    showToast('请输入主诉');
    return;
  }
  if (registering.value) return;
  registering.value = true;
  try {
    const consultationId = await registerConsultation({
      chiefComplaint: chiefComplaint.value,
      doctorId: doctor.value.id,
      department: doctor.value.department,
    }) as number;
    showToast('挂号成功，AI正在生成摘要...');
    router.push(`/consultation/${consultationId}/summary`);
  } catch (e: any) {
    showToast(e.message || '挂号失败');
    registering.value = false;
  }
}

async function beforeClose(action: string) {
  if (action === 'cancel') return true;
  await handleRegister();
  // Only close dialog after successful registration
  return !registering.value;
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
.page { min-height: 100vh; background: #f7f8fa; }
.content { padding: 16px; }
.profile-card {
  background: #fff; border-radius: 12px; padding: 24px 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08); margin-bottom: 20px;
}
.profile-top { display: flex; align-items: center; gap: 16px; }
.avatar-placeholder {
  width: 72px; height: 72px; border-radius: 50%;
  background: linear-gradient(135deg, #1989fa, #4fc3f7);
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-size: 28px; font-weight: 600;
}
.profile-name { font-size: 20px; font-weight: 600; color: #323233; margin-bottom: 8px; }
.profile-tags { display: flex; gap: 8px; }
.profile-intro-section { margin-top: 20px; padding-top: 16px; border-top: 1px solid #ebedf0; }
.section-title { font-size: 15px; font-weight: 600; color: #323233; margin-bottom: 10px; }
.intro-text { font-size: 14px; color: #646566; line-height: 1.6; }
.register-section { padding: 0 0 16px; }
.dialog-content { padding: 16px; }
</style>