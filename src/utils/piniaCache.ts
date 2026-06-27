import { defineStore } from 'pinia'
import type { User } from '@/utils/interfaces.ts'
import type {
  Card,
  GameEvent,
  MemberView,
  PlayRecord,
  PublicArea,
  Role,
  RoomSnapshot,
  RoomState,
  TransportPref,
} from '@/game/types.ts'

const StoreId = {
  SelfInfo: 'self-info-store',
  UsersCache: 'users-cache-store',
  Game: 'game-store',
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

export const useUserCacheStore = defineStore(StoreId.UsersCache, {
  state: () => ({
    userRecord: {} as Record<number, User>,
  }),
  getters: {
    getByUserId(): (userId: number) => User | undefined {
      // 使用箭头函数确保 this 指向正确
      return (userId: number) => this.userRecord[userId]
    },
  },
  actions: {
    // 新增/更新用户
    setUser(userId: number, user: User) {
      this.userRecord[userId] = user
    },
    // 删除单个用户
    removeUser(userId: number) {
      delete this.userRecord[userId]
    },
    // 清空所有缓存
    clearAll() {
      this.userRecord = {}
    },
  },
  persist: {
    storage: sessionStorage,
  },
})

// ---------------------------------------------------------------------------
// 游戏特性第一期 useGameStore (设计 §4.3 / plan §6.4)
// Options API 与 useSelfStore 一致; persist 仅 transportPref (房间状态内存态, 不持久化)。
// ---------------------------------------------------------------------------
export const useGameStore = defineStore(StoreId.Game, {
  state: () => ({
    // 当前房间
    currentRoomId: null as number | null,
    members: [] as MemberView[],
    hostUserId: null as number | null,
    roomState: null as RoomState | null,
    // 自己
    myUserId: null as number | null,
    myRole: null as Role | null,
    myHand: null as Card[] | null, // 观战者始终 null
    // 公共区 / 回合
    publicArea: null as PublicArea | null,
    currentTurnPlayerId: null as number | null,
    // 重连协商
    lastSeq: 0,
    // 传输偏好 (持久化)
    transportPref: 'auto' as TransportPref,
  }),
  getters: {
    isMyTurn(): boolean {
      return this.currentTurnPlayerId != null && this.myUserId != null && this.currentTurnPlayerId === this.myUserId
    },
    isHost(): boolean {
      return this.myRole === 'HOST'
    },
    isSpectator(): boolean {
      return this.myRole === 'SPECTATOR'
    },
    canBid(): boolean {
      return this.roomState === 'BIDDING' && this.isMyTurn
    },
    /** 角色切换仅游戏前/后 (设计 §4.2 Room.vue)。 */
    canSwitchRole(): boolean {
      return this.roomState === 'LOBBY' || this.roomState === 'FINISHED'
    },
  },
  actions: {
    setRoom(roomId: number, myRole: Role, myUserId: number) {
      this.currentRoomId = roomId
      this.myRole = myRole
      this.myUserId = myUserId
    },
    /** 全量快照恢复 (v1.1 snapshot 端点 / 410 兜底): 重置 lastSeq 并还原状态。 */
    setSnapshot(snap: RoomSnapshot) {
      const v = snap.view
      this.myHand = this.isSpectator ? null : v.myHand && v.myHand.length ? Array.from(v.myHand) : (this.myHand ?? [])
      this.publicArea = v.publicArea
      this.currentTurnPlayerId = v.currentTurnPlayerId
      this.roomState = v.state as RoomState
      this.members = Array.from(snap.members)
      this.hostUserId = snap.hostUserId
      // 重置 lastSeq: 优先 snapshot.lastSeq, 回退 PerspectiveView.seq
      this.lastSeq = typeof snap.lastSeq === 'number' ? snap.lastSeq : v.seq
    },
    /** 应用一条下行事件: 更新 lastSeq + 派发状态变更 (设计 §4.3)。 */
    applyEvent(e: GameEvent) {
      this.lastSeq = e.seq
      switch (e.type) {
        case 'RoomJoinedEvent':
          this.members = Array.from(e.members)
          if (this.myUserId != null && e.userId === this.myUserId) {
            this.myRole = e.role as Role
          }
          break
        case 'RoleChangedEvent': {
          this.members = this.members.map((m) =>
            m.userId === e.userId ? { ...m, role: e.newRole } : m,
          )
          if (this.myUserId != null && e.userId === this.myUserId) {
            this.myRole = e.newRole as Role
          }
          break
        }
        case 'GameStartedEvent':
          this.roomState = 'BIDDING'
          this.myHand = this.isSpectator
            ? null
            : e.hand && e.hand.length ? Array.from(e.hand) : (this.myHand ?? [])
          break
        case 'BidEvent':
          // decisive 时决出地主, 亮明底牌进入公共区, 进入 PLAYING
          if (e.decisive) {
            this.roomState = 'PLAYING'
            this.currentTurnPlayerId = e.landlordPlayerId
            const bottom = e.revealedBottom && e.revealedBottom.length ? Array.from(e.revealedBottom) : []
            this.publicArea = this.publicArea
              ? { ...this.publicArea, bottomCards: bottom, currentTurnPlayerId: e.landlordPlayerId }
              : { bottomCards: bottom, lastPlays: [], currentTurnPlayerId: e.landlordPlayerId }
          }
          break
        case 'CardPlayedEvent': {
          const rec: PlayRecord = { playerId: e.playerId, cards: Array.from(e.played), isPass: e.isPass }
          if (this.publicArea) {
            this.publicArea = {
              ...this.publicArea,
              lastPlays: [...this.publicArea.lastPlays, rec],
              currentTurnPlayerId: e.playerId,
            }
          } else {
            this.publicArea = { bottomCards: [], lastPlays: [rec], currentTurnPlayerId: e.playerId }
          }
          // 自己出牌: 从手牌移除已出的牌 (按 rank+suit 匹配)
          if (this.myUserId != null && e.playerId === this.myUserId && this.myHand && !e.isPass) {
            this.myHand = removeCards(this.myHand, e.played)
          }
          break
        }
        case 'TurnTimeoutEvent':
          // 超时默认 PASS: 在公共区追加一条 pass 记录, 回合轮转由后续事件驱动
          if (this.publicArea) {
            this.publicArea = {
              ...this.publicArea,
              lastPlays: [
                ...this.publicArea.lastPlays,
                { playerId: e.playerId, cards: [], isPass: true },
              ],
            }
          }
          break
        case 'HostChangedEvent':
          this.hostUserId = e.newHostUserId
          break
        case 'RoomDissolvedEvent':
          this.roomState = 'DISSOLVED'
          break
        case 'SpectatorViewEvent': {
          const v = e.view
          this.myHand = this.isSpectator ? null : v.myHand && v.myHand.length ? Array.from(v.myHand) : (this.myHand ?? [])
          this.publicArea = v.publicArea
          this.currentTurnPlayerId = v.currentTurnPlayerId
          this.roomState = v.state as RoomState
          break
        }
        case 'HeartbeatEvent':
          // 心跳: 仅维护 lastSeq, 无状态变更
          break
      }
    },
    /** 离开/解散时清空房间状态 (保留 transportPref)。 */
    clearRoom() {
      this.currentRoomId = null
      this.members = []
      this.hostUserId = null
      this.roomState = null
      this.myUserId = null
      this.myRole = null
      this.myHand = null
      this.publicArea = null
      this.currentTurnPlayerId = null
      this.lastSeq = 0
    },
    /** 设置传输偏好 (同步 localStorage 'game.transport')。 */
    setTransportPref(p: TransportPref) {
      this.transportPref = p
      try {
        window.localStorage.setItem('game.transport', p)
      } catch {
        /* ignore storage errors */
      }
    },
  },
  persist: {
    storage: localStorage,
    pick: ['transportPref'],
  },
})

/** 从 myHand 中移除 played 中的牌 (按 rank+suit 等价匹配, 逐张消除)。 */
function removeCards(hand: Card[], played: Card[]): Card[] {
  const used = new Array<boolean>(hand.length).fill(false)
  for (const p of played) {
    const idx = hand.findIndex((c, i) => !used[i] && cardEquals(c, p))
    if (idx >= 0) used[idx] = true
  }
  return hand.filter((_, i) => !used[i])
}

function cardEquals(a: Card, b: Card): boolean {
  return a.rank === b.rank && (a.suit ?? null) === (b.suit ?? null)
}
