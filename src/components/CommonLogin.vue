<template>

  <el-avatar
      @click="userInfo"
  >

  </el-avatar>

  <el-dialog v-model="dialogFormVisible" title="登录" width="500">
    <el-form :model="form" size="large" label-position="top">
      <el-form-item label="账户">
        <el-input v-model="form.name" autocomplete="off"/>
      </el-form-item>
      <el-form-item label="密码">
        <el-input v-model="form.name" type="password" autocomplete="off"/>
      </el-form-item>
    </el-form>

    <div style="text-align:center">

      <img style="height:25px" src="@/assets/github.svg" alt="git登录"
           @click="getCode"
      />
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
import {reactive, ref} from 'vue'
import axios from "axios";

const baseUrl = import.meta.env.VITE_BASE_URL



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

// 三方登录
const dialogFormVisible = ref(false)
async function getCode() {
  const clientInfo_p = await axios.get(baseUrl + '/oauth2Login/github/code')
  console.log(clientInfo_p)
  const clientInfo = clientInfo_p.data.data


  console.log('成功获取 code:', clientInfo)

  // 组装参数
  const redirectParams = new URLSearchParams()
  redirectParams.append('response_type', 'code')
  redirectParams.append('client_id', clientInfo.clientId)
  const scope = clientInfo.scopes || []
  redirectParams.append('scope', scope.join(' '))
  redirectParams.append('redirect_uri', window.location.origin + '/login/oauth2/code/github')

  // 构建最终的重定向 URL
  const finalRedirectUrl = `${clientInfo.authorizationUri}?${redirectParams.toString()}`

  console.log('组装后的重定向 URL:', finalRedirectUrl)

  window.location.href = finalRedirectUrl
}


// 头像点击事件
async function userInfo() {

  // if (hasToken()) {
  //   // 转向个人设置
  //   alert('已登录')
  // }
  // else {
    dialogFormVisible.value = true
  // }
}

</script>