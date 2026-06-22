// api/client.ts
import axios, { AxiosError, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'
import { useSelfStore } from '@/utils/piniaCache.ts'

export const API_IMG_URL = (url: string) => {
  return API_BASE_URL + API_URLS.file.load(url)
}
// 1. 集中管理可请求的URL（基础URL + 接口路径）
export const API_BASE_URL = import.meta.env.VITE_BASE_URL

export const API_URLS = {
  // 示例接口路径，根据实际需求修改
  file: {
    load: (img: string) => `/file/load/${img}`,
    upload: '/file/upload',
  },
  oauth2Login: {
    code: (registrationId: string) => `/oauth2Login/${registrationId}/code`,
    register: (registrationId: string) => `/oauth2Login/${registrationId}/register`,
  },
  auth: {
    login: '/auth/login',
  },
  token: {
    refresh: '/token/token',
    logout: '/token/logout',
  },
  user: {
    add: '/user/add',
    self_info: '/user/selfInfo',
    modify: '/user/modify',
    member: (userId: string | number) => `/user/member/${userId}`,
  },
  rankList: {
    member: (id: string | number) => `/rankList/member/${id}`,
    add: '/rankList/add',
    page: (page: string | number, size: string | number) =>
      `/rankList/page?page=${page}&size=${size}`,
  },
  rankMember: {
    add: '/rankMember/add',
    member: (id: string | number) => `/rankMember/member/${id}`,
    subMember: (id: string | number) => `/rankMember/subMember/${id}`,
  },
  vote: {
    statistics: (rankMemberId: string | number) =>
      `/voteRecord/statistic/rankMemberId/${rankMemberId}`,
    vote: '/voteRecord/vote',
  },
  biographic: {
    get: (id: string | number) => `/biographic/get/${id}`,
  },

}

// 创建axios实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 超时时间
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器：添加token
apiClient.interceptors.request.use(
  (config) => {
    let authFlag: boolean
    if ('userAuth' in config) {
      authFlag = config.userAuth as boolean
    } else {
      authFlag = config.method == 'post'
    }
    if (authFlag && useSelfStore().token) {
      config.headers.Authorization = `Bearer ${useSelfStore().token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// 令牌刷新状态：防止并发刷新与刷新死循环
let isRefreshing = false
let refreshQueue: Array<(token: string | null, error?: unknown) => void> = []

const flushRefreshQueue = (token: string | null, error?: unknown) => {
  refreshQueue.forEach((cb) => cb(token, error))
  refreshQueue = []
}

// 3. 基础错误处理（响应拦截器）
apiClient.interceptors.response.use(
  (response) => {
    if (response.data.statusCode != 200) {
      ElMessage.error(response.data.message)
      throw response
    }
    return response
  },
  (error: AxiosError) => {
    const originalRequest = error.config as
      | (AxiosRequestConfig & { _isRefresh?: boolean; _retried?: boolean })
      | undefined

    // 401：尝试用当前令牌刷新，成功后重放原请求
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._isRefresh &&
      !originalRequest._retried
    ) {
      const store = useSelfStore()

      // 无可用令牌，无法刷新
      if (!store.token) {
        store.clearUserInfo()
        ElMessage.error('登录已过期，请重新登录')
        return Promise.reject(new Error('登录已过期，请重新登录'))
      }

      // 已有刷新进行中：排队等待刷新完成后重放
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push((token, err) => {
            if (err || !token) {
              reject(err || new Error('登录已过期，请重新登录'))
              return
            }
            originalRequest._retried = true
            resolve(apiClient(originalRequest))
          })
        })
      }

      // 发起刷新：标记本次请求，刷新请求自身 401 不再触发刷新
      originalRequest._retried = true
      isRefreshing = true
      return apiClient
        .post(API_URLS.token.refresh, undefined, { _isRefresh: true } as AxiosRequestConfig)
        .then((res) => {
          const newToken: string | undefined = res.data?.data
          if (!newToken) throw new Error('刷新令牌失败')
          store.setToken(newToken)
          flushRefreshQueue(newToken)
          // 重放原请求：request 拦截器会用 store 里的新令牌自动附上 Authorization
          return apiClient(originalRequest)
        })
        .catch((err) => {
          flushRefreshQueue(null, err)
          store.clearUserInfo()
          ElMessage.error('登录已过期，请重新登录')
          return Promise.reject(new Error('登录已过期，请重新登录'))
        })
        .finally(() => {
          isRefreshing = false
        })
    }

    // 不可刷新的错误：沿用原有处理
    let errorMessage = '请求失败，请稍后重试'
    if (error.response) {
      const { status } = error.response
      switch (status) {
        case 401:
          errorMessage = '鉴权错误，请登录'
          useSelfStore().clearUserInfo()
          break
        case 403:
          errorMessage = '没有权限访问该资源'
          break
        case 404:
          errorMessage = '请求的资源不存在'
          break
        case 500:
          errorMessage = '服务器内部错误'
          break
        default:
          errorMessage = `请求错误 (${status})`
      }
    } else if (error.request) {
      errorMessage = '网络连接失败，请检查网络'
    }
    console.error('[API Error]', errorMessage, error)
    ElMessage.error(errorMessage)
    return Promise.reject(new Error(errorMessage))
  },
)

// 5. 暴露get和post请求方法
/**
 * GET请求
 * @param url 接口路径
 * @param config 额外配置
 */
export const get = async <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  const response: AxiosResponse<T> = await apiClient.get(url, config)
  return response.data
}

/**
 * POST请求
 * @param url 接口路径
 * @param data 请求体数据
 * @param config 额外配置
 */
export const post = async <T = unknown>(
  url: string,
  data?: unknown,
  config?: Record<string | number | symbol, object | boolean | string>,
): Promise<T> => {
  const response: AxiosResponse<T> = await apiClient.post(url, data, config)
  return response.data
}

// 导出实例（如需使用更多axios功能）
export default apiClient
