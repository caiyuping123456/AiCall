<template>
  <div class="page">
    <van-nav-bar title="会诊详情" left-arrow @click-left="$router.back()" />
    <div class="content" v-if="detail">
      <!-- Top-bottom layout -->
      <van-cell-group inset title="会诊信息">
        <van-cell title="会诊编号" :value="detail.consultationNo" />
        <van-cell title="科室" :value="detail.department || '未知'" />
        <van-cell title="状态">
          <template #value>
            <van-tag :type="statusTag[String(detail.status)] || 'default'" size="medium">{{ statusMap[detail.status] || '未知' }}</van-tag>
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
          <div style="white-space: pre-wrap; font-size: 14px; line-height: 1.6; text-align: left;">{{ detail.medicalSummary }}</div>
        </van-cell>
      </van-cell-group>

      <div v-if="detail.report" class="mobile-card" style="padding: 16px; margin-top: 12px;">
        <div class="section-label">会诊报告</div>
        <van-tag :type="detail.report.status === 0 ? 'warning' : detail.report.status === 1 ? 'primary' : 'success'" size="medium">
          {{ ['草稿', '待质控', '已签发'][detail.report.status] || '未知' }}
        </van-tag>
        <div v-if="detail.report.signedByName" style="margin-top: 6px; color: #999; font-size: 12px;">
          签发人：{{ detail.report.signedByName }} · {{ detail.report.signedTime }}
        </div>
        <div v-if="reportFields" class="report-fields">
          <div v-for="(value, key) in reportFields" :key="key" class="report-item">
            <div class="report-item-label">{{ fieldLabels[key] || key }}</div>
            <div class="report-item-value">{{ value }}</div>
          </div>
        </div>
        <div v-else-if="detail.report.content" class="report-content">{{ detail.report.content }}</div>
      </div>

      <!-- Only allow entering room during active consultation (status 3-4), NOT after report signed (5+) -->
      <div v-if="canEnterRoom" class="enter-room">
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
import type { TagType } from 'vant';
import { getConsultationDetail } from '@aicall/shared';

const route = useRoute();
const consultationId = Number(route.params.id);
const detail = ref<any>(null);

const fieldLabels: Record<string, string> = {
  chiefComplaint: '主诉',
  presentIllness: '现病史',
  pastHistory: '既往史',
  examinationFindings: '检查所见',
  diagnosis: '诊断意见',
  analysis: '分析说明',
  recommendation: '建议',
  followUp: '随访建议',
};

function tryParseJson(content: string): Record<string, string> | null {
  if (!content) return null;
  try {
    let json = content.trim();
    if (json.startsWith('```')) {
      json = json.replace(/```json\s*/i, '').replace(/```\s*$/i, '');
    }
    const obj = JSON.parse(json);
    if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
      return obj as Record<string, string>;
    }
    return null;
  } catch {
    return null;
  }
}

const reportFields = computed(() => {
  if (!detail.value?.report?.content) return null;
  return tryParseJson(detail.value.report.content);
});

const statusMap: Record<string, string> = {
  '0': '草稿', '1': '资料审核中', '2': '已提交',
  '3': '已排期', '4': '待会诊', '5': '报告已签发', '6': '已完成',
  '7': '已取消', '8': '已退回',
};
const statusTag: Record<string, TagType> = {
  '0': 'default', '1': 'warning', '2': 'primary',
  '3': 'primary', '4': 'warning', '5': 'primary', '6': 'success',
  '7': 'default', '8': 'danger',
};

function genderText(v: any) {
  if (v === 1 || v === '1') return '男';
  if (v === 0 || v === '0') return '女';
  return '未填写';
}

function formatDate(date: string) {
  return date ? date.substring(0, 16).replace('T', ' ') : '';
}

// Only allow room entry during active consultation, NOT after report signed
const canEnterRoom = computed(() => detail.value && [3, 4].includes(detail.value.status));

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

.section-label {
  font-size: 14px;
  font-weight: 800;
  color: var(--text-color);
  margin-bottom: 8px;
}

.report-content {
  white-space: pre-wrap;
  font-size: 13px;
  line-height: 1.7;
  color: var(--text-secondary);
  margin-top: 12px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.enter-room {
  padding: 16px 0;
  text-align: center;
}

.report-fields {
  margin-top: 12px;
}

.report-item {
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.report-item:last-child {
  border-bottom: none;
}

.report-item-label {
  font-size: 12px;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 4px;
}

.report-item-value {
  font-size: 13px;
  line-height: 1.6;
  color: var(--text-color);
}
</style>
