/**
 * 传输抽象层接口 (设计 §4.1 / plan §6.3)。
 * 统一屏蔽 WS/SSE 差异; 命令上行统一走 HTTP (send), 事件下行经 WS/SSE (onEvent)。
 *
 * 裁定: 按 plan §6.3 用 onEvent(handler) 统一 (非 onMessage/onClose)。
 */
import type { GameCommand, GameEvent } from '@/game/types.ts'
import type { ApiResponse } from '@/utils/network.ts'

export type TransportState = 'connecting' | 'open' | 'closed'

export interface GameTransport {
  /** 建立下行连接 (WS/SSE 握手携带 gst + lastSeq 用于补发)。 */
  connect(roomId: number, gst: string, lastSeq: number): void
  /** 主动断开下行连接。 */
  disconnect(): void
  /** 上行命令 (走 HTTP, 自动 clientRequestId + Authorization; 不经 WS/SSE)。 */
  send<T = unknown>(cmd: GameCommand): Promise<ApiResponse<T>>
  /** 注册下行事件处理器 (单 handler, 后注册覆盖前)。 */
  onEvent(handler: (e: GameEvent) => void): void
  /** 重连 (携带 lastSeq 补发)。 */
  reconnect(): void
  /** 当前连接已收到的最新 seq (用于重连协商)。 */
  readonly lastSeq: number
  /** 当前连接状态。 */
  readonly state: TransportState
}
