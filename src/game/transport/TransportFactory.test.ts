import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { readTransportPref, writeTransportPref, createTransport } from './TransportFactory.ts'

class MockWS {
  static instances: MockWS[] = []
  url: string
  protocols: string | string[] | undefined
  readyState = 0
  onopen: ((ev?: unknown) => void) | null = null
  onmessage: ((ev?: unknown) => void) | null = null
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
  fireError() {
    this.onerror?.()
  }
}

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
  removeEventListener() {
    /* noop */
  }
  close() {
    this.closed = true
  }
}

describe('TransportFactory', () => {
  beforeEach(() => {
    localStorage.clear()
    MockWS.instances = []
    MockES.instances = []
    vi.stubGlobal('WebSocket', MockWS)
    vi.stubGlobal('EventSource', MockES)
  })
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it("readTransportPref 默认 'auto'", () => {
    expect(readTransportPref()).toBe('auto')
  })

  it("readTransportPref 读 localStorage 'game.transport' = ws/sse", () => {
    writeTransportPref('ws')
    expect(readTransportPref()).toBe('ws')
    writeTransportPref('sse')
    expect(readTransportPref()).toBe('sse')
    writeTransportPref('auto')
    expect(readTransportPref()).toBe('auto')
  })

  it("'ws' 偏好强制 WS (connect 后仅建 WebSocket)", () => {
    writeTransportPref('ws')
    const t = createTransport({ roomId: 1, gst: 'g', lastSeq: 0, onEvent: () => {} })
    t.connect(1, 'g', 0)
    expect(MockWS.instances.length).toBe(1)
    expect(MockES.instances.length).toBe(0)
    t.disconnect()
  })

  it("'sse' 偏好强制 SSE", () => {
    writeTransportPref('sse')
    const t = createTransport({ roomId: 1, gst: 'g', lastSeq: 0, onEvent: () => {} })
    t.connect(1, 'g', 0)
    expect(MockES.instances.length).toBe(1)
    expect(MockWS.instances.length).toBe(0)
    t.disconnect()
  })

  it("auto 偏好: WS onerror 回落 SSE", () => {
    const t = createTransport({ roomId: 1, gst: 'g', lastSeq: 0, onEvent: () => {} })
    t.connect(1, 'g', 0)
    expect(MockWS.instances.length).toBe(1)
    expect(MockES.instances.length).toBe(0)
    // WS 出错 → onError → fallback SSE
    MockWS.instances[0]!.fireError()
    expect(MockES.instances.length).toBe(1)
    t.disconnect()
  })

  it('auto 偏好: WS 5s 未 open 回落 SSE (超时)', () => {
    vi.useFakeTimers()
    const t = createTransport({ roomId: 1, gst: 'g', lastSeq: 0, onEvent: () => {} })
    t.connect(1, 'g', 0)
    expect(MockWS.instances.length).toBe(1)
    expect(MockES.instances.length).toBe(0)
    vi.advanceTimersByTime(5001)
    expect(MockES.instances.length).toBe(1)
    t.disconnect()
  })

  it('auto 偏好: WS 在 5s 内 open 则不回落 SSE', () => {
    vi.useFakeTimers()
    const t = createTransport({ roomId: 1, gst: 'g', lastSeq: 0, onEvent: () => {} })
    t.connect(1, 'g', 0)
    MockWS.instances[0]!.fireOpen()
    vi.advanceTimersByTime(5001)
    expect(MockES.instances.length).toBe(0)
    expect(t.state).toBe('open')
    t.disconnect()
  })
})
