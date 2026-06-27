import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { WsTransport } from './WsTransport.ts'

/** 模拟 WebSocket (捕获构造参数 + 事件回调)。 */
class MockWS {
  static instances: MockWS[] = []
  url: string
  protocols: string | string[] | undefined
  readyState = 0
  onopen: ((ev?: unknown) => void) | null = null
  onmessage: ((ev: { data: string }) => void) | null = null
  onerror: ((ev?: unknown) => void) | null = null
  onclose: ((ev?: unknown) => void) | null = null
  constructor(url: string, protocols?: string | string[]) {
    this.url = url
    this.protocols = protocols
    MockWS.instances.push(this)
  }
  close() {
    this.readyState = 3
  }
  fireOpen() {
    this.readyState = 1
    this.onopen?.()
  }
  fireMessage(data: unknown) {
    const text = typeof data === 'string' ? data : JSON.stringify(data)
    this.onmessage?.({ data: text })
  }
  fireError() {
    this.onerror?.()
  }
}

describe('WsTransport', () => {
  beforeEach(() => {
    MockWS.instances = []
    vi.stubGlobal('WebSocket', MockWS)
  })
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('connect 拼接 url 含 roomId/gst/lastSeq, subprotocol 含 gst.{gst}', () => {
    const t = new WsTransport()
    t.connect(5, 'abc', 3)
    const ws = MockWS.instances[0]!
    expect(ws.url).toContain('/ws/room/5')
    expect(ws.url).toContain('gst=abc')
    expect(ws.url).toContain('lastSeq=3')
    expect(Array.isArray(ws.protocols)).toBe(true)
    expect((ws.protocols as string[]).some((p) => p === 'gst.abc')).toBe(true)
    t.disconnect()
  })

  it('onEvent 分发解析后的 GameEvent 并更新 lastSeq', () => {
    const t = new WsTransport()
    t.connect(1, 'g', 0)
    const ws = MockWS.instances[0]!
    const handler = vi.fn()
    t.onEvent(handler)
    const event = {
      type: 'CardPlayedEvent',
      seq: 7,
      ts: '2024-01-01T00:00:00Z',
      playerId: 1,
      played: [{ rank: 3, suit: 'SPADES' }],
      isPass: false,
      remainingCount: 16,
    }
    ws.fireMessage(JSON.stringify(event))
    expect(handler).toHaveBeenCalledOnce()
    const arg = handler.mock.calls[0]![0] as { type: string; seq: number }
    expect(arg.type).toBe('CardPlayedEvent')
    expect(arg.seq).toBe(7)
    expect(t.lastSeq).toBe(7)
    t.disconnect()
  })

  it('open 后 state=open', () => {
    const t = new WsTransport()
    t.connect(1, 'g', 0)
    expect(t.state).toBe('connecting')
    MockWS.instances[0]!.fireOpen()
    expect(t.state).toBe('open')
    t.disconnect()
  })
})
