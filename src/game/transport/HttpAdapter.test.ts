import { describe, it, expect, vi, beforeEach } from 'vitest'

// mock network.ts 的 post, 隔离 HTTP 层; HttpAdapter 仅负责注入 clientRequestId。
vi.mock('@/utils/network.ts', () => ({
  post: vi.fn(async () => ({ statusCode: 200, message: 'ok', data: { ok: true } })),
}))

import { post } from '@/utils/network.ts'
import { HttpAdapter, resolveCommandPath } from './HttpAdapter.ts'

describe('HttpAdapter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('send 注入非空 clientRequestId (uuid)', async () => {
    const adapter = new HttpAdapter()
    await adapter.send('/game/room/1/play', {
      type: 'PlayCardCommand',
      clientRequestId: '',
      userId: 1,
      cards: [],
    })
    expect(post).toHaveBeenCalledOnce()
    const sent = (post as ReturnType<typeof vi.fn>).mock.calls[0]![1] as {
      clientRequestId: string
    }
    expect(typeof sent.clientRequestId).toBe('string')
    expect(sent.clientRequestId.length).toBeGreaterThan(0)
  })

  it('已有 clientRequestId 时保留原值 (不覆盖)', async () => {
    const adapter = new HttpAdapter()
    await adapter.send('/game/room/1/pass', {
      type: 'PassCommand',
      clientRequestId: 'req-123',
      userId: 1,
    })
    const sent = (post as ReturnType<typeof vi.fn>).mock.calls[0]![1] as {
      clientRequestId: string
    }
    expect(sent.clientRequestId).toBe('req-123')
  })

  it('resolveCommandPath 解析房间内命令路径', () => {
    expect(resolveCommandPath('PlayCardCommand', 7)).toBe('/game/room/7/play')
    expect(resolveCommandPath('BidCommand', 7)).toBe('/game/room/7/bid')
    expect(resolveCommandPath('StartGameCommand', 7)).toBe('/game/room/7/start')
  })

  it('resolveCommandPath 大厅级命令抛错 (需显式 path)', () => {
    expect(() => resolveCommandPath('CreateRoomCommand', 7)).toThrow()
    expect(() => resolveCommandPath('JoinRoomCommand', 7)).toThrow()
  })
})
