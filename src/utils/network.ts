// api/client.ts
import axios, { AxiosError, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'
import { useSelfStore } from '@/utils/piniaCache.ts'


// 1. 集中管理可请求的URL（基础URL + 接口路径）
export const API_BASE_URL = import.meta.env.VITE_BASE_URL;

export const API_URLS = {
  // 示例接口路径，根据实际需求修改
  file: {
    lode: (img: string) => `/file/load/${img}`,
    upload: '/file/upload',
  },
  oauth2Login: {
    code: (registrationId: string) => `/oauth2Login/${registrationId}/code`,
    register: (registrationId: string) => `/oauth2Login/${registrationId}/register`
  },
  user: {
    add: '/user/add',
    self_info: '/user/selfInfo',
    login: '/user/login',
  },
  rankList: {
    member: (id: string | number) => `/rankList/member/${id}`,
    add: '/rankList/add',
    page: '/rankList/page',
  },
  rankMember: {
    add: '/rankMember/add',
    memberById: (id: string | number) => `/rankMember/member/${id}`,
    subMemberById: (id: string | number) => `/rankMember/subMember/${id}`,
  },
  vote: {
    statistics: (rankMemberId: string | number) => `/voteRecord/statistic/rankMemberId/${rankMemberId}`,
    vote: '/voteRecord/vote'
  }
};

// 创建axios实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 超时时间
  headers: {
    'Content-Type': 'application/json',
  },
});



// 请求拦截器：添加token
apiClient.interceptors.request.use(
  (config) => {
    let authFlag: boolean
    if ('userAuth' in config) {
      authFlag = config.userAuth as boolean
    }
    else {
      authFlag = config.method == 'post'
    }
    if (authFlag && useSelfStore().token) {
      config.headers.Authorization = `Bearer ${useSelfStore().token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 3. 基础错误处理（响应拦截器）
apiClient.interceptors.response.use(
  (response) => {
    if (response.data.statusCode != 200) {
      ElMessage.error(response.data.message);
      throw response;
    }
    return response
  },
  (error: AxiosError) => {
    // 4. 错误提示
    let errorMessage = '请求失败，请稍后重试';

    if (error.response) {
      // 服务器返回错误
      const { status } = error.response;
      switch (status) {
        case 401:
          errorMessage = '登录已过期，请重新登录';
          // 清除无效token
          useSelfStore().clearUserInfo()
          // 可添加跳转登录页逻辑：window.location.href = '/login'
          break;
        case 403:
          errorMessage = '没有权限访问该资源';
          break;
        case 404:
          errorMessage = '请求的资源不存在';
          break;
        case 500:
          errorMessage = '服务器内部错误';
          break;
        default:
          errorMessage = `请求错误 (${status})`;
      }
    } else if (error.request) {
      // 网络错误（无响应）
      errorMessage = '网络连接失败，请检查网络';
    }

    // 输出错误信息（可替换为UI提示，如Toast）
    console.error('[API Error]', errorMessage, error);
    ElMessage.error(errorMessage)
    return Promise.reject(new Error(errorMessage));
  }
);

// 5. 暴露get和post请求方法
/**
 * GET请求
 * @param url 接口路径
 * @param config 额外配置
 */
export const get = async <T = unknown>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> => {
  const response: AxiosResponse<T> = await apiClient.get(url, config);
  return response.data;
};

/**
 * POST请求
 * @param url 接口路径
 * @param data 请求体数据
 * @param config 额外配置
 */
export const post = async <T = unknown>(
  url: string,
  data?: unknown,
  config?: Record< string | number | symbol, object | boolean | string>
): Promise<T> => {
  const response: AxiosResponse<T> = await apiClient.post(url, data, config);
  return response.data;
};

// 导出实例（如需使用更多axios功能）
export default apiClient;
