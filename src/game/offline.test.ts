import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref } from 'vue'
import { registerOfflineNotifier, ReconnectHandler } from './offline.ts'

describe('registerOfflineNotifier', () => {
  let sendBeacon: ReturnType<typeof vi.fn>
  let docAdd: ReturnType<typeof vi.spyOn>
  let winAdd: ReturnType<typeof vi.spyOn>
  let docRemove: ReturnType<typeof vi.spyOn>
  let winRemove: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    sendBeacon = vi.fn(() => true)
    Object.defineProperty(navigator, 'sendBeacon', {
      value: sendBeacon,
      configurable: true,
      writable: true,
    })
    docAdd = vi.spyOn(document, 'addEventListener')
    winAdd = vi.spyOn(window, 'addEventListener')
    docRemove = vi.spyOn(document, 'removeEventListener')
    winRemove = vi.spyOn(window, 'removeEventListener')
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  function names(): string[] {
    return [
      ...docAdd.mock.calls.map((c) => c[0] as string),
      ...winAdd.mock.calls.map((c) => c[0] as string),
    ]
  }

  it('visibilitychange hidden 时调 sendBeacon', () => {
    const cleanup = registerOfflineNotifier(ref(5), ref('gst-token'))
    Object.defineProperty(document, 'hidden', { value: true, configurable: true })
    const visCall = docAdd.mock.calls.find((c) => c[0] === 'visibilitychange')
    expect(visCall).toBeTruthy()
    ;(visCall![1] as () => void)()
    expect(sendBeacon).toHaveBeenCalledOnce()
    cleanup()
  })

  it('visibilitychange 非 hidden 时不调 sendBeacon', () => {
    const cleanup = registerOfflineNotifier(ref(5), ref('gst-token'))
    Object.defineProperty(document, 'hidden', { value: false, configurable: true })
    const visCall = docAdd.mock.calls.find((c) => c[0] === 'visibilitychange')
    ;(visCall![1] as () => void)()
    expect(sendBeacon).not.toHaveBeenCalled()
    cleanup()
  })

  it('pagehide 时调 sendBeacon', () => {
    const cleanup = registerOfflineNotifier(ref(5), ref('gst-token'))
    const pageCall = winAdd.mock.calls.find((c) => c[0] === 'pagehide')
    expect(pageCall).toBeTruthy()
    ;(pageCall![1] as () => void)()
    expect(sendBeacon).toHaveBeenCalledOnce()
    cleanup()
  })

  it('不绑 unload/beforeunload', () => {
    const cleanup = registerOfflineNotifier(ref(5), ref('gst-token'))
    const all = names()
    expect(all).not.toContain('unload')
    expect(all).not.toContain('beforeunload')
    cleanup()
  })

  it('cleanup 移除 visibilitychange 与 pagehide 监听', () => {
    const cleanup = registerOfflineNotifier(ref(5), ref('gst-token'))
    cleanup()
    const removedDoc = docRemove.mock.calls.map((c) => c[0] as string)
    const removedWin = winRemove.mock.calls.map((c) => c[0] as string)
    expect(removedDoc).toContain('visibilitychange')
    expect(removedWin).toContain('pagehide')
  })

  it('roomId/gst 为 null 时不发', () => {
    const cleanup = registerOfflineNotifier(ref(null), ref('gst-token'))
    Object.defineProperty(document, 'hidden', { value: true, configurable: true })
    const visCall = docAdd.mock.calls.find((c) => c[0] === 'visibilitychange')
    ;(visCall![1] as () => void)()
    expect(sendBeacon).not.toHaveBeenCalled()
    cleanup()
  })
})

describe('ReconnectHandler', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('trigger 指数退避调用 connect', () => {
    const connect = vi.fn()
    const h = new ReconnectHandler({ connect, baseDelay: 100, maxDelay: 1000, maxAttempts: 5 })
    h.trigger() // 100ms
    h.trigger() // 200ms
    expect(connect).not.toHaveBeenCalled()
    vi.advanceTimersByTime(100)
    expect(connect).toHaveBeenCalledTimes(1)
    vi.advanceTimersByTime(200)
    expect(connect).toHaveBeenCalledTimes(2)
    h.stop()
  })

  it('达到 maxAttempts 后不再重连', () => {
    const connect = vi.fn()
    const h = new ReconnectHandler({ connect, baseDelay: 1, maxDelay: 10, maxAttempts: 2 })
    h.trigger()
    h.trigger()
    h.trigger() // 超限, 忽略
    vi.advanceTimersByTime(100)
    expect(connect).toHaveBeenCalledTimes(2)
  })

  it('onGone (410) 调 snapshot 恢复后 connect, 并重置退避', async () => {
    const connect = vi.fn()
    const snapshot = vi.fn(async () => {})
    const h = new ReconnectHandler({ connect, snapshot })
    h.trigger() // 制造一些 attempts
    vi.advanceTimersByTime(1000)
    await h.onGone() // snapshot → connect
    expect(snapshot).toHaveBeenCalledOnce()
    expect(connect).toHaveBeenCalled()
    h.stop()
  })
})
