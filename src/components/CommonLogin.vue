<template>
  <el-avatar @click="userInfo" :src="avatarUrl"></el-avatar>

  <el-dialog v-model="dialogFormVisible" title="登录" width="500">
    <el-form ref="userAccount" :model="form" :rules="loginRules" size="large" label-position="top">
      <el-form-item label="账户" prop="account">
        <el-input v-model="form.account" />
      </el-form-item>
      <el-form-item label="密码" prop="passwordHash">
        <el-input v-model="form.passwordHash" type="password" autocomplete="off" />
      </el-form-item>
    </el-form>
    <div style="text-align: center">
      <img style="height: 25px" src="@/assets/github.svg" alt="git登录" @click="getCode" />
    </div>
    <div class="dialog-footer" style="text-align: center">
      <el-button type="primary" @click="login"> 登录</el-button>
      <el-button @click="dialogFormVisible = false">取消</el-button>
    </div>
    <template #footer>
      <a href="/user/register">注册</a>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { computed, reactive, ref } from 'vue'
import axios from 'axios'
import { type ElForm, ElMessage } from 'element-plus'
import { API_IMG_URL, API_URLS, post } from '@/utils/network.ts'
import type { ApiResult, AuthorizationDTO } from '@/utils/interfaces.ts'
import { useSelfStore } from '@/utils/piniaCache.ts'

// 路由实例
const baseUrl = import.meta.env.VITE_BASE_URL

// 头像
const avatarUrl = computed(() => {
  const selfStore = useSelfStore()
  if (!selfStore.token) return ''
  if (!selfStore.user?.avatarUrl) return ''
  if (selfStore.user.avatarUrl.startsWith('http')) return selfStore.user.avatarUrl
  return API_IMG_URL(selfStore.user.avatarUrl)
})

const loginRules = reactive({
  account: [{ required: true, message: '请输入账户', trigger: 'blur' }],
  passwordHash: [{ required: true, message: '请输入密码', trigger: 'blur' }],
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
  if (useSelfStore().token) {
    // 转向个人设置
    alert('已登录')
  } else {
    dialogFormVisible.value = true
  }
}

// 登录
const userAccount = ref<InstanceType<typeof ElForm>>()

const form = reactive({
  account: '',
  passwordHash: '',
})

function stringToBase64(str: string): string {
  // 1. 将字符串转为UTF-8编码的Uint8Array（处理非ASCII字符）
  const encoder = new TextEncoder() // 浏览器内置API，用于将字符串编码为UTF-8的Uint8Array
  const uint8Array = encoder.encode(str)

  // 2. 将Uint8Array转为二进制字符串（btoa需要的输入格式）
  const binaryStr = String.fromCharCode(...uint8Array)

  // 3. 用btoa转换为Base64
  return btoa(binaryStr)
}

async function login() {
  if (!userAccount.value) return
  userAccount.value.validate()
  const authString = `${form.account}:${form.passwordHash}`
  // 发送登录请求
  const response = await post<ApiResult<AuthorizationDTO>>(
    API_URLS.user.login,
    {},
    {
      headers: {
        Authorization: `Basic ${stringToBase64(authString)}`,
        'Content-Type': 'application/json',
      },
    },
  )

  const { token, user } = response.data

  const userStore = useSelfStore()
  userStore.setUserInfo(user, token)

  // 注册成功处理
  ElMessage.success('登录成功')
  window.location.reload()
}
</script>
