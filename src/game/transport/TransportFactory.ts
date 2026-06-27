/**
 * 传输工厂 + auto-fallback (设计 §4.1 / plan §6.4)。
 * read localStorage 'game.transport' = 'auto'|'ws'|'sse' (默认 auto)。
 * auto: 试 WS, 5s 未 open 或 onerror 回落 SSE; 用户主动选 ws/sse 强制。
 */
import type { GameCommand, GameEvent } from '@/game/types.ts'
import type { ApiResponse } from '@/utils/network.ts'
import type { GameTransport, TransportState } from '@/game/transport/GameTransport.ts'
import { WsTransport } from '@/game/transport/WsTransport.ts'
import { SseTransport } from '@/game/transport/SseTransport.ts'

const STORAGE_KEY = 'game.transport'
const WS_OPEN_TIMEOUT_MS = 5000

export type TransportPrefValue = 'auto' | 'ws' | 'sse'

/** 读取传输偏好 (localStorage 'game.transport', 默认 'auto')。 */
export function readTransportPref(): TransportPrefValue {
  try {
    const v = window.localStorage.getItem(STORAGE_KEY)
    if (v === 'ws' || v === 'sse' || v === 'auto') return v
  } catch {
    /* ignore */
  }
  return 'auto'
}

/** 写入传输偏好。 */
export function writeTransportPref(p: TransportPrefValue): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, p)
  } catch {
    /* ignore */
  }
}

export interface CreateTransportCtx {
  roomId: number
  gst: string
  lastSeq: number
  onEvent: (e: GameEvent) => void
}

/** 按偏好创建 transport (已注入 onEvent, 未连接; 调用方随后 connect)。 */
export function createTransport(ctx: CreateTransportCtx): GameTransport {
  const pref = readTransportPref()
  if (pref === 'ws') {
    const t = new WsTransport()
    t.onEvent(ctx.onEvent)
    return t
  }
  if (pref === 'sse') {
    const t = new SseTransport()
    t.onEvent(ctx.onEvent)
    return t
  }
  const t = new AutoFallbackTransport()
  t.onEvent(ctx.onEvent)
  return t
}

/**
 * auto-fallback 包装: 先 WS, 5s 未 open 或 onerror 回落 SSE。
 * 对外实现 GameTransport, 将 onEvent/send/lastSeq/state 代理到当前底层 transport。
 */
class AutoFallbackTransport implements GameTransport {
  private handler: ((e: GameEvent) => void) | null = null
  private current: GameTransport | null = null
  private ctx: { roomId: number; gst: string; lastSeq: number } | null = null
  private wsTimer: ReturnType<typeof setTimeout> | null = null
  private _state: TransportState = 'closed'

  get lastSeq(): number {
    return this.current?.lastSeq ?? 0
  }
  get state(): TransportState {
    if (this.current) return this.current.state
    return this._state
  }

  onEvent(handler: (e: GameEvent) => void): void {
    this.handler = handler
    if (this.current) this.current.onEvent(handler)
  }

  connect(roomId: number, gst: string, lastSeq: number): void {
    this.ctx = { roomId, gst, lastSeq }
    this.tryWs()
  }

  private tryWs(): void {
    if (!this.ctx) return
    const ws = new WsTransport()
    // WS 失败交由本层 fallback (不自重连)
    ws.onError = () => this.fallbackToSse()
    ws.onEvent((e) => this.handler?.(e))
    this.current = ws
    this._state = 'connecting'
    ws.connect(this.ctx.roomId, this.ctx.gst, this.ctx.lastSeq)
    // 5s 未 open → 回落 SSE
    this.wsTimer = setTimeout(() => {
      if (ws.state !== 'open') this.fallbackToSse()
    }, WS_OPEN_TIMEOUT_MS)
  }

  private fallbackToSse(): void {
    // 已切到 SSE 或无 ctx: 不重复 fallback
    if (!this.ctx || this.current instanceof SseTransport) return
    if (this.wsTimer) {
      clearTimeout(this.wsTimer)
      this.wsTimer = null
    }
    this.current?.disconnect()
    const sse = new SseTransport()
    sse.onError = undefined // SSE 为兜底, 失败仅置 closed (不自重连, 不再 fallback)
    sse.onEvent((e) => this.handler?.(e))
    this.current = sse
    this._state = 'connecting'
    sse.connect(this.ctx.roomId, this.ctx.gst, this.ctx.lastSeq)
  }

  disconnect(): void {
    if (this.wsTimer) {
      clearTimeout(this.wsTimer)
      this.wsTimer = null
    }
    this.current?.disconnect()
    this.current = null
    this._state = 'closed'
  }

  async send<T = unknown>(cmd: GameCommand): Promise<ApiResponse<T>> {
    if (!this.current) {
      throw new Error('transport 未连接, 无法发送命令')
    }
    return this.current.send<T>(cmd)
  }

  reconnect(): void {
    if (!this.ctx) return
    const seq = this.lastSeq // 先保存 (disconnect 后 current 为 null, lastSeq 归 0)
    this.disconnect()
    this.connect(this.ctx.roomId, this.ctx.gst, seq)
  }
}
