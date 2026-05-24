<template>
  <div class="home">
    <van-nav-bar title="AICall 在线会诊" />
    <div class="content">
      <van-cell-group inset title="会诊服务">
        <van-cell title="发起会诊" is-link @click="$router.push('/consultation/start')" icon="add-o" />
        <van-cell title="查询会诊" is-link @click="$router.push('/consultation/query')" icon="search" />
        <van-cell title="我的会诊" is-link @click="$router.push('/meetings')" icon="records-o" />
      </van-cell-group>
    </div>
    <ChatWidget />
  </div>
</template>

<script setup lang="ts">
import ChatWidget from '@/components/ChatWidget.vue';
</script>

<style scoped>
.home { min-height: 100vh; background: #f7f8fa; }
.content { padding: 16px; }
</style>
