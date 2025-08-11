<script setup lang="ts">
import {onMounted, ref} from 'vue'
import axios from 'axios'
import {useRoute} from 'vue-router';

// 获取当前的路由对象
const route = useRoute();
console.log('fullPath:' +  route.fullPath)
console.log('path:'+ route.path)

const backendUrl = import.meta.env.VITE_BACKEND_URL
const protocol = import.meta.env.VITE_PROTOCOL_STR
// // 定义数据类型
// interface UserData {
//   id: number
//   name: string
//   email: string
// }

// 响应式数据
const verifiedRet = ref<object | null>(null)
const token = ref<object | null>(null)

// 获取数据函数
async  function  backendVerify() {
  try {

    const response = (await  axios.get(`protocol + '://' + backendUrl + route.fullPath`, { withCredentials: true}))
    verifiedRet.value = response.data
  }
  catch(err: any) {
    console.error('验证失败:', err.message)
  }
}
// 获取数据函数
async function getToken() {
  token.value = (await axios.get(protocol + '://' + backendUrl + '/token/token')).data
}

// 组件挂载后立即请求数据
onMounted(async  () => {
  console.log('后端认证地址：' + protocol + '://' + backendUrl + route.fullPath)
  // backendVerify()
  // getToken()
  await Promise.all([backendVerify(), getToken()]);
  console.log(verifiedRet.value)
  console.log(token.value)
})
</script>

<template>
 test
</template>

<style scoped>

</style>