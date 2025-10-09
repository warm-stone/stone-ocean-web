import { defineStore } from 'pinia'
import type { RankList } from '@/utils/interfaces.ts'

export const useRankListItem = defineStore('rankListItem', {
  state: () => ( {
   rankListItem :{} as RankList
  } ),
  // 计算属性
  getters: {
  },
  // 函数
  actions: {
    setRankListItem(item: RankList) {
      this.rankListItem = item
    }
  },
})
