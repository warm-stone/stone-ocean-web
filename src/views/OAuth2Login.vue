<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { storeToken } from '@/utils/auth.ts'
import { API_URLS, post } from '@/utils/network.ts'
import type { ApiResult } from '@/utils/interfaces.ts'

// 获取当前的路由对象
const route = useRoute()

// 响应式数据

// 获取数据函数
async function getToken() {
  const p = route.query

  const registrationId = route.params.registrationId as string
  const response = await post<ApiResult<string>>(
    API_URLS.oauth2Login.register(registrationId),
    p.code,
    {
      headers: {
        'Content-Type': 'text/plain',
      },
      userAuth: false,
    },
  )
  const token = response.data
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

<style scoped></style>
