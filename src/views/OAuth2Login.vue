<script setup lang="ts">
import {onMounted} from 'vue'
import axios from 'axios'
import {useRoute} from 'vue-router';
import {storeToken} from "@/utils/auth.ts";

// 获取当前的路由对象
const route = useRoute();

const baseUrl = import.meta.env.VITE_BASE_URL


// 响应式数据


// 获取数据函数
async function getToken() {

  const p = route.query
  const registrationId = route.params.registrationId
  const response = await axios.post(baseUrl + `/oauth2Login/${registrationId}/register`, p.code, {
    headers: {
      "Content-Type": "text/plain"
    }
  })
  const token = response.data.data.token
  console.log(token)
  storeToken(token)

  window.location.href = window.location.origin

}

// 组件挂载后立即请求数据
onMounted(async () => {
  // backendVerify()
  // getToken()
  await getToken()
})
</script>

<template>

</template>

<style scoped>

</style>