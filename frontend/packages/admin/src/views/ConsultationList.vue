<template>
  <div>
    <div style="display: flex; gap: 12px; margin-bottom: 16px;">
      <el-select v-model="statusFilter" placeholder="全部状态" clearable style="width: 160px" @change="page = 1; loadData()">
        <el-option v-for="(label, key) in consultationStatusMap" :key="key" :label="label" :value="Number(key)" />
      </el-select>
      <el-input v-model="keyword" placeholder="搜索患者姓名/会诊编号" style="width: 300px" clearable @clear="loadData" @keyup.enter="loadData" />
    </div>

    <el-table :data="list" v-loading="loading" stripe>
      <el-table-column prop="consultationNo" label="会诊编号" width="180" />
      <el-table-column prop="patientName" label="患者" />
      <el-table-column prop="department" label="科室" />
      <el-table-column label="状态" width="120">
        <template #default="{ row }">
          <el-tag :type="statusTagType(row.status)">{{ consultationStatusMap[row.status] || '未知' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="费用" width="100">
        <template #default="{ row }">¥{{ row.fee ?? '0' }}</template>
      </el-table-column>
      <el-table-column label="支付" width="100">
        <template #default="{ row }">
          <el-tag :type="row.paymentStatus === 1 ? 'success' : row.paymentStatus === 2 ? 'warning' : 'info'" size="small">
            {{ ['', '已支付', '已退款'][row.paymentStatus] || '未支付' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="180" />
      <el-table-column label="操作" width="100">
        <template #default="{ row }">
          <el-button link type="primary" @click="router.push(`/consultations/${row.id}`)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination style="margin-top: 16px; justify-content: flex-end;"
      v-model:current-page="page" v-model:page-size="size"
      :page-sizes="[10, 20, 50]"
      :total="total" layout="total, sizes, prev, pager, next"
      @current-change="loadData" @size-change="loadData" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { getAdminConsultations, type AdminConsultationListItem } from '@aicall/shared';

const router = useRouter();
const loading = ref(false);
const list = ref<AdminConsultationListItem[]>([]);
const keyword = ref('');
const statusFilter = ref<number | undefined>(undefined);
const page = ref(1);
const size = ref(10);
const total = ref(0);

const consultationStatusMap: Record<number, string> = {
  0: '已提交', 1: '资料审核中', 2: '专家确认中', 3: '已排期',
  4: '待会诊', 5: '报告已签发', 6: '已完成', 7: '已取消', 8: '已退回',
};

onMounted(() => loadData());

async function loadData() {
  loading.value = true;
  try {
    const res = await getAdminConsultations({ status: statusFilter.value, keyword: keyword.value, page: page.value, size: size.value });
    list.value = res.list;
    total.value = res.total;
  } catch (e: any) {
    ElMessage.error(e.message || '加载失败');
  } finally {
    loading.value = false;
  }
}

function statusTagType(status: number): string {
  const map: Record<number, string> = {
    0: 'info', 1: 'warning', 2: 'warning', 3: '', 4: 'warning', 5: 'success', 6: 'success', 7: 'danger', 8: 'danger'
  };
  return map[status] || 'info';
}
</script>