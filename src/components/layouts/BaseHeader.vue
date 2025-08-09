<script lang="ts" setup>
import {useDark, useToggle} from "@vueuse/core";
import {Moon, Sunny} from '@element-plus/icons-vue'
import Login from "@/components/layouts/Login.vue";

const isDark = useDark();
const toggleDark = useToggle(isDark);

const avatarErrorHandler = () => true

</script>

<template>
  <el-menu class="el-menu-demo" mode="horizontal">

    <el-menu-item index="1">博客</el-menu-item>
    <el-menu-item index="">vote</el-menu-item>

    <el-menu-item style="margin-left: auto;">
      <el-switch
          v-model="isDark"
          style="--el-switch-on-color: #0960bd; --el-switch-off-color: #f60"
          inline-prompt
          :active-icon="Moon"
          :inactive-icon="Sunny"
          @change="toggleDark"

      />
    </el-menu-item>
    <el-menu-item style="margin-right: 20px;">
      <el-avatar
          @error="avatarErrorHandler"
          onclick=""
        >
      </el-avatar>
    </el-menu-item>
  </el-menu>

  <Login :dialog-form-visible="true" />
</template>

<style scoped>
</style>
