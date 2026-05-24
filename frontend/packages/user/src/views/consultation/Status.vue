<template>
  <div class="page">
    <van-nav-bar title="会诊详情" left-arrow @click-left="$router.back()" />
    <div class="content" v-if="detail">
      <van-cell-group inset title="会诊信息">
        <van-cell title="会诊编号" :value="detail.consultationNo" />
        <van-cell title="科室" :value="detail.department || '未知'" />
        <van-cell title="状态">
          <template #value>
            <van-tag :type="statusTag[detail.status] || ''" size="medium">{{ statusMap[detail.status] || '未知' }}</van-tag>
          </template>
        </van-cell>
        <van-cell title="费用" :value="'¥' + (detail.fee ?? 0)" />
        <van-cell title="创建时间" :value="formatDate(detail.createTime)" />
      </van-cell-group>

      <van-cell-group inset title="患者信息" style="margin-top: 12px;">
        <van-cell title="姓名" :value="detail.patientName || '未填写'" />
        <van-cell title="性别" :value="genderText(detail.patientGender)" />
        <van-cell title="年龄" :value="detail.patientAge ? detail.patientAge + '岁' : '未填写'" />
      </van-cell-group>

      <van-cell-group v-if="detail.doctorName" inset title="接诊医生" style="margin-top: 12px;">
        <van-cell title="医生姓名" :value="detail.doctorName" />
        <van-cell v-if="detail.doctorTitle" title="职称" :value="detail.doctorTitle" />
        <van-cell v-if="detail.doctorDepartment" title="科室" :value="detail.doctorDepartment" />
      </van-cell-group>

      <van-cell-group v-if="detail.medicalSummary" inset title="病情摘要" style="margin-top: 12px;">
        <van-cell>
          <div style="white-space: pre-wrap; font-size: 14px; line-height: 1.6;">{{ detail.medicalSummary }}</div>
        </van-cell>
      </van-cell-group>
      <div v-if="canEnterRoom" class="enter-room" style="padding: 16px; text-align: center;">
        <van-button type="primary" size="large" block @click="$router.push(`/consultation/${consultationId}/room`)">
          进入会诊室
        </van-button>
      </div>
    </div>
    <van-empty v-else description="加载中..." />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { showToast } from 'vant';
import { getConsultationDetail } from '@aicall/shared';

const route = useRoute();
const consultationId = Number(route.params.id);
const detail = ref<any>(null);

const statusMap: Record<string, string> = {
  '0': '草稿', '1': '资料审核中', '2': '已提交',
  '3': '已排期', '4': '待会诊', '5': '会诊中', '6': '已完成',
  '7': '已取消', '8': '已退回',
};
const statusTag: Record<string, string> = {
  '0': '', '1': 'warning', '2': 'primary',
  '3': 'primary', '4': 'warning', '5': 'danger', '6': 'success',
  '7': '', '8': 'danger',
};

function genderText(v: any) {
  if (v === 1 || v === '1') return '男';
  if (v === 0 || v === '0') return '女';
  return '未填写';
}

function formatDate(date: string) {
  return date ? date.substring(0, 16).replace('T', ' ') : '';
}

const canEnterRoom = computed(() => detail.value && [3, 4, 5].includes(detail.value.status));

onMounted(async () => {
  try {
    detail.value = await getConsultationDetail(consultationId);
  } catch (e: any) {
    showToast(e.message || '加载失败');
  }
});
</script>

<style scoped>
.page { min-height: 100vh; background: #f7f8fa; }
.content { padding: 16px; }
</style>
