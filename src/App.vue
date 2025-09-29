<template>

  <el-config-provider>
    <base-header />
    <router-view />
  </el-config-provider>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import BaseHeader from './components/BaseHeader.vue'

</script>
