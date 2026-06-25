import { computed } from 'vue'
import { ElMessage } from 'element-plus'
import { API_BASE_URL, API_URLS } from '@/utils/network.ts'
import type { ApiResult } from '@/utils/interfaces.ts'
import { useSelfStore } from '@/utils/piniaCache.ts'

export function useFileUpload(onSuccess: (fileUrl: string) => void) {
  const userStore = useSelfStore()

  const uploadAction = API_BASE_URL + API_URLS.file.upload

  const uploadHeaders = computed(() => ({
    Authorization: `Bearer ${userStore.token}`,
  }))

  const handleAvatarSuccess = (response: ApiResult<string>) => {
    if (response.statusCode === 200 && response.data) {
      onSuccess(response.data)
      ElMessage.success('图片上传成功')
    } else {
      ElMessage.error('图片上传失败：' + (response.message || '未知错误'))
    }
  }

  const beforeAvatarUpload = (rawFile: File) => {
    const isJpgOrPng =
      rawFile.type === 'image/jpeg' ||
      rawFile.type === 'image/png' ||
      rawFile.type === 'image/svg+xml'
    if (!isJpgOrPng) {
      ElMessage.error('只能上传JPG/PNG/SVG格式的图片')
      return false
    }
    const isLt = rawFile.size / 1024 / 1024 < 1
    if (!isLt) {
      ElMessage.error('图片大小不能超过 1 MB')
      return false
    }
    if (!userStore.token) {
      ElMessage.error('请先登录')
      return false
    }
    return true
  }

  const handleUploadError = (err: Error) => {
    ElMessage.error('上传失败: ' + (err.message || '未知错误'))
  }

  return {
    uploadAction,
    uploadHeaders,
    handleAvatarSuccess,
    beforeAvatarUpload,
    handleUploadError,
  }
}
