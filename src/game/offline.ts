/**
 * 离线通知 + 重连处理 (设计 §4.5 / plan §6.4)。
 *
 * registerOfflineNotifier: visibilitychange(document.hidden) / pagehide +
 *   navigator.sendBeacon(Blob application/json, { roomId, gst, ts })。
 *   不用 unload/beforeunload (移动端不可靠且破坏 bfcache)。
 *
 * ReconnectHandler: 指数退避重连 + 410 兜底 snapshot 全量恢复。
 */
import { type Ref } from 'vue'
import { API_BASE_URL, API_URLS } from '@/utils/network.ts'

/** 离线通知 payload (OfflineController @RequestBody, gst 在 body)。 */
export interface OfflinePayload {
  roomId: number
  gst: string
  ts: number
}

/**
 * 注册离线通知器。返回 cleanup (组件 onUnmounted 调用移除监听)。
 * @param roomId  当前房间 id (Ref, 可变; null 时不发)
 * @param gst     game session token (Ref, 可变; null 时不发)
 */
export function registerOfflineNotifier(
  roomId: Ref<number | null>,
  gst: Ref<string | null>,
): () => void {
  const notify = () => {
    const id = roomId.value
    const token = gst.value
    if (id == null || !token) return
    const payload: OfflinePayload = { roomId: id, gst: token, ts: Date.now() }
    try {
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' })
      const url = `${API_BASE_URL || ''}${API_URLS.game.offline}`
      const nav = navigator as Navigator & { sendBeacon?: (url: string, data: Blob) => boolean }
      if (typeof nav.sendBeacon === 'function') {
        nav.sendBeacon(url, blob)
      }
    } catch {
      /* ignore: 卸载期不应抛错 */
    }
  }

  // visibilitychange: 仅 document.hidden (切后台/最小化) 时通知
  const onVisibility = () => {
    if (typeof document !== 'undefined' && document.hidden) notify()
  }
  // pagehide: 页面卸载 (bfcache 兼容) 时通知
  const onPageHide = () => notify()

  document.addEventListener('visibilitychange', onVisibility)
  window.addEventListener('pagehide', onPageHide)
  // 不绑 unload/beforeunload

  return () => {
    document.removeEventListener('visibilitychange', onVisibility)
    window.removeEventListener('pagehide', onPageHide)
  }
}

export interface ReconnectHandlerOptions {
  /** 重连动作 (重新 connect transport)。 */
  connect: () => void
  /** 410 兜底: 拉取全量 snapshot 并恢复 store 后再 connect (可选)。 */
  snapshot?: () => Promise<void>
  baseDelay?: number
  maxDelay?: number
  maxAttempts?: number
}

/**
 * 指数退避重连 + 410 snapshot 兜底。
 * - trigger(): 连接错误/断开时调, 指数退避 (base*2^n, 上限 maxDelay) 直至 maxAttempts。
 * - onGone(): 收到 410 (回放窗口溢出) 时调, reset 计数 → snapshot 恢复 → connect。
 */
export class ReconnectHandler {
  private attempts = 0
  private timer: ReturnType<typeof setTimeout> | null = null
  private readonly opts: Required<Pick<ReconnectHandlerOptions, 'connect' | 'baseDelay' | 'maxDelay' | 'maxAttempts'>> & {
    snapshot?: () => Promise<void>
  }

  constructor(opts: ReconnectHandlerOptions) {
    this.opts = {
      connect: opts.connect,
      baseDelay: opts.baseDelay ?? 500,
      maxDelay: opts.maxDelay ?? 30000,
      maxAttempts: opts.maxAttempts ?? 5,
      snapshot: opts.snapshot,
    }
  }

  /** 连接失败/断开触发 (指数退避)。 */
  trigger(): void {
    if (this.attempts >= this.opts.maxAttempts) return
    const delay = Math.min(this.opts.maxDelay, this.opts.baseDelay * 2 ** this.attempts)
    this.attempts++
    this.timer = setTimeout(() => this.opts.connect(), delay)
  }

  /** 410 兜底: 全量 snapshot 恢复后重连 (重置退避计数)。 */
  async onGone(): Promise<void> {
    this.reset()
    const snap = this.opts.snapshot
    if (snap) {
      try {
        await snap()
      } catch {
        /* snapshot 失败: 退避重试 connect */
        this.trigger()
        return
      }
      this.opts.connect()
    } else {
      this.opts.connect()
    }
  }

  /** 重置退避计数并清定时器 (成功连上 / 主动停止时调)。 */
  reset(): void {
    this.attempts = 0
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
  }

  /** 停止 (组件卸载)。 */
  stop(): void {
    this.reset()
  }
}
