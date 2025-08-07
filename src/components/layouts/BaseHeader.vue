<script lang="ts" setup>
import { useDark, useToggle } from "@vueuse/core";
import { Moon, Sunny } from '@element-plus/icons-vue'

const isDark = useDark();
const toggleDark = useToggle(isDark);
</script>

<template>
  <el-menu class="el-menu-demo" mode="horizontal">
    <el-menu-item index="1">Element Plus</el-menu-item>
    <el-sub-menu index="2">
      <template #title>Workspace</template>
      <el-menu-item index="2-1">item one</el-menu-item>
      <el-menu-item index="2-2">item two</el-menu-item>
      <el-menu-item index="2-3">item three</el-menu-item>
      <el-sub-menu index="2-4">
        <template #title>item four</template>
        <el-menu-item index="2-4-1">item one</el-menu-item>
        <el-menu-item index="2-4-2">item two</el-menu-item>
        <el-menu-item index="2-4-3">item three</el-menu-item>
      </el-sub-menu>
    </el-sub-menu>
    <el-menu-item index="3" disabled>Info</el-menu-item>
    <el-menu-item index="4">Orders</el-menu-item>
    <el-menu-item h="full">
      <el-switch
        v-model="isDark"
        style="--el-switch-on-color: #0960bd; --el-switch-off-color: #f60"
        inline-prompt
        :active-icon="Moon"
        :inactive-icon="Sunny"
        @change="toggleDark"
      />
    </el-menu-item>
  </el-menu>
</template>
