import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { useGameStore } from './piniaCache.ts'
import type { RoomSnapshot } from '@/game/types.ts'
import { nextTick } from 'vue'

describe('useGameStore', () => {
  beforeEach(() => {
    localStorage.clear()
    const pinia = createPinia()
    pinia.use(piniaPluginPersistedstate)
    setActivePinia(pinia)
  })

  it('RoomJoinedEvent 更新 members + lastSeq', () => {
    const store = useGameStore()
    store.setRoom(1, 'PLAYER', 100)
    store.applyEvent({
      type: 'RoomJoinedEvent',
      seq: 1,
      ts: 't',
      userId: 200,
      role: 'HOST',
      members: [
        { userId: 100, role: 'PLAYER', online: true },
        { userId: 200, role: 'HOST', online: true },
      ],
    })
    expect(store.lastSeq).toBe(1)
    expect(store.members.length).toBe(2)
    // 自己 (100) 的 role 不被他人加入事件覆盖
    expect(store.myRole).toBe('PLAYER')
  })

  it('BidEvent decisive 更新 lastSeq + 底牌进公共区 + 进入 PLAYING', () => {
    const store = useGameStore()
    store.setRoom(1, 'PLAYER', 100)
    store.applyEvent({
      type: 'GameStartedEvent',
      seq: 2,
      ts: 't',
      hand: [{ rank: 3, suit: 'S' }],
      bottomCards: [],
    })
    store.applyEvent({
      type: 'BidEvent',
      seq: 3,
      ts: 't',
      playerId: 100,
      action: 'GRAB',
      decisive: true,
      landlordPlayerId: 100,
      revealedBottom: [
        { rank: 16, suit: null },
        { rank: 17, suit: null },
      ],
    })
    expect(store.lastSeq).toBe(3)
    expect(store.roomState).toBe('PLAYING')
    expect(store.publicArea?.bottomCards.length).toBe(2)
    expect(store.currentTurnPlayerId).toBe(100)
  })

  it('CardPlayedEvent 出牌更新 lastSeq + 公共区 lastPlays', () => {
    const store = useGameStore()
    store.setRoom(1, 'PLAYER', 100)
    store.applyEvent({
      type: 'BidEvent',
      seq: 1,
      ts: 't',
      playerId: 100,
      action: 'GRAB',
      decisive: true,
      landlordPlayerId: 100,
      revealedBottom: [],
    })
    store.applyEvent({
      type: 'CardPlayedEvent',
      seq: 2,
      ts: 't',
      playerId: 100,
      played: [{ rank: 3, suit: 'S' }],
      isPass: false,
      remainingCount: 16,
    })
    expect(store.lastSeq).toBe(2)
    expect(store.publicArea?.lastPlays.length).toBe(1)
    expect(store.publicArea?.lastPlays[0]!.isPass).toBe(false)
  })

  it('CardPlayedEvent isPass=true (过) 更新 lastSeq', () => {
    const store = useGameStore()
    store.setRoom(1, 'PLAYER', 100)
    store.applyEvent({
      type: 'BidEvent',
      seq: 1,
      ts: 't',
      playerId: 100,
      action: 'GRAB',
      decisive: true,
      landlordPlayerId: 100,
      revealedBottom: [],
    })
    store.applyEvent({
      type: 'CardPlayedEvent',
      seq: 2,
      ts: 't',
      playerId: 200,
      played: [],
      isPass: true,
      remainingCount: 10,
    })
    expect(store.lastSeq).toBe(2)
    expect(store.publicArea?.lastPlays[0]!.isPass).toBe(true)
  })

  it('applyEvent 始终更新 lastSeq (Heartbeat)', () => {
    const store = useGameStore()
    store.setRoom(1, 'PLAYER', 100)
    store.applyEvent({ type: 'HeartbeatEvent', seq: 42, ts: 't' })
    expect(store.lastSeq).toBe(42)
  })

  it('自己出牌时从 myHand 移除已出的牌', () => {
    const store = useGameStore()
    store.setRoom(1, 'PLAYER', 100)
    store.myHand = [
      { rank: 3, suit: 'S' },
      { rank: 3, suit: 'H' },
      { rank: 5, suit: 'S' },
    ]
    store.applyEvent({
      type: 'CardPlayedEvent',
      seq: 1,
      ts: 't',
      playerId: 100,
      played: [{ rank: 3, suit: 'S' }],
      isPass: false,
      remainingCount: 2,
    })
    expect(store.myHand?.length).toBe(2)
    expect(store.myHand?.some((c) => c.rank === 3 && c.suit === 'S')).toBe(false)
  })

  it('setSnapshot 重置 lastSeq 并恢复状态 (410 兜底全量恢复)', () => {
    const store = useGameStore()
    store.setRoom(1, 'PLAYER', 100)
    // 模拟断线前 lastSeq 落后/陈旧
    store.applyEvent({
      type: 'CardPlayedEvent',
      seq: 5,
      ts: 't',
      playerId: 2,
      played: [],
      isPass: true,
      remainingCount: 10,
    })
    expect(store.lastSeq).toBe(5)
    // 410 → 全量 snapshot 恢复
    const snap: RoomSnapshot = {
      view: {
        seq: 12,
        myHand: [{ rank: 3, suit: 'S' }],
        publicArea: { bottomCards: [], lastPlays: [], currentTurnPlayerId: 100 },
        currentTurnPlayerId: 100,
        state: 'PLAYING',
      },
      hostUserId: 200,
      members: [
        { userId: 100, role: 'PLAYER', online: true },
        { userId: 200, role: 'HOST', online: true },
      ],
      lastSeq: 12,
    }
    store.setSnapshot(snap)
    expect(store.lastSeq).toBe(12) // 重置
    expect(store.myHand?.length).toBe(1)
    expect(store.members.length).toBe(2)
    expect(store.hostUserId).toBe(200)
    expect(store.roomState).toBe('PLAYING')
    expect(store.publicArea?.currentTurnPlayerId).toBe(100)
  })

  it('clearRoom 清空房间状态但保留 transportPref', () => {
    const store = useGameStore()
    store.setRoom(1, 'PLAYER', 100)
    store.setTransportPref('sse')
    store.applyEvent({
      type: 'RoomJoinedEvent',
      seq: 1,
      ts: 't',
      userId: 100,
      role: 'PLAYER',
      members: [{ userId: 100, role: 'PLAYER', online: true }],
    })
    store.clearRoom()
    expect(store.currentRoomId).toBeNull()
    expect(store.members.length).toBe(0)
    expect(store.lastSeq).toBe(0)
    expect(store.myHand).toBeNull()
    expect(store.transportPref).toBe('sse') // 保留
  })

  it('persist 仅持久化 transportPref (不含房间状态)', async () => {
    const store = useGameStore()
    store.setRoom(1, 'PLAYER', 100)
    store.lastSeq = 9
    store.myHand = [{ rank: 3, suit: 'S' }]
    store.setTransportPref('sse')
    await nextTick()
    // setTransportPref 同步写 'game.transport' (TransportFactory 读取的偏好键)
    expect(localStorage.getItem('game.transport')).toBe('sse')
    // pinia persist (pick:['transportPref']) 异步写 'game-store'; 若写入须仅含 transportPref, 不含房间状态
    const raw = localStorage.getItem('game-store')
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, unknown>
      expect(parsed.transportPref).toBe('sse')
      expect(parsed.myHand).toBeUndefined()
      expect(parsed.lastSeq).toBeUndefined()
      expect(parsed.currentRoomId).toBeUndefined()
      expect(parsed.members).toBeUndefined()
    }
  })

  it('getters: isMyTurn / isHost / isSpectator / canBid', () => {
    const store = useGameStore()
    store.setRoom(1, 'PLAYER', 100)
    store.myUserId = 100
    store.currentTurnPlayerId = 100
    store.roomState = 'PLAYING'
    expect(store.isMyTurn).toBe(true)
    expect(store.isHost).toBe(false)
    expect(store.isSpectator).toBe(false)
    // PLAYING 不可 bid
    expect(store.canBid).toBe(false)
    store.roomState = 'BIDDING'
    expect(store.canBid).toBe(true)
  })

  it('canSwitchRole 仅 LOBBY/FINISHED', () => {
    const store = useGameStore()
    store.setRoom(1, 'PLAYER', 100)
    store.roomState = 'LOBBY'
    expect(store.canSwitchRole).toBe(true)
    store.roomState = 'PLAYING'
    expect(store.canSwitchRole).toBe(false)
    store.roomState = 'FINISHED'
    expect(store.canSwitchRole).toBe(true)
  })
})
