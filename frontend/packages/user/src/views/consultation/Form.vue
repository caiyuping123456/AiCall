<template>
  <div class="page">
    <van-nav-bar title="填写病情" left-arrow @click-left="$router.back()" />
    <van-steps :active="1" active-color="#1989fa">
      <van-step>登录</van-step>
      <van-step>预问诊</van-step>
      <van-step>摘要</van-step>
      <van-step>上传资料</van-step>
      <van-step>选择类型</van-step>
      <van-step>支付</van-step>
    </van-steps>
    <div class="content">
      <van-cell-group inset>
        <van-field v-model="form.chiefComplaint" label="主诉" placeholder="您最主要的不适是什么？" required />
        <van-field v-model="form.onsetTime" label="起病时间" placeholder="症状什么时候开始的？" />
        <van-field v-model="form.symptomDescription" label="症状描述" type="textarea" rows="3" placeholder="详细描述症状" />
        <van-field v-model="form.pastHistory" label="既往史" placeholder="是否有慢性疾病、手术史？" />
        <van-field v-model="form.allergyHistory" label="过敏史" placeholder="是否有药物或食物过敏？" />
      </van-cell-group>
      <div class="btn-area">
        <van-button type="primary" block @click="submit" :loading="loading">提交</van-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showToast } from 'vant';
import { formSubmit } from '@aicall/shared';

const route = useRoute();
const router = useRouter();
const consultationId = Number(route.params.id);
const loading = ref(false);

const form = ref({
  chiefComplaint: '',
  onsetTime: '',
  symptomDescription: '',
  pastHistory: '',
  allergyHistory: '',
});

async function submit() {
  if (!form.value.chiefComplaint) {
    showToast('请填写主诉');
    return;
  }
  loading.value = true;
  try {
    await formSubmit(consultationId, form.value);
    router.push(`/consultation/${consultationId}/summary`);
  } catch (e: any) {
    showToast(e.message || '提交失败');
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
