<template>

  <el-config-provider>
    <BaseHeader />
    <RouterView />
  </el-config-provider>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import BaseHeader from '@/components/layouts/BaseHeader.vue'

</script>