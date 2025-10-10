<script lang="ts" setup>
import {useDark, useToggle} from "@vueuse/core";
import {Moon, Sunny} from '@element-plus/icons-vue'
import Login from "@/components/CommonLogin.vue";
import router from '@/router/router.ts'

const isDark = useDark();
const toggleDark = useToggle(isDark);

function gotoVOTE() {
  router.push('/vote4fun')
}
</script>

<template>
  <el-menu class="el-menu-demo"
           mode="horizontal"
           :ellipsis="false"
  >

    <el-menu-item index="1">博客</el-menu-item>
    <el-menu-item index="2" @click="gotoVOTE">
      VOTE
    </el-menu-item>

    <el-menu-item index="3">
      <el-switch
          v-model="isDark"
          style="--el-switch-on-color: #0960bd; --el-switch-off-color: #f60"
          inline-prompt
          :active-icon="Moon"
          :inactive-icon="Sunny"
          @change="toggleDark"

      />
    </el-menu-item>
    <el-menu-item index="4">
      <login />
    </el-menu-item>
  </el-menu>
<!--  <Login :dialog-form-visible="false"/>-->

</template>

<style scoped>

.el-menu--horizontal > .el-menu-item:nth-child(2) {
  margin-right: auto;
}

</style>
