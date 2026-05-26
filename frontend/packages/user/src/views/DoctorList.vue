<template>
  <div class="page">
    <van-nav-bar :title="deptName + ' - 医生列表'" left-arrow @click-left="$router.back()" />
    <div class="content">
      <div class="page-intro mobile-card">
        <div>
          <h2>{{ deptName || '科室' }}医生</h2>
          <p>查看医生职称、简介并选择合适的会诊医生。</p>
        </div>
        <van-icon name="manager-o" size="30" color="#14b8a6" />
      </div>
      <van-loading v-if="loading" class="center-loading" />
      <van-empty v-else-if="doctors.length === 0" description="暂无医生" />
      <div v-else class="doctor-list">
        <div v-for="doc in doctors" :key="doc.id" class="doctor-card mobile-card" @click="goDetail(doc)">
          <div class="doctor-avatar">
            <van-image v-if="doc.avatar" :src="doc.avatar" round width="58" height="58" fit="cover" />
            <div v-else class="avatar-placeholder">{{ doc.name?.charAt(0) }}</div>
          </div>
          <div class="doctor-info">
            <div class="doctor-header">
              <span class="doctor-name">{{ doc.name }}</span>
              <van-tag v-if="doc.title" type="primary" size="medium">{{ doc.title }}</van-tag>
            </div>
            <div class="doctor-dept">{{ doc.department }}</div>
            <div class="doctor-intro">{{ doc.introduction ? (doc.introduction.length > 48 ? doc.introduction.substring(0, 48) + '...' : doc.introduction) : '暂无介绍' }}</div>
          </div>
          <van-icon name="arrow" color="#94a3b8" />
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
.page-intro {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 16px;
  padding: 16px;
}

.page-intro h2 {
  margin: 0;
  color: var(--text-color);
  font-size: 18px;
}

.page-intro p {
  margin: 6px 0 0;
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.5;
}

.doctor-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.doctor-card {
  padding: 15px;
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  transition: transform 0.16s ease, border-color 0.16s ease;
}

.doctor-card:active {
  transform: scale(0.99);
  border-color: rgba(37, 99, 235, 0.35);
}

.avatar-placeholder {
  width: 58px;
  height: 58px;
  border-radius: 18px;
  background: linear-gradient(135deg, #2563eb, #14b8a6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 22px;
  font-weight: 800;
}

.doctor-info {
  flex: 1;
  min-width: 0;
}

.doctor-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 5px;
}

.doctor-name {
  font-size: 16px;
  font-weight: 800;
  color: var(--text-color);
}

.doctor-dept {
  font-size: 13px;
  color: var(--primary-color);
  margin-bottom: 5px;
  font-weight: 700;
}

.doctor-intro {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.45;
}
</style>
