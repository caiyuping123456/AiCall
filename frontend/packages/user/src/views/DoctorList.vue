<template>
  <div class="page">
    <van-nav-bar :title="deptName + ' - 医生列表'" left-arrow @click-left="$router.back()" />
    <div class="content">
      <van-loading v-if="loading" class="center-loading" />
      <van-empty v-else-if="doctors.length === 0" description="暂无医生" />
      <div v-else class="doctor-list">
        <div v-for="doc in doctors" :key="doc.id" class="doctor-card" @click="goDetail(doc)">
          <div class="doctor-avatar">
            <van-image v-if="doc.avatar" :src="doc.avatar" round width="56" height="56" fit="cover" />
            <div v-else class="avatar-placeholder">{{ doc.name?.charAt(0) }}</div>
          </div>
          <div class="doctor-info">
            <div class="doctor-header">
              <span class="doctor-name">{{ doc.name }}</span>
              <van-tag v-if="doc.title" type="primary" size="medium">{{ doc.title }}</van-tag>
            </div>
            <div class="doctor-dept">{{ doc.department }}</div>
            <div class="doctor-intro">{{ doc.introduction ? (doc.introduction.length > 40 ? doc.introduction.substring(0, 40) + '...' : doc.introduction) : '暂无介绍' }}</div>
          </div>
          <van-icon name="arrow" color="#c8c9cc" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { getDoctorsByDepartment, getDepartments } from '@aicall/shared';
import type { UserDoctor } from '@aicall/shared';

const router = useRouter();
const route = useRoute();
const doctors = ref<UserDoctor[]>([]);
const deptName = ref('');
const loading = ref(true);

function goDetail(doc: UserDoctor) {
  router.push(`/doctors/${doc.id}`);
}

onMounted(async () => {
  try {
    const deptId = Number(route.params.id);
    const depts = await getDepartments() as any[];
    const dept = depts?.find((d: any) => d.id === deptId);
    deptName.value = dept?.name || '科室';
    doctors.value = await getDoctorsByDepartment(deptId) as any;
  } catch {}
  loading.value = false;
});
</script>

<style scoped>
.page { min-height: 100vh; background: #f7f8fa; }
.content { padding: 16px; }
.center-loading { display: flex; justify-content: center; padding-top: 60px; }
.doctor-list { display: flex; flex-direction: column; gap: 12px; }
.doctor-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  cursor: pointer;
  transition: transform 0.2s;
}
.doctor-card:active { transform: scale(0.98); }
.avatar-placeholder {
  width: 56px; height: 56px; border-radius: 50%; background: linear-gradient(135deg, #1989fa, #4fc3f7);
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-size: 22px; font-weight: 600;
}
.doctor-info { flex: 1; min-width: 0; }
.doctor-header { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
.doctor-name { font-size: 16px; font-weight: 600; color: #323233; }
.doctor-dept { font-size: 13px; color: #969799; margin-bottom: 4px; }
.doctor-intro { font-size: 13px; color: #646566; line-height: 1.4; }
</style>