import { useUserCacheStore } from '@/utils/piniaCache.ts'
import { API_IMG_URL, API_URLS, post } from '@/utils/network.ts'
import type { ApiResult, User } from '@/utils/interfaces.ts'

const userCacheStore = useUserCacheStore()

export const getByUserId = async (userId: number) => {
  let userInfo = userCacheStore.getByUserId(userId)

  // 缓存中无用户信息，先请求用户数据
  if (!userInfo) {
    const response = await post<ApiResult<User>>(API_URLS.user.member(userId))
    userInfo = response.data
    userCacheStore.setUser(userId, userInfo)
    if (userInfo) {
      // 处理头像URL
      if (!userInfo.avatarUrl) {
        userInfo.avatarUrl = undefined
      }
      else {
        userInfo.avatarUrl = userInfo.avatarUrl.startsWith('http')
          ? userInfo.avatarUrl
          : API_IMG_URL(userInfo.avatarUrl)
      }
    }
  }

  return userInfo
}
