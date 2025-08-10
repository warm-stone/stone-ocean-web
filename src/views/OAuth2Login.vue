<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRoute } from 'vue-router';

// 获取当前的路由对象
const route = useRoute();
console.log('fullPath:' +  route.fullPath)
console.log('path:'+ route.path)

const backendUrl = import.meta.env.BACKEND_URL
const protocol = import.meta.env.PROTOCOL_STR
// // 定义数据类型
// interface UserData {
//   id: number
//   name: string
//   email: string
// }

// 响应式数据
const userData = ref<object | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const response = ref<object | null>(null)

// 获取数据函数
const fetchData = async () => {
  try {
    const response = await axios.get<object>(protocol + '://'+ backendUrl + route.fullPath )
    userData.value = response.data
  } catch (err) {
    if (err instanceof Error) {
      error.value = `请求失败: ${err.message}`
    } else {
      error.value = '未知错误'
    }
  } finally {
    loading.value = false
  }
}

// 组件挂载后立即请求数据
onMounted(() => {
  fetchData()
  console.log(response)
})
</script>

<template>
 test
</template>

<style scoped>

</style>