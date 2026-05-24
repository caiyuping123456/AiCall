<template>
  <div class="home">
    <van-nav-bar title="AICall 在线会诊" />
    <div class="content">
      <van-cell-group inset>
        <van-cell title="发起会诊" is-link to="/consultation/create" icon="add-o" />
        <van-cell title="查询会诊" is-link to="/consultation/query" icon="search" />
      </van-cell-group>
    </div>
  </div>
</template>

<style scoped>
.home {
  min-height: 100vh;
  background: #f7f8fa;
}
.content {
  padding: 16px;
}
</style>
