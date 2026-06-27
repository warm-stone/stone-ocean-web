import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { SseTransport } from './SseTransport.ts'

/** 模拟 EventSource (捕获 url + addEventListener + onerror)。 */
class MockES {
  static instances: MockES[] = []
  url: string
  onopen: ((ev?: unknown) => void) | null = null
  onerror: ((ev?: unknown) => void) | null = null
  listeners: Record<string, Array<(ev: { data: string }) => void>> = {}
  closed = false
  constructor(url: string) {
    this.url = url
    MockES.instances.push(this)
  }
  addEventListener(name: string, fn: (ev: { data: string }) => void) {
    ;(this.listeners[name] ??= []).push(fn)
  }
  removeEventListener(name: string, fn: (ev: { data: string }) => void) {
    this.listeners[name] = (this.listeners[name] ?? []).filter((f) => f !== fn)
  }
  close() {
    this.closed = true
  }
  fire(name: string, data: unknown) {
    const text = typeof data === 'string' ? data : JSON.stringify(data)
    this.listeners[name]?.forEach((fn) => fn({ data: text }))
  }
  fireError() {
    this.onerror?.()
  }
}

describe('SseTransport', () => {
  beforeEach(() => {
    MockES.instances = []
    vi.stubGlobal('EventSource', MockES)
  })
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('connect 拼接 url 含 roomId/gst/lastSeq', () => {
    const t = new SseTransport()
    t.connect(9, 'gst1', 4)
    const es = MockES.instances[0]!
    expect(es.url).toContain('/sse/room/9')
    expect(es.url).toContain('gst=gst1')
    expect(es.url).toContain('lastSeq=4')
    t.disconnect()
  })

  it('addEventListener 按 event.name 分发 → onEvent (更新 lastSeq)', () => {
    const t = new SseTransport()
    t.connect(1, 'g', 0)
    const es = MockES.instances[0]!
    const handler = vi.fn()
    t.onEvent(handler)
    // 后端 SSE event.name = GameEvent type 串
    es.fire('CardPlayedEvent', {
      type: 'CardPlayedEvent',
      seq: 2,
      ts: 't',
      playerId: 1,
      played: [],
      isPass: true,
      remainingCount: 5,
    })
    expect(handler).toHaveBeenCalledOnce()
    const arg = handler.mock.calls[0]![0] as { type: string; seq: number }
    expect(arg.type).toBe('CardPlayedEvent')
    expect(t.lastSeq).toBe(2)
    t.disconnect()
  })

  it('onerror 触发 reconnect (新建 EventSource)', () => {
    const t = new SseTransport()
    t.connect(1, 'g', 0)
    expect(MockES.instances.length).toBe(1)
    MockES.instances[0]!.fireError()
    // 无 onError 时自重连: 新建一个 EventSource
    expect(MockES.instances.length).toBe(2)
    expect(MockES.instances[1]!.url).toContain('/sse/room/1')
    t.disconnect()
  })
})
