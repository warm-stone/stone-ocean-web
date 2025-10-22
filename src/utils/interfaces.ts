export interface User {
  id?: number;
  account: string;
  passwordHash: string;
  email?: string;
  phone?: string;
  nickname: string;
  sex?: string;
  des?: string;
  avatarUrl?: string;
  createdTime?: Date;
  updatedTime?: Date;
  deletedTime?: Date | null;
}

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
  // id
  id: number
  // 标题
  title: string
  // 描述
  description: string
  // 头像
  coverUrl: string
  // 赞同举动名称 可为空
  agreeName: string
  // 反对举动名称 可为空
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

export interface ApiResult<T> {
  statusCode: number,
  message: string,
  data: T
}

export interface AuthorizationDTO {
  token: string
  user: User
}

export interface VoteRecordSumDTO {
  creator:number,
  voteCount: number
}
