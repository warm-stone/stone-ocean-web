import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import DouDizhuTable from './DouDizhuTable.vue'
import { useGameStore } from '@/utils/piniaCache.ts'
import type { Card } from '@/game/types.ts'

describe('DouDizhuTable', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('观战者 prop 下不渲染手牌组件 (myHand 隐藏)', () => {
    const store = useGameStore()
    // 即便 store 是玩家且有手牌, prop spectator 覆盖为观战 → 不渲染 my-hand
    store.setRoom(1, 'PLAYER', 100)
    store.myHand = [{ rank: 3, suit: 'S' } as Card]
    const wrapper = mount(DouDizhuTable, { props: { spectator: true } })
    expect(wrapper.find('[data-testid="my-hand"]').exists()).toBe(false)
  })

  it('store.isSpectator 为 true 时也不渲染手牌组件', () => {
    const store = useGameStore()
    store.setRoom(1, 'SPECTATOR', 100)
    const wrapper = mount(DouDizhuTable, { props: { spectator: false } })
    expect(wrapper.find('[data-testid="my-hand"]').exists()).toBe(false)
  })

  it('非观战者且有手牌时渲染手牌组件', () => {
    const store = useGameStore()
    store.setRoom(1, 'PLAYER', 100)
    store.myHand = [{ rank: 3, suit: 'S' } as Card]
    const wrapper = mount(DouDizhuTable, { props: { spectator: false } })
    expect(wrapper.find('[data-testid="my-hand"]').exists()).toBe(true)
  })

  it('观战者仍渲染公共区', () => {
    const store = useGameStore()
    store.setRoom(1, 'SPECTATOR', 100)
    const wrapper = mount(DouDizhuTable, { props: { spectator: true } })
    expect(wrapper.find('[data-testid="public-area"]').exists()).toBe(true)
  })

  it('canBid (BIDDING 且自己叫手) 时渲染 bid 面板 (CALL/NO_CALL/GRAB/NO_GRAB)', () => {
    const store = useGameStore()
    store.setRoom(1, 'PLAYER', 100)
    store.myUserId = 100
    store.currentTurnPlayerId = 100
    store.roomState = 'BIDDING'
    const wrapper = mount(DouDizhuTable, { props: { spectator: false } })
    const bid = wrapper.find('[data-testid="bid-panel"]')
    expect(bid.exists()).toBe(true)
    const text = bid.text()
    expect(text).toContain('叫地主')
    expect(text).toContain('不叫')
    expect(text).toContain('抢')
    expect(text).toContain('不抢')
  })

  it('非自己回合 (PLAYING) 不渲染 bid 面板', () => {
    const store = useGameStore()
    store.setRoom(1, 'PLAYER', 100)
    store.myUserId = 100
    store.currentTurnPlayerId = 200 // 他人回合
    store.roomState = 'PLAYING'
    const wrapper = mount(DouDizhuTable, { props: { spectator: false } })
    expect(wrapper.find('[data-testid="bid-panel"]').exists()).toBe(false)
  })
})
