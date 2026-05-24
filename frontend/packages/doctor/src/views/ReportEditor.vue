<template>
  <div v-loading="loading">
    <el-page-header @back="router.back()" title="返回" content="报告编辑" style="margin-bottom: 20px" />

    <template v-if="report">
      <el-alert :title="statusTitle" :type="statusAlertType" show-icon :closable="false" style="margin-bottom: 16px" />

      <el-card v-if="report.qcResult" style="margin-bottom: 16px">
        <template #header>质控结果</template>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-statistic title="完整性" :value="report.qcResult.completenessScore" suffix="分" />
          </el-col>
          <el-col :span="6">
            <el-statistic title="规范性" :value="report.qcResult.standardScore" suffix="分" />
          </el-col>
          <el-col :span="6">
            <el-statistic title="一致性" :value="report.qcResult.consistencyScore" suffix="分" />
          </el-col>
          <el-col :span="6">
            <el-statistic title="总分" :value="report.qcResult.totalScore" suffix="分" />
          </el-col>
        </el-row>
        <div v-if="parsedIssues.length" style="margin-top: 12px">
          <strong>问题：</strong>
          <ul>
            <li v-for="(issue, idx) in parsedIssues" :key="idx">{{ issue }}</li>
          </ul>
        </div>
      </el-card>

      <el-card style="margin-bottom: 16px">
        <template #header>报告内容</template>
        <el-form label-position="top" v-if="parsedContent">
          <el-form-item label="主诉">
            <el-input v-model="parsedContent.chiefComplaint" type="textarea" :rows="2" :disabled="!editable" />
          </el-form-item>
          <el-form-item label="现病史">
            <el-input v-model="parsedContent.presentIllness" type="textarea" :rows="3" :disabled="!editable" />
          </el-form-item>
          <el-form-item label="既往史">
            <el-input v-model="parsedContent.pastHistory" type="textarea" :rows="2" :disabled="!editable" />
          </el-form-item>
          <el-form-item label="检查所见">
            <el-input v-model="parsedContent.examinationFindings" type="textarea" :rows="3" :disabled="!editable" />
          </el-form-item>
          <el-form-item label="诊断意见">
            <el-input v-model="parsedContent.diagnosis" type="textarea" :rows="2" :disabled="!editable" />
          </el-form-item>
          <el-form-item label="分析说明">
            <el-input v-model="parsedContent.analysis" type="textarea" :rows="3" :disabled="!editable" />
          </el-form-item>
          <el-form-item label="建议">
            <el-input v-model="parsedContent.recommendation" type="textarea" :rows="2" :disabled="!editable" />
          </el-form-item>
          <el-form-item label="随访建议">
            <el-input v-model="parsedContent.followUp" type="textarea" :rows="2" :disabled="!editable" />
          </el-form-item>
        </el-form>
        <div v-else>
          <el-input v-model="rawContent" type="textarea" :rows="15" :disabled="!editable" />
        </div>
      </el-card>

      <div style="text-align: center" v-if="editable">
        <el-button type="primary" @click="handleSave" :loading="actionLoading">保存</el-button>
        <el-button type="success" @click="handleSubmit" :loading="actionLoading">提交质控</el-button>
      </div>
      <div style="text-align: center" v-if="report.status === 1 && report.qcResult?.status === 1">
        <el-button type="warning" size="large" @click="handleSign" :loading="actionLoading">签名签发</el-button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getReport, updateReport, submitReport, signReport, type ReportData } from '@aicall/shared';

const route = useRoute();
const router = useRouter();
const id = Number(route.params.id);
const loading = ref(false);
const actionLoading = ref(false);
const report = ref<ReportData | null>(null);
const rawContent = ref('');

interface ReportContent {
  chiefComplaint: string;
  presentIllness: string;
  pastHistory: string;
  examinationFindings: string;
  diagnosis: string;
  analysis: string;
  recommendation: string;
  followUp: string;
  [key: string]: string;
}

const parsedContent = computed<ReportContent | null>(() => {
  if (!report.value) return null;
  try {
    const c = JSON.parse(rawContent.value);
    if (c.chiefComplaint !== undefined) return c as ReportContent;
    return null;
  } catch {
    return null;
  }
});

const editable = computed(() => report.value?.status === 0);

const statusTitle = computed(() => {
  if (!report.value) return '';
  return ['报告编辑中（草稿）', '报告已提交质控', '报告已签发'][report.value.status];
});

const statusAlertType = computed(() => {
  if (!report.value) return 'info';
  return ['warning', 'success', 'info'][report.value.status] as any;
});

const parsedIssues = computed(() => {
  if (!report.value?.qcResult?.issues) return [];
  try {
    return JSON.parse(report.value.qcResult.issues);
  } catch {
    return [];
  }
});

onMounted(() => loadData());

async function loadData() {
  loading.value = true;
  try {
    report.value = await getReport(id);
    if (report.value) {
      rawContent.value = report.value.content;
    }
  } catch (e: any) {
    ElMessage.error(e.message || '加载失败');
  } finally {
    loading.value = false;
  }
}

function getContentToSend(): string {
  if (parsedContent.value) {
    return JSON.stringify(parsedContent.value);
  }
  return rawContent.value;
}

async function handleSave() {
  actionLoading.value = true;
  try {
    await updateReport(id, getContentToSend());
    ElMessage.success('已保存');
    loadData();
  } catch (e: any) {
    ElMessage.error(e.message || '保存失败');
  } finally {
    actionLoading.value = false;
  }
}

async function handleSubmit() {
  try {
    await ElMessageBox.confirm('提交后将进行AI质控，确定提交？', '确认', { type: 'warning' });
  } catch {
    return;
  }
  actionLoading.value = true;
  try {
    const result = await submitReport(id);
    if (result.status === 1) {
      ElMessage.success('质控通过！');
    } else {
      ElMessage.warning('质控未通过，请根据问题修改报告');
    }
    loadData();
  } catch (e: any) {
    ElMessage.error(e.message || '提交失败');
  } finally {
    actionLoading.value = false;
  }
}

async function handleSign() {
  try {
    await ElMessageBox.confirm('签发后报告将正式生效，确定签发？', '确认签发', { type: 'warning' });
  } catch {
    return;
  }
  actionLoading.value = true;
  try {
    await signReport(id);
    ElMessage.success('已签发');
    router.push('/consultations');
  } catch (e: any) {
    ElMessage.error(e.message || '签发失败');
  } finally {
    actionLoading.value = false;
  }
}
</script>
