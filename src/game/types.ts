/**
 * 游戏特性第一期 wire 契约 TS 类型 (对齐后端 record, 逐字段一致)。
 * 依据: game-implementation-plan.md §0.5 + 后端只读路径
 *   stone-ocean/src/main/java/com/example/stoneocean/game/{engine,event,command,view}。
 *
 * - Card: { rank:int, suit:string|null } (joker suit=null)
 * - GameEvent/GameCommand: 后端 sealed interface + @JsonTypeInfo(property="type"),
 *   type 串 = 子 record 简单类名 (Jackson Id.NAME + sealed 自动发现, 无 @JsonTypeName)。
 * - ts: 后端 Instant, Spring Boot 默认序列化为 ISO-8601 字符串。
 */

/** 单张牌。rank: 3-13=3…K, 14=A, 15=2, 16=小王, 17=大王; joker(16/17) suit=null。 */
export interface Card {
  rank: number
  suit: string | null
}

/** 房间内角色 (MemberView.role / RoomJoinedEvent.role, 后端 String)。 */
export type Role = 'HOST' | 'PLAYER' | 'SPECTATOR'

/** 房间状态 (PerspectiveView.state, 后端 RoomState.name())。 */
export type RoomState = 'LOBBY' | 'BIDDING' | 'PLAYING' | 'FINISHED' | 'DISSOLVED'

/** 叫/抢地主动作 (BidEvent.action / BidCommand.action, 后端 BiddingPhase.BidAction 枚举名)。 */
export type BidAction = 'CALL' | 'NO_CALL' | 'GRAB' | 'NO_GRAB'

/** 房间可见性 (CreateRoomCommand.visibility, 后端 String)。 */
export type Visibility = 'PUBLIC' | 'PRIVATE'

/** 传输偏好 (localStorage 'game.transport')。 */
export type TransportPref = 'auto' | 'ws' | 'sse'

// ---------------------------------------------------------------------------
// view records
// ---------------------------------------------------------------------------

/** wire: { userId, role, online } */
export interface MemberView {
  userId: number
  role: string
  online: boolean
}

/** wire: { playerId, cards, isPass } (PublicArea.lastPlays 元素) */
export interface PlayRecord {
  playerId: number
  cards: Card[]
  isPass: boolean
}

/** wire: { bottomCards, lastPlays:PlayRecord[], currentTurnPlayerId } */
export interface PublicArea {
  bottomCards: Card[]
  lastPlays: PlayRecord[]
  currentTurnPlayerId: number
}

/** wire: { seq, myHand:Card[], publicArea:PublicArea, currentTurnPlayerId, state } */
export interface PerspectiveView {
  seq: number
  myHand: Card[]
  publicArea: PublicArea
  currentTurnPlayerId: number
  state: string
}

/**
 * snapshot 端点返回 (v1.1, RoomController.SnapshotDTO):
 * { view:PerspectiveView, hostUserId, members:MemberView[], lastSeq }。
 * (后端为包装结构, 非扁平化 PerspectiveView。)
 */
export interface RoomSnapshot {
  view: PerspectiveView
  hostUserId: number
  members: MemberView[]
  lastSeq: number
}

// ---------------------------------------------------------------------------
// GameEvent (下行, 判别字段 type)
// ---------------------------------------------------------------------------

export interface GameEventBase {
  seq: number
  ts: string
}

/** wire: { userId, role, members:MemberView[] } */
export interface RoomJoinedEvent extends GameEventBase {
  type: 'RoomJoinedEvent'
  userId: number
  role: string
  members: MemberView[]
}

/** wire: { userId, newRole } */
export interface RoleChangedEvent extends GameEventBase {
  type: 'RoleChangedEvent'
  userId: number
  newRole: string
}

/** wire: { hand:Card[](仅自己/spectator 空), bottomCards:Card[](未亮前空) } */
export interface GameStartedEvent extends GameEventBase {
  type: 'GameStartedEvent'
  hand: Card[]
  bottomCards: Card[]
}

/** wire (v1.1): { playerId, action, decisive, landlordPlayerId, revealedBottom:Card[] } */
export interface BidEvent extends GameEventBase {
  type: 'BidEvent'
  playerId: number
  action: BidAction
  decisive: boolean
  landlordPlayerId: number
  revealedBottom: Card[]
}

/** wire: { playerId, played:Card[], isPass, remainingCount(仅本人/他人剥离) } */
export interface CardPlayedEvent extends GameEventBase {
  type: 'CardPlayedEvent'
  playerId: number
  played: Card[]
  isPass: boolean
  remainingCount: number
}

/** wire: { playerId, defaultedAction:"PASS" } */
export interface TurnTimeoutEvent extends GameEventBase {
  type: 'TurnTimeoutEvent'
  playerId: number
  defaultedAction: string
}

/** wire: { newHostUserId, previousHostUserId } */
export interface HostChangedEvent extends GameEventBase {
  type: 'HostChangedEvent'
  newHostUserId: number
  previousHostUserId: number
}

/** wire: { reason } */
export interface RoomDissolvedEvent extends GameEventBase {
  type: 'RoomDissolvedEvent'
  reason: string
}

/** wire: { view:PerspectiveView } */
export interface SpectatorViewEvent extends GameEventBase {
  type: 'SpectatorViewEvent'
  view: PerspectiveView
}

/** wire: {} (仅基类 type/seq/ts) */
export interface HeartbeatEvent extends GameEventBase {
  type: 'HeartbeatEvent'
}

export type GameEvent =
  | RoomJoinedEvent
  | RoleChangedEvent
  | GameStartedEvent
  | BidEvent
  | CardPlayedEvent
  | TurnTimeoutEvent
  | HostChangedEvent
  | RoomDissolvedEvent
  | SpectatorViewEvent
  | HeartbeatEvent

/** 所有 GameEvent type 串 (供 SSE addEventListener 注册). */
export const GAME_EVENT_TYPES = [
  'RoomJoinedEvent',
  'RoleChangedEvent',
  'GameStartedEvent',
  'BidEvent',
  'CardPlayedEvent',
  'TurnTimeoutEvent',
  'HostChangedEvent',
  'RoomDissolvedEvent',
  'SpectatorViewEvent',
  'HeartbeatEvent',
] as const

export type GameEventType = (typeof GAME_EVENT_TYPES)[number]

// ---------------------------------------------------------------------------
// GameCommand (上行, 判别字段 type; 基字段 clientRequestId/userId)
// ---------------------------------------------------------------------------

export interface GameCommandBase {
  clientRequestId: string
  userId: number
}

/** wire: { name, visibility, password?, maxPlayers } */
export interface CreateRoomCommand extends GameCommandBase {
  type: 'CreateRoomCommand'
  name: string
  visibility: string
  password: string | null
  maxPlayers: number
}

/** wire: { role, password?, inviteCode? } */
export interface JoinRoomCommand extends GameCommandBase {
  type: 'JoinRoomCommand'
  role: string
  password: string | null
  inviteCode: string | null
}

/** wire: { targetRole } */
export interface SwitchRoleCommand extends GameCommandBase {
  type: 'SwitchRoleCommand'
  targetRole: string
}

/** wire: {} (仅基类字段) */
export interface StartGameCommand extends GameCommandBase {
  type: 'StartGameCommand'
}

/** wire (v1.1): { action:"CALL"|"NO_CALL"|"GRAB"|"NO_GRAB" } */
export interface BidCommand extends GameCommandBase {
  type: 'BidCommand'
  action: BidAction
}

/** wire: { cards:Card[] } */
export interface PlayCardCommand extends GameCommandBase {
  type: 'PlayCardCommand'
  cards: Card[]
}

/** wire: {} (仅基类字段) */
export interface PassCommand extends GameCommandBase {
  type: 'PassCommand'
}

/** wire: {} (仅基类字段) */
export interface LeaveRoomCommand extends GameCommandBase {
  type: 'LeaveRoomCommand'
}

/** wire: { targetUserId } */
export interface TransferHostCommand extends GameCommandBase {
  type: 'TransferHostCommand'
  targetUserId: number
}

/** wire: { targetUserId } */
export interface KickCommand extends GameCommandBase {
  type: 'KickCommand'
  targetUserId: number
}

/** wire: {} (仅基类字段) */
export interface DissolveCommand extends GameCommandBase {
  type: 'DissolveCommand'
}

export type GameCommand =
  | CreateRoomCommand
  | JoinRoomCommand
  | SwitchRoleCommand
  | StartGameCommand
  | BidCommand
  | PlayCardCommand
  | PassCommand
  | LeaveRoomCommand
  | TransferHostCommand
  | KickCommand
  | DissolveCommand

/** 所有 GameCommand type 串。 */
export const GAME_COMMAND_TYPES = [
  'CreateRoomCommand',
  'JoinRoomCommand',
  'SwitchRoleCommand',
  'StartGameCommand',
  'BidCommand',
  'PlayCardCommand',
  'PassCommand',
  'LeaveRoomCommand',
  'TransferHostCommand',
  'KickCommand',
  'DissolveCommand',
] as const
