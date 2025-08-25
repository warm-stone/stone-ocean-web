<template>

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

      <!-- todo: git登录 -->
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
import {reactive} from 'vue'
import axios from "axios";

const baseUrl = import.meta.env.VITE_BASE_URL
console.log(baseUrl)
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

async function getCode() {
  const clientInfo_p = await axios.get(baseUrl + '/oauth2Login/github/code')
  console.log(clientInfo_p)
  const clientInfo = clientInfo_p.data.data


  console.log('成功获取 code:', clientInfo)

  // 步骤 2: 组装参数
  const redirectParams = new URLSearchParams()
  redirectParams.append('response_type', 'code')
  redirectParams.append('client_id', clientInfo.clientId)
  const scope = clientInfo.scopes || []
  redirectParams.append('scope', scope.join(' '))
  redirectParams.append('redirect_uri', 'http://' + window.location.host + '/login/oauth2/code/github')
  // 可以根据需要添加更多参数
  // redirectParams.append('state', 'some_state')
  // redirectParams.append('redirect_uri', 'https://your-app.com/callback')

  // 构建最终的重定向 URL
  const finalRedirectUrl = `${clientInfo.authorizationUri}?${redirectParams.toString()}`

  console.log('组装后的重定向 URL:', finalRedirectUrl)

  // 步骤 3: 重定向到 URL B
  // 注意: 这会离开当前页面
  window.location.href = finalRedirectUrl

  // const token = await axios.post(backendUrl + '/oauth2Login/github/register')
  // console.log(clientInfo)
}

</script>