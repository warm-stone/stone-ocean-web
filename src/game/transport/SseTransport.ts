/**
 * SSE 适配器 (设计 §4.1 / plan §6.4)。
 * new EventSource(`${httpBase}/sse/room/${roomId}?gst=${gst}&lastSeq=${lastSeq}`)
 * addEventListener 按 event.name 分发 → onEvent; onerror → (有 onError 则交上层, 否则自重连)。
 */
import type { GameCommand, GameEvent } from '@/game/types.ts'
import { GAME_EVENT_TYPES } from '@/game/types.ts'
import type { ApiResponse } from '@/utils/network.ts'
import { API_BASE_URL } from '@/utils/network.ts'
import { HttpAdapter, resolveCommandPath } from '@/game/transport/HttpAdapter.ts'
import type { GameTransport, TransportState } from '@/game/transport/GameTransport.ts'

/** SSE 握手 URL (相对路径由浏览器解析, dev 经 vite proxy)。 */
export function buildSseUrl(roomId: number, gst: string, lastSeq: number, httpBase = API_BASE_URL): string {
  const base = httpBase || '/api'
  return `${base}/sse/room/${roomId}?gst=${encodeURIComponent(gst)}&lastSeq=${lastSeq}`
}

export class SseTransport implements GameTransport {
  private es: EventSource | null = null
  private handler: ((e: GameEvent) => void) | null = null
  private http = new HttpAdapter()
  private roomId: number | null = null
  private gst: string | null = null
  private _lastSeq = 0
  private _state: TransportState = 'closed'
  private reconnectAttempts = 0
  private readonly maxReconnects = 5

  /** 由 TransportFactory(auto 模式) 设置: 失败时交上层 (不自重连)。 */
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
    const url = buildSseUrl(roomId, gst, lastSeq)
    this.es = new EventSource(url)
    // 按 event.name 分发 (后端 SSE event.name = GameEvent type 串)
    const onNamed = (ev: Event) => this.handleMessage((ev as MessageEvent).data)
    for (const name of GAME_EVENT_TYPES) {
      this.es.addEventListener(name, onNamed)
    }
    // 兜底: 无 event name 的 message 帧 (data 内含 type 字段, WS 风格)
    this.es.addEventListener('message', onNamed)
    this.es.onopen = () => {
      this._state = 'open'
      this.reconnectAttempts = 0
    }
    this.es.onerror = () => {
      this._state = 'closed'
      if (this.onError) {
        // 主动关闭 EventSource (onerror 后浏览器会自动重连 EventSource, 这里阻止)
        this.closeEs()
        this.onError()
      } else {
        this.closeEs()
        this.reconnect()
      }
    }
  }

  private closeEs(): void {
    const es = this.es
    this.es = null
    if (es) {
      try {
        es.close()
      } catch {
        /* ignore */
      }
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
    this.closeEs()
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
