import { defineStore } from 'pinia'
import type { User } from '@/utils/interfaces.ts'

const StoreId = {
  SelfInfo: 'self-info-store',
  UsersCache: 'users-cache-store',
} as const

export const useSelfStore = defineStore(StoreId.SelfInfo, {
  state: () => ({
    // 初始化为 null，表示未登录状态，类型更安全
    user: null as User | null,
    token: null as string | null,
  }),
  // 计算属性
  getters: {},
  // 移除冗余 getter（直接访问 store.user 即可）
  actions: {
    // 设置用户信息（登录时）
    setUser(user: User) {
      this.user = user
    },
    setToken(token: string) {
      this.token = token
    },
    setUserInfo(user: User, token: string) {
      this.user = user
      this.token = token
    },
    // 新增：清除用户信息（退出登录时）
    clearUserInfo() {
      this.user = null
      this.token = null
    },
  },
  persist: true,
})

export const useUserCacheStore = () => defineStore(StoreId.UsersCache, {
  state: () => ({}),
  getters: {},
  actions: {
  },
  persist: {
    storage: sessionStorage,
  },
})
