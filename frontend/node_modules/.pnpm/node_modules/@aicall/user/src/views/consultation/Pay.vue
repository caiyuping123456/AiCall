<template>
  <div class="page">
    <van-nav-bar title="确认支付" left-arrow @click-left="$router.back()" />
    <van-steps :active="5" active-color="#1989fa">
      <van-step>登录</van-step>
      <van-step>预问诊</van-step>
      <van-step>摘要</van-step>
      <van-step>上传资料</van-step>
      <van-step>选择类型</van-step>
      <van-step>支付</van-step>
    </van-steps>
    <div class="content">
      <van-cell-group inset>
        <van-cell title="会诊编号" :value="detail.consultationNo" />
        <van-cell title="会诊类型" :value="detail.type === 2 ? '多学科MDT会诊' : '单学科会诊'" />
        <van-cell title="会诊费用" :value="`¥${detail.fee || '0.00'}`" />
      </van-cell-group>
      <div class="btn-area">
        <van-button type="primary" block @click="handlePay" :loading="loading">
          确认支付 ¥{{ detail.fee || '0.00' }}
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showToast } from 'vant';
import { getConsultationDetail, payConsultation } from '@aicall/shared';

const route = useRoute();
const router = useRouter();
const consultationId = Number(route.params.id);
const detail = reactive<any>({});
const loading = ref(false);

onMounted(async () => {
  try {
    const res = await getConsultationDetail(consultationId);
    Object.assign(detail, res);
  } catch (e: any) {
    showToast(e.message || '获取详情失败');
  }
});

async function handlePay() {
  loading.value = true;
  try {
    await payConsultation(consultationId);
    router.push(`/consultation/${consultationId}/success`);
  } catch (e: any) {
    showToast(e.message || '支付失败');
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.page { min-height: 100vh; background: #f7f8fa; }
.content { padding: 16px; }
.btn-area { padding: 24px 16px; }
</style>
