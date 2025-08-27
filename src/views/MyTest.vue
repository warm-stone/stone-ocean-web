<template>
  <div class="demo-collapse">
    <el-collapse v-model="activeNames" @change="handleChange">
      <el-collapse-item title="Consistency" name="1">
        <template #title="{ isActive }">

        </template>
        <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleClick">
          <el-tab-pane label="子项" name="first">
            <ul v-infinite-scroll="load" class="infinite-list" style="overflow: auto">
              <li v-for="i in count" :key="i" class="infinite-list-item">{{ i }}</li>
            </ul>
          </el-tab-pane>
          <el-tab-pane label="投票记录" name="second">
            <ul v-infinite-scroll="load" class="infinite-list" style="overflow: auto">
              <li v-for="i in count" :key="i" class="infinite-list-item">{{ i }}</li>
            </ul>
          </el-tab-pane>
        </el-tabs>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

import type { CollapseModelValue } from 'element-plus'

const activeNames = ref(['1'])
const handleChange = (val: CollapseModelValue) => {
  console.log(val)
}
</script>
