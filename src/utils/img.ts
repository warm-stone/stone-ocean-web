// src/utils/requestImg.js
import axios from 'axios';
import { ElMessage } from 'element-plus'
import { useSelfStore } from '@/utils/piniaCache.ts'

// 用 axios 发送带 Token 的请求获取图片 blob
export const getAuthImageBlob = async (imgUrl: string) => {
  if (!imgUrl) {
    return null
  }
  try {

    const response = await axios.get(imgUrl, {
      responseType: 'blob', // 关键：指定响应类型为 blob
    });
    return response.data; // 返回 blob 数据
  } catch (error) {
    console.error('图片请求失败：', error);
    return null; // 失败时返回 null，后续显示默认图
  }
};

// 图片上传错误处理
export const handleUploadError = (err: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
                                          // 常见错误：token过期/无效
  if (err.status === 401) {
    useSelfStore().clearUserInfo()
    ElMessage.error('认证失败，请重新登录')
    // 可在此处添加跳转登录页逻辑
  } else {
    ElMessage.error('上传失败，请稍后重试')
  }
}
export const beforeAvatarUpload = (file: File) => {
  const isJpgOrPng =
    file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/gif' || file.type === 'image/svg+xml'
  const isLt1M = file.size / 1024 / 1024 < 1

  if (!isJpgOrPng) {
    ElMessage.error('只能上传JPG/PNG/SVG/GIF格式的图片')
    return false
  }
  if (!isLt1M) {
    ElMessage.error('图片大小不能超过1MB')
    return false
  }
  return true
}
