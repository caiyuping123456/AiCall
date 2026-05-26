<template>
  <div v-loading="loading">
    <el-page-header @back="router.back()" title="返回" content="会诊详情" style="margin-bottom: 20px" />

    <template v-if="detail">
      <!-- Cancel only for early stages (before consultation completes) -->
      <div style="margin-bottom: 16px" v-if="detail.status < 4">
        <el-button type="danger" @click="showCancelDialog = true">取消会诊</el-button>
      </div>

      <el-descriptions :column="2" border style="margin-bottom: 20px">
        <el-descriptions-item label="会诊编号">{{ detail.consultationNo }}</el-descriptions-item>
        <el-descriptions-item label="患者姓名">{{ detail.patientName }}</el-descriptions-item>
        <el-descriptions-item label="年龄">{{ detail.patientAge }}</el-descriptions-item>
        <el-descriptions-item label="性别">{{ detail.patientGender }}</el-descriptions-item>
        <el-descriptions-item label="科室">{{ detail.department }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="statusTagType(detail.status)">{{ consultationStatusMap[detail.status] || '未知' }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="费用">¥{{ detail.fee ?? '0' }}</el-descriptions-item>
        <el-descriptions-item label="支付状态">
          <el-tag :type="detail.paymentStatus === 1 ? 'success' : 'info'" size="small">
            {{ ['', '已支付', '已退款'][detail.paymentStatus] || '未支付' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="主诉" :span="2">{{ detail.chiefComplaint || '无' }}</el-descriptions-item>
        <el-descriptions-item label="AI摘要" :span="2">
          <div style="white-space: pre-wrap; line-height: 1.8">{{ detail.medicalSummary || '暂无' }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="取消原因" :span="2" v-if="detail.cancelReason">{{ detail.cancelReason }}</el-descriptions-item>
      </el-descriptions>

      <el-card header="流程追踪" style="margin-bottom: 20px">
        <el-timeline v-if="timeline.length">
          <el-timeline-item
            v-for="item in timeline"
            :key="item.status"
            :timestamp="item.time"
            :color="item.status === detail.status ? '#409eff' : ''"
          >
            {{ item.label }}
            <span style="color: #999; font-size: 12px; margin-left: 8px">{{ item.operator }}</span>
          </el-timeline-item>
        </el-timeline>
        <div v-else style="text-align: center; color: #999; padding: 20px">暂无流程记录</div>
      </el-card>

      <el-card header="指派医生" style="margin-bottom: 20px">
        <template #header>
          <div style="display: flex; justify-content: space-between; align-items: center">
            <span>指派医生</span>
            <el-button type="primary" size="small" @click="openAssignDialog" v-if="detail.status < 3">
              指派医生
            </el-button>
          </div>
        </template>
        <el-table :data="detail.assignedDoctors ?? []" stripe>
          <el-table-column prop="name" label="姓名" />
          <el-table-column prop="title" label="职称" />
          <el-table-column prop="department" label="科室" />
          <el-table-column label="角色" width="100">
            <template #default="{ row }">{{ row.role === 1 ? '主持人' : '专家' }}</template>
          </el-table-column>
          <el-table-column label="确认状态" width="100">
            <template #default="{ row }">
              <el-tag :type="['warning', 'success', 'danger'][row.confirmStatus]" size="small">
                {{ ['待确认', '已确认', '已拒绝'][row.confirmStatus] ?? '未知' }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
        <div v-if="!detail.assignedDoctors?.length" style="text-align: center; color: #999; padding: 20px">
          暂未指派医生
        </div>
      </el-card>

      <el-card header="上传资料" v-if="detail.uploads?.length">
        <el-table :data="detail.uploads" stripe>
          <el-table-column prop="fileName" label="文件名" />
          <el-table-column label="操作" width="100">
            <template #default="{ row }">
              <a :href="row.fileUrl" target="_blank" style="color: #409eff; text-decoration: none">查看</a>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <el-card header="会诊纪要" style="margin-bottom: 20px" v-if="detail.minutes">
        <div style="white-space: pre-wrap; line-height: 1.8">{{ detail.minutes }}</div>
      </el-card>

      <el-card header="会诊报告" style="margin-bottom: 20px" v-if="detail.report">
        <el-descriptions :column="2" border style="margin-bottom: 12px">
          <el-descriptions-item label="报告状态">
            <el-tag :type="detail.report.status === 0 ? 'warning' : detail.report.status === 1 ? 'primary' : 'success'">
              {{ ['草稿', '待质控', '已签发'][detail.report.status] || '未知' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="签发人" v-if="detail.report.signedByName">{{ detail.report.signedByName }}</el-descriptions-item>
          <el-descriptions-item label="签发时间" v-if="detail.report.signedTime" :span="2">{{ detail.report.signedTime }}</el-descriptions-item>
        </el-descriptions>
        <template v-if="parsedReportFields">
          <el-descriptions :column="1" border>
            <el-descriptions-item v-for="(value, key) in parsedReportFields" :key="key" :label="reportFieldLabels[key] || key">
              <div style="white-space: pre-wrap; line-height: 1.7">{{ value }}</div>
            </el-descriptions-item>
          </el-descriptions>
        </template>
        <div v-else style="white-space: pre-wrap; line-height: 1.8; padding: 12px; background: #f9fafb; border-radius: 8px;">{{ detail.report.content }}</div>
      </el-card>

      <el-card header="会诊录像" style="margin-bottom: 20px" v-if="recordings.length">
        <el-table :data="recordings" stripe>
          <el-table-column label="录像文件" min-width="200">
            <template #default="{ row }">
              <a :href="row.fileUrl" target="_blank" style="color: #409eff; text-decoration: none">{{ row.fileUrl }}</a>
            </template>
          </el-table-column>
          <el-table-column label="时长" width="100">
            <template #default="{ row }">
              {{ row.duration ? Math.floor(row.duration / 60) + '分' + (row.duration % 60) + '秒' : '-' }}
            </template>
          </el-table-column>
          <el-table-column label="文件大小" width="120">
            <template #default="{ row }">
              {{ row.fileSize ? (row.fileSize / 1024 / 1024).toFixed(1) + ' MB' : '-' }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100">
            <template #default="{ row }">
              <el-button link type="primary" @click="playingUrl = row.fileUrl; showPlayer = true">播放</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <el-dialog v-model="showPlayer" title="录像播放" width="700px" @close="playingUrl = ''">
        <video v-if="playingUrl" :src="playingUrl" controls style="width: 100%; max-height: 500px" />
      </el-dialog>
    </template>

    <el-dialog v-model="showAssignDialog" title="指派医生" width="600px" @close="assignRows = [{ doctorId: null as unknown as number, role: 0 }]">
      <div v-for="(row, index) in assignRows" :key="index" style="display: flex; gap: 12px; align-items: center; margin-bottom: 12px">
        <el-select v-model="row.doctorId" placeholder="选择医生" filterable style="flex: 1" @focus="loadAllDoctors()">
          <el-option v-for="d in allDoctors" :key="d.id" :label="`${d.name} (${d.department || '无科室'} · ${d.title || '无职称'})`" :value="d.id" />
        </el-select>
        <el-select v-model="row.role" style="width: 120px">
          <el-option :value="0" label="普通专家" />
          <el-option :value="1" label="主持人" />
        </el-select>
        <el-button :disabled="assignRows.length <= 1" @click="assignRows.splice(index, 1)" link type="danger">删除</el-button>
      </div>
      <el-button @click="assignRows.push({ doctorId: null as unknown as number, role: 0 })" link type="primary" style="margin-bottom: 8px">+ 添加医生</el-button>
      <template #footer>
        <el-button @click="showAssignDialog = false">取消</el-button>
        <el-button type="primary" :loading="actionLoading" @click="handleAssign">确认指派</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showCancelDialog" title="取消会诊" width="400px">
      <el-input v-model="cancelReason" type="textarea" :rows="3" placeholder="请输入取消原因" />
      <template #footer>
        <el-button @click="showCancelDialog = false">取消</el-button>
        <el-button type="danger" :loading="actionLoading" @click="handleCancel">确认取消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { getAdminConsultationDetail, cancelAdminConsultation, getAdminDoctors, assignConsultationDoctors, getLiveRoomByConsultation, getLiveRecordings, getConsultationTimeline, type Recording, type AdminDoctorListItem, type TimelineItem } from '@aicall/shared';

const route = useRoute();
const router = useRouter();
const id = Number(route.params.id);
const loading = ref(false);
const actionLoading = ref(false);
const detail = ref<any>(null);
const showCancelDialog = ref(false);
const cancelReason = ref('');
const showAssignDialog = ref(false);
const assignRows = ref([{ doctorId: null as unknown as number, role: 0 }]);
const allDoctors = ref<AdminDoctorListItem[]>([]);
const recordings = ref<Recording[]>([]);
const timeline = ref<TimelineItem[]>([]);
const showPlayer = ref(false);
const playingUrl = ref('');

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

const parsedReportFields = computed(() => {
  if (!detail.value?.report?.content) return null;
  return tryParseJson(detail.value.report.content);
});

const consultationStatusMap: Record<number, string> = {
  0: '已提交', 1: '资料审核中', 2: '专家确认中', 3: '已排期',
  4: '待会诊', 5: '报告已签发', 6: '已完成', 7: '已取消', 8: '已退回',
};

onMounted(() => loadData());

async function loadData() {
  loading.value = true;
  try {
    detail.value = await getAdminConsultationDetail(id);
    try {
      const room = await getLiveRoomByConsultation(id);
      if (room) {
        recordings.value = await getLiveRecordings(room.id);
      }
    } catch { /* recordings optional */ }
    try {
      timeline.value = await getConsultationTimeline(id);
    } catch { /* timeline optional */ }
  } catch (e: any) {
    ElMessage.error(e.message || '加载失败');
  } finally {
    loading.value = false;
  }
}

function openAssignDialog() {
  assignRows.value = [{ doctorId: null as unknown as number, role: 0 }];
  showAssignDialog.value = true;
}

async function loadAllDoctors() {
  if (allDoctors.value.length) return;
  try {
    const res = await getAdminDoctors({ page: 1, size: 200 });
    allDoctors.value = res.list;
  } catch { /* ignore */ }
}

async function handleAssign() {
  const valid = assignRows.value.filter(r => r.doctorId);
  if (!valid.length) {
    ElMessage.warning('请至少选择一个医生');
    return;
  }
  actionLoading.value = true;
  try {
    await assignConsultationDoctors(id, valid.map(r => ({ doctorId: r.doctorId, role: r.role })));
    ElMessage.success('指派成功');
    showAssignDialog.value = false;
    await loadData();
  } catch (e: any) {
    ElMessage.error(e.message || '指派失败');
  } finally {
    actionLoading.value = false;
  }
}

async function handleCancel() {
  if (!cancelReason.value) {
    ElMessage.warning('请输入取消原因');
    return;
  }
  actionLoading.value = true;
  try {
    await cancelAdminConsultation(id, cancelReason.value);
    ElMessage.success('会诊已取消');
    router.push('/consultations');
  } catch (e: any) {
    ElMessage.error(e.message || '操作失败');
  } finally {
    actionLoading.value = false;
  }
}

function statusTagType(status: number): string {
  const map: Record<number, string> = {
    0: 'info', 1: 'warning', 2: 'warning', 3: '', 4: 'warning', 5: 'success', 6: 'success', 7: 'danger', 8: 'danger'
  };
  return map[status] || 'info';
}
</script>