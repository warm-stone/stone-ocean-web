/**
 * WebSocket 适配器 (设计 §4.1 / plan §6.4)。
 * new WebSocket(`${wsBase}/ws/room/${roomId}?gst=${gst}&lastSeq=${lastSeq}`, [`gst.${gst}`])
 * onmessage → 解析 GameEvent → onEvent; onerror → (有 onError 则交由上层 fallback, 否则自重连)。
 */
import type { GameCommand, GameEvent } from '@/game/types.ts'
import type { ApiResponse } from '@/utils/network.ts'
import { API_BASE_URL } from '@/utils/network.ts'
import { HttpAdapter, resolveCommandPath } from '@/game/transport/HttpAdapter.ts'
import type { GameTransport, TransportState } from '@/game/transport/GameTransport.ts'

/** 由 http base (相对或绝对) 推导 ws base (绝对, ws/wss)。 */
export function buildWsBase(httpBase: string): string {
  if (/^https:\/\//i.test(httpBase)) return 'wss://' + httpBase.slice('https://'.length)
  if (/^http:\/\//i.test(httpBase)) return 'ws://' + httpBase.slice('http://'.length)
  if (/^wss?:\/\//i.test(httpBase)) return httpBase
  // 相对路径 (如 /api): 用当前页面 host 拼绝对
  const loc = typeof window !== 'undefined' ? window.location : null
  if (loc) {
    const proto = loc.protocol === 'https:' ? 'wss:' : 'ws:'
    return `${proto}//${loc.host}${httpBase}`
  }
  return `ws://localhost${httpBase}`
}

/** 拼接 WS 握手 URL。 */
export function buildWsUrl(roomId: number, gst: string, lastSeq: number, httpBase = API_BASE_URL): string {
  const base = buildWsBase(httpBase || '/api')
  return `${base}/ws/room/${roomId}?gst=${encodeURIComponent(gst)}&lastSeq=${lastSeq}`
}

export class WsTransport implements GameTransport {
  private ws: WebSocket | null = null
  private handler: ((e: GameEvent) => void) | null = null
  private http = new HttpAdapter()
  private roomId: number | null = null
  private gst: string | null = null
  private _lastSeq = 0
  private _state: TransportState = 'closed'
  private reconnectAttempts = 0
  private readonly maxReconnects = 5

  /** 由 TransportFactory(auto 模式) 设置: 失败时交由上层 fallback 到 SSE (不自重连)。 */
  onError?: () => void

  get lastSeq(): number {
    return this._lastSeq
  }
  get state(): TransportState {
    return this._state
  }

  connect(roomId: number, gst: string, lastSeq: number): void {
    this.disconnect()
    this.roomId = roomId
    this.gst = gst
    this._lastSeq = lastSeq
    this._state = 'connecting'
    const url = buildWsUrl(roomId, gst, lastSeq)
    // subprotocol 传 gst, 比 query param 更不易被日志记录 (设计 §6.4)
    const protocols = [`gst.${gst}`]
    this.ws = new WebSocket(url, protocols)
    this.ws.onopen = () => {
      this._state = 'open'
      this.reconnectAttempts = 0
    }
    this.ws.onmessage = (ev: MessageEvent) => {
      this.handleMessage(ev.data)
    }
    this.ws.onerror = () => {
      this._state = 'closed'
      if (this.onError) {
        this.onError()
      } else {
        this.reconnect()
      }
    }
    this.ws.onclose = () => {
      this._state = 'closed'
    }
  }

  private handleMessage(data: unknown): void {
    if (data == null) return
    let parsed: unknown
    try {
      const text = typeof data === 'string' ? data : String(data)
      parsed = JSON.parse(text)
    } catch {
      return
    }
    const evt = parsed as GameEvent | undefined
    if (evt && typeof evt === 'object' && typeof (evt as { type?: unknown }).type === 'string') {
      if (typeof evt.seq === 'number') this._lastSeq = evt.seq
      this.handler?.(evt)
    }
  }

  disconnect(): void {
    const ws = this.ws
    this.ws = null
    if (ws) {
      ws.onopen = null
      ws.onmessage = null
      ws.onerror = null
      ws.onclose = null
      try {
        if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
          ws.close()
        }
      } catch {
        /* ignore */
      }
    }
    this._state = 'closed'
  }

  async send<T = unknown>(cmd: GameCommand): Promise<ApiResponse<T>> {
    const path = resolveCommandPath(cmd.type, this.roomId)
    return this.http.send<T>(path, cmd)
  }

  onEvent(handler: (e: GameEvent) => void): void {
    this.handler = handler
  }

  reconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnects) return
    this.reconnectAttempts++
    if (this.roomId != null && this.gst != null) {
      this.connect(this.roomId, this.gst, this._lastSeq)
    }
  }
}
