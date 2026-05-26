<template>
  <div class="page">
    <van-nav-bar title="选择科室" left-arrow @click-left="$router.back()" />
    <div class="content">
      <div class="page-intro mobile-card">
        <div>
          <h2>选择就诊科室</h2>
          <p>按症状方向选择科室，系统会继续展示可预约医生。</p>
        </div>
        <van-icon name="apps-o" size="30" color="#2563eb" />
      </div>
      <van-loading v-if="loading" class="center-loading" />
      <van-empty v-else-if="departments.length === 0" description="暂无科室信息" />
      <div v-else class="dept-grid">
        <div v-for="dept in departments" :key="dept.id" class="dept-card mobile-card" @click="goDoctors(dept)">
          <div class="dept-icon">
            <van-icon name="ward-o" size="28" />
          </div>
          <div class="dept-info">
            <div class="dept-name">{{ dept.name }}</div>
            <div class="dept-desc">{{ dept.description || '暂无介绍' }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getDepartments } from '@aicall/shared';
import type { UserDepartment } from '@aicall/shared';

const router = useRouter();
const departments = ref<UserDepartment[]>([]);
const loading = ref(true);

function goDoctors(dept: UserDepartment) {
  router.push(`/departments/${dept.id}/doctors`);
}

onMounted(async () => {
  try {
    departments.value = await getDepartments() as any;
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

.dept-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.dept-card {
  min-height: 150px;
  padding: 16px 14px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  cursor: pointer;
  transition: transform 0.16s ease, border-color 0.16s ease;
}

.dept-card:active {
  transform: scale(0.98);
  border-color: rgba(37, 99, 235, 0.35);
}

.dept-icon {
  width: 46px;
  height: 46px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2563eb;
  background: linear-gradient(135deg, #dbeafe, #ccfbf1);
  margin-bottom: 14px;
}

.dept-info {
  text-align: left;
}

.dept-name {
  font-size: 16px;
  font-weight: 800;
  color: var(--text-color);
  margin-bottom: 6px;
}

.dept-desc {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.45;
}
</style>
