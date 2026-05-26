<template>
  <div class="page">
    <van-nav-bar title="选择科室" left-arrow @click-left="$router.back()" />
    <div class="content">
      <van-loading v-if="loading" class="center-loading" />
      <van-empty v-else-if="departments.length === 0" description="暂无科室信息" />
      <div v-else class="dept-grid">
        <div v-for="dept in departments" :key="dept.id" class="dept-card" @click="goDoctors(dept)">
          <div class="dept-icon">
            <van-icon name="ward-o" size="32" />
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
.page { min-height: 100vh; background: #f7f8fa; }
.content { padding: 16px; }
.center-loading { display: flex; justify-content: center; padding-top: 60px; }
.dept-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.dept-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  cursor: pointer;
  transition: transform 0.2s;
}
.dept-card:active { transform: scale(0.97); }
.dept-icon { color: #1989fa; margin-bottom: 12px; }
.dept-info { text-align: center; }
.dept-name { font-size: 16px; font-weight: 600; color: #323233; margin-bottom: 6px; }
.dept-desc { font-size: 12px; color: #969799; line-height: 1.4; }
</style>