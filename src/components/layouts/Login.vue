<template>

  <el-dialog v-model="dialogFormVisible" title="Shipping address" width="500">
    <el-form :model="form" size="large" label-position="top">
      <el-form-item label="昵称" >
        <el-input v-model="form.name" autocomplete="off"/>
      </el-form-item>
      <el-form-item label="性别">
        <el-input v-model="form.name" autocomplete="off"/>
      </el-form-item>
    </el-form>

    <div style="text-align:center">

      <img style="height:25px" src="@/assets/github.svg" alt="git登录"
<!--           todo: git登录-->
        onclick=""/>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogFormVisible = false">Cancel</el-button>
        <el-button type="primary" @click="dialogFormVisible = false">
          Confirm
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import {reactive} from 'vue'

const props = defineProps({
  dialogFormVisible: Boolean,
})

const dialogFormVisible = props.dialogFormVisible
const formLabelWidth = '140px'

const form = reactive({
  name: '',
  region: '',
  date1: '',
  date2: '',
  delivery: false,
  type: [],
  resource: '',
  desc: '',
})

</script>