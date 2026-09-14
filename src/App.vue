<template>
  <el-config-provider>
    <base-header v-if="!route.meta.hideHeader" />
    <router-view />
  </el-config-provider>
</template>

<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import BaseHeader from './components/BaseHeader.vue'

const route = useRoute()
</script>
