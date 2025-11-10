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

export interface OAuth2ClientInfo {
  clientId: string;
  scopes: string[];
  authorizationUri: string;
}

export enum GameType {
  GUESSING = '猜谜',
  CAIYAN_BAIKE = '猜盐-baike',
  UNKNOWN = '未知',
}
// 2. 安全获取枚举值：先验证变量是否为枚举的有效键
export function getGameTypeValueByKey(key: string): GameType {
  // 类型守卫：判断 key 是否在枚举的键中（排除数字枚举的反向映射）
  if (Object.prototype.hasOwnProperty.call(GameType, key)) {
    return GameType[key as keyof typeof GameType]; // 类型断言：key 是枚举的有效键
  }
  console.warn(`无效的枚举键：${key}`);
  return GameType.UNKNOWN;
}

/**
 * 游戏实体类
 * 对应后端 Game.java
 */
export interface Game {
  /**
   * 主键ID
   */
  id: number;

  /**
   * 游戏名称
   */
  name: string;

  // 提示
  prompt:string;
  /**
   * 游戏类型
   */
  type: GameType | string;

  /**
   * 游戏内容
   */
  content: string;

  /**
   * 游戏答案（仅用于前端提交，后端返回时可能不包含此字段）
   */
  answer?: string;

  /**
   * 创建者ID
   */
  creator: number;
  creatorName: string;

  /**
   * 创建时间
   */
  createdTime: string;

  /**
   * 修改者ID
   */
  modifier: number;

  /**
   * 更新时间
   */
  updatedTime: string;

  /**
   * 删除时间，NULL 表示未删除
   */
  deletedTime?: string;
}
