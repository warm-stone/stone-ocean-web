<template>

  <el-dialog v-model="dialogFormVisible" title="登录" width="500">
    <el-form :model="form" size="large" label-position="top">
      <el-form-item label="昵称">
        <el-input v-model="form.name" autocomplete="off"/>
      </el-form-item>
      <el-form-item label="性别">
        <el-input v-model="form.name" autocomplete="off"/>
      </el-form-item>
    </el-form>

    <div style="text-align:center">

      <!-- todo: git登录 -->
      <a :href="`${protocol}://${backendUrl}/oauth2/authorization/github`" >

        <img style="height:25px" src="@/assets/github.svg" alt="git登录"
        />
      </a>
    </div>
    <template #footer>
      <div class="dialog-footer" style="text-align:center">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="dialogFormVisible = false">
          登录
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import {reactive} from 'vue'

const backendUrl = import.meta.env.VITE_BACKEND_URL
const protocol = import.meta.env.VITE_PROTOCOL_STR
console.log(backendUrl)
const props = defineProps({
  dialogFormVisible: Boolean,
})

const dialogFormVisible = props.dialogFormVisible

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