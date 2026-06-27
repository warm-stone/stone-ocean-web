/**
 * HTTP 命令适配器 (设计 §4.1 / plan §6.4)。
 * 复用 network.ts post, 自动注入 clientRequestId (命令幂等键)。
 * POST 自动带 Authorization; 401 走 network.ts 刷新队列。
 */
import { post } from '@/utils/network.ts'
import type { ApiResponse } from '@/utils/network.ts'
import type { GameCommand } from '@/game/types.ts'

/**
 * 命令 type → 房间内 REST 路径 映射 (plan §5.3 端点表)。
 * 大厅级命令 (CreateRoomCommand/JoinRoomCommand) 不在此映射 (无 roomId 路径段),
 * 由调用方显式传 path (经 gameCommand/API_URLS.game)。
 */
const ROOM_COMMAND_PATH: Record<string, (roomId: number) => string> = {
  SwitchRoleCommand: (id) => `/game/room/${id}/switch-role`,
  StartGameCommand: (id) => `/game/room/${id}/start`,
  BidCommand: (id) => `/game/room/${id}/bid`,
  PlayCardCommand: (id) => `/game/room/${id}/play`,
  PassCommand: (id) => `/game/room/${id}/pass`,
  LeaveRoomCommand: (id) => `/game/room/${id}/leave`,
  TransferHostCommand: (id) => `/game/room/${id}/transfer-host`,
  KickCommand: (id) => `/game/room/${id}/kick`,
  DissolveCommand: (id) => `/game/room/${id}/dissolve`,
}

/** 由命令 type + roomId 解析房间内 REST 路径; 大厅级命令抛错 (需显式 path)。 */
export function resolveCommandPath(type: string, roomId: number | null): string {
  const builder = ROOM_COMMAND_PATH[type]
  if (!builder) {
    throw new Error(`无法解析命令路径: type=${type} (大厅级命令需显式传 path)`)
  }
  if (roomId == null) {
    throw new Error(`命令 ${type} 需 roomId, 但当前未进入房间`)
  }
  return builder(roomId)
}

export class HttpAdapter {
  /**
   * 发送命令: 注入 clientRequestId (若未提供) 后 POST。
   * @param path REST 路径 (如 resolveCommandPath(type, roomId) 或 API_URLS.game.createRoom)
   * @param cmd  GameCommand
   */
  async send<T = unknown>(path: string, cmd: GameCommand): Promise<ApiResponse<T>> {
    const enriched = { ...cmd, clientRequestId: cmd.clientRequestId || genId() } as GameCommand
    return post<ApiResponse<T>>(path, enriched)
  }
}

/** clientRequestId 生成 (优先 crypto.randomUUID)。 */
function genId(): string {
  try {
    const g = globalThis as unknown as { crypto?: { randomUUID?: () => string } }
    if (g.crypto && typeof g.crypto.randomUUID === 'function') {
      return g.crypto.randomUUID()
    }
  } catch {
    /* ignore */
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}
