<template>
  <div class="profile-page">
    <van-nav-bar title="完善资料" />
    <div class="form-area">
      <div class="hint">请完善您的个人资料</div>
      <van-cell-group inset>
        <van-field v-model="name" label="姓名" placeholder="请输入姓名" :rules="[{ required: true, message: '请输入姓名' }]" />
        <van-field v-model="age" label="年龄" placeholder="请输入年龄" type="digit" :rules="[{ required: true, message: '请输入年龄' }]" />
        <van-field name="gender" label="性别">
          <template #input>
            <van-radio-group v-model="gender" direction="horizontal">
              <van-radio :name="1">男</van-radio>
              <van-radio :name="0">女</van-radio>
            </van-radio-group>
          </template>
        </van-field>
      </van-cell-group>
      <div class="btn-area">
        <van-button type="primary" block @click="handleSubmit" :loading="loading">提交</van-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import { completeProfile } from '@aicall/shared';

const router = useRouter();
const name = ref('');
const age = ref('');
const gender = ref<number | null>(null);
const loading = ref(false);

async function handleSubmit() {
  if (!name.value) { showToast('请输入姓名'); return; }
  if (!age.value || isNaN(Number(age.value)) || Number(age.value) <= 0) { showToast('请输入有效年龄'); return; }
  if (gender.value === null) { showToast('请选择性别'); return; }

  loading.value = true;
  try {
    await completeProfile({ name: name.value, age: Number(age.value), gender: gender.value });
    localStorage.setItem('patientName', name.value);
    localStorage.setItem('profileComplete', '1');
    showToast('资料完善成功');
    router.push('/');
  } catch (e: any) {
    showToast(e.message || '提交失败');
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.profile-page { min-height: 100vh; background: #f7f8fa; }
.form-area { padding: 40px 0; }
.hint { text-align: center; color: #999; font-size: 14px; margin-bottom: 20px; }
.btn-area { padding: 24px 16px; }
</style>
