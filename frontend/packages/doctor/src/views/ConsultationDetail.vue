<template>
  <div v-loading="loading">
    <el-page-header @back="router.back()" title="返回" :content="detail?.patientName || '会诊详情'" style="margin-bottom: 20px" />

    <template v-if="detail">
      <div style="margin-bottom: 16px" v-if="detail.status === 2">
        <el-button type="primary" @click="handleConfirm" :loading="actionLoading">确认接诊</el-button>
        <el-button type="danger" @click="showRejectDialog = true">拒绝</el-button>
      </div>
      <!-- status=3: ready to generate report -->
      <div style="margin-bottom: 16px" v-if="detail.status === 3 && !detail.report">
        <el-button type="success" @click="handleGenerateReport" :loading="actionLoading">生成AI报告</el-button>
      </div>
      <!-- status=3 or 4: enter room -->
      <div style="margin-bottom: 16px" v-if="detail.status === 3 || detail.status === 4">
        <el-button type="success" @click="router.push(`/consultations/${id}/room`)">进入会诊室</el-button>
      </div>
      <!-- report exists as draft: edit -->
      <div style="margin-bottom: 16px" v-if="detail.report?.status === 0 && (detail.status === 3 || detail.status === 4)">
        <el-button type="primary" @click="router.push(`/consultations/${id}/report`)">编辑报告</el-button>
      </div>
      <!-- status=4 with report draft: review/edit -->
      <div style="margin-bottom: 16px" v-if="detail.status === 4">
        <el-tag type="warning" size="large">待会诊</el-tag>
      </div>
      <!-- status=5: report issued -->
      <div style="margin-bottom: 16px" v-if="detail.status === 5">
        <el-tag type="success" size="large">报告已签发</el-tag>
      </div>
      <!-- status=6: completed -->
      <div style="margin-bottom: 16px" v-if="detail.status === 6">
        <el-tag type="info" size="large">已完成</el-tag>
        <template v-if="detail.report">
          <el-button type="primary" style="margin-left: 12px" @click="router.push(`/consultations/${id}/report`)">查看报告</el-button>
        </template>
      </div>

      <el-tabs>
        <el-tab-pane label="患者信息">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="姓名">{{ detail.patientName }}</el-descriptions-item>
            <el-descriptions-item label="年龄">{{ detail.patientAge }}</el-descriptions-item>
            <el-descriptions-item label="性别">{{ detail.patientGender }}</el-descriptions-item>
            <el-descriptions-item label="科室">{{ detail.department }}</el-descriptions-item>
            <el-descriptions-item label="主诉" :span="2">{{ detail.chiefComplaint }}</el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>

        <el-tab-pane label="病情摘要">
          <div style="white-space: pre-wrap; line-height: 1.8">{{ detail.medicalSummary || '暂无' }}</div>
        </el-tab-pane>

        <el-tab-pane label="上传资料">
          <el-table :data="detail.uploads" stripe>
            <el-table-column prop="fileName" label="文件名" />
            <el-table-column prop="fileType" label="类型" width="100">
              <template #default="{ row }">
                {{ ['', '检查报告', '影像资料', '病历资料', '其他', '化验单'][row.fileType] || '其他' }}
              </template>
            </el-table-column>
            <el-table-column label="OCR结果" min-width="200">
              <template #default="{ row }">{{ formatOcrLabel(row.ocrResult) }}</template>
            </el-table-column>
            <el-table-column label="操作" width="100">
              <template #default="{ row }">
                <a :href="row.fileUrl" target="_blank" style="color: #409eff; text-decoration: none">查看</a>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="问诊记录">
          <div v-for="(msg, idx) in detail.chatHistory" :key="idx"
               :style="{ textAlign: msg.role === 'user' ? 'right' : 'left', margin: '8px 0' }">
            <el-tag :type="msg.role === 'ai' ? 'success' : msg.role === 'user' ? '' : 'info'" size="small">
              {{ msg.role === 'user' ? '患者' : msg.role === 'ai' ? 'AI' : '系统' }}
            </el-tag>
            <span style="margin-left: 8px">{{ msg.content }}</span>
          </div>
        </el-tab-pane>

        <el-tab-pane label="报告" v-if="detail.report">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="状态">
              <el-tag :type="detail.report.status === 0 ? 'warning' : detail.report.status === 1 ? 'success' : 'info'">
                {{ ['草稿', '待质控', '已签发'][detail.report.status] }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="签发人" v-if="detail.report.signedByName">{{ detail.report.signedByName }}</el-descriptions-item>
          </el-descriptions>
          <el-button type="primary" style="margin-top: 12px" @click="router.push(`/consultations/${id}/report`)">
            查看完整报告
          </el-button>
        </el-tab-pane>

        <el-tab-pane label="报告详情" v-if="detail.report?.fields">
          <div style="max-width: 800px">
            <el-card v-for="(label, key) in reportFieldLabels" :key="key" style="margin-bottom: 12px">
              <template #header><strong>{{ label }}</strong></template>
              <div style="white-space: pre-wrap; line-height: 1.8">{{ detail.report.fields[key] || '无' }}</div>
            </el-card>
          </div>
        </el-tab-pane>

        <el-tab-pane label="随访记录">
          <el-table :data="followUps" stripe v-loading="followUpLoading">
            <el-table-column label="随访天数">
              <template #default="{ row }">第{{ row.planDay }}天</template>
            </el-table-column>
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="['info', '', 'success', 'danger'][row.status] || 'info'" size="small">
                  {{ ['待发送', '已发送', '已回复', '异常'][row.status] || '未知' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="sendTime" label="发送时间" width="160" />
            <el-table-column prop="answerTime" label="回复时间" width="160" />
            <el-table-column label="操作" width="100">
              <template #default="{ row }">
                <el-button link type="primary" @click="showFollowUpDetail(row)">查看</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </template>

    <el-dialog v-model="showRejectDialog" title="拒绝原因" width="400px">
      <el-input v-model="rejectReason" type="textarea" :rows="3" placeholder="请输入拒绝原因" />
      <template #footer>
        <el-button @click="showRejectDialog = false">取消</el-button>
        <el-button type="danger" @click="handleReject" :loading="actionLoading">确认拒绝</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getDoctorConsultationDetail, confirmConsultation, rejectConsultation, generateReport, getDoctorFollowUps, type DoctorConsultationDetail, formatOcrLabel } from '@aicall/shared';

const route = useRoute();
const router = useRouter();
const id = Number(route.params.id);
const loading = ref(false);
const actionLoading = ref(false);
const detail = ref<DoctorConsultationDetail | null>(null);
const showRejectDialog = ref(false);
const rejectReason = ref('');
const followUps = ref<any[]>([]);
const followUpLoading = ref(false);

const reportFieldLabels: Record<string, string> = {
  chiefComplaint: '主诉',
  presentIllness: '现病史',
  pastHistory: '既往史',
  examinationFindings: '检查所见',
  diagnosis: '诊断意见',
  analysis: '分析说明',
  recommendation: '建议',
  followUp: '随访建议',
};
onMounted(() => loadData());

async function loadData() {
  loading.value = true;
  try {
    detail.value = await getDoctorConsultationDetail(id);
    loadFollowUps();
  } catch (e: any) {
    ElMessage.error(e.message || '加载失败');
  } finally {
    loading.value = false;
  }
}

async function handleConfirm() {
  actionLoading.value = true;
  try {
    await confirmConsultation(id);
    ElMessage.success('已确认接诊');
    loadData();
  } catch (e: any) {
    ElMessage.error(e.message || '操作失败');
  } finally {
    actionLoading.value = false;
  }
}

async function handleReject() {
  if (!rejectReason.value) {
    ElMessage.warning('请输入拒绝原因');
    return;
  }
  actionLoading.value = true;
  try {
    await rejectConsultation(id, rejectReason.value);
    ElMessage.success('已拒绝');
    showRejectDialog.value = false;
    router.push('/consultations');
  } catch (e: any) {
    ElMessage.error(e.message || '操作失败');
  } finally {
    actionLoading.value = false;
  }
}

async function handleGenerateReport() {
  actionLoading.value = true;
  try {
    await generateReport(id);
    ElMessage.success('报告已生成');
    loadData();
  } catch (e: any) {
    ElMessage.error(e.message || '生成失败');
  } finally {
    actionLoading.value = false;
  }
}

async function loadFollowUps() {
  followUpLoading.value = true;
  try {
    followUps.value = await getDoctorFollowUps(id);
  } catch { /* optional */ }
  finally { followUpLoading.value = false; }
}

function showFollowUpDetail(row: any) {
  ElMessageBox.alert(
    '问卷：' + (row.questionnaire || '无') + '\n\n回答：' + (row.answer || '暂无') +
    '\n\nAI分析：' + (row.aiAnalysis || '暂无'),
    '第' + row.planDay + '天随访详情',
    { confirmButtonText: '关闭' }
  );
}
</script>
