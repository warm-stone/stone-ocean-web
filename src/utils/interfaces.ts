export interface RankMember {
  id: number
  rankListId: number
  parentId: number
  createUserId: number
  scoreSum: number
  scoreCalculate: number
  name: string
  description: string
  coverUrl: string
  creator: number
  creatorName: string
  createdTime: string
}

export interface RankList {
  id: number
  title: string
  description: string
  coverUrl: string
  agreeName: string
  disagreeName: string
  creator: number
  createdTime: string
}

export interface VoteRecord {
  id: number
  rankMemberId: number
  voteCount: number
  creator: number
  createdTime: string
}

export interface PageResult<T> {
  page: number // 当前页码
  size: number // 每页条数
  total: number
  records: T[] // 列表数据，类型为 T 的数组
}
