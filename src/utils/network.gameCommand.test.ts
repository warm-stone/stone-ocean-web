import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// 模拟 useSelfStore (提供 token + setToken/clearUserInfo spy), 避免依赖真实 pinia。
const { mockStore } = vi.hoisted(() => ({
  mockStore: {
    token: 'old-token' as string | null,
    setToken: vi.fn(),
    clearUserInfo: vi.fn(),
    user: { id: 1 },
  },
}))

vi.mock('@/utils/piniaCache.ts', () => ({
  useSelfStore: () => mockStore,
}))

// ElMessage 在拦截器内被调用, 屏蔽以避免 element-plus 副作用。
vi.mock('element-plus', () => ({
  ElMessage: { error: vi.fn(), success: vi.fn(), warning: vi.fn() },
}))

import { gameCommand, API_URLS, default as apiClient } from '@/utils/network.ts'

function makeResp(status: number, data: unknown, config: unknown): unknown {
  return { status, statusText: 'OK', data, headers: {}, config, request: {} }
}

function makeErr(status: number, data: unknown, config: unknown): unknown {
  return Object.assign(new Error(String(status)), {
    response: { status, data, statusText: 'ERR', headers: {}, config, request: {} },
    config,
    isAxiosError: true,
    name: 'AxiosError',
  })
}

describe('gameCommand 401 刷新队列', () => {
  let calls: string[]
  beforeEach(() => {
    calls = []
    mockStore.token = 'old-token'
    mockStore.setToken = vi.fn()
    mockStore.clearUserInfo = vi.fn()
    // 自定义 axios adapter: 第 1 次游戏命令 → 401; /token/token → 200 新 token; 重放 → 200
    ;(apiClient.defaults as unknown as { adapter: unknown }).adapter = (async (config: {
      url?: string
    }) => {
      const url = config.url ?? ''
      calls.push(url)
      if (url.includes('/token/token')) {
        return makeResp(200, { statusCode: 200, message: 'ok', data: 'new-token' }, config)
      }
      const gameCount = calls.filter((u) => !u.includes('/token/token')).length
      if (gameCount === 1) {
        throw makeErr(401, { statusCode: 401, message: 'unauthorized', data: null }, config)
      }
      return makeResp(200, { statusCode: 200, message: 'ok', data: { done: true } }, config)
    }) as unknown
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('401 触发刷新并重放原请求; setToken 被调; 返回重试结果', async () => {
    const res = await gameCommand<{ done: boolean }>(API_URLS.game.pass(1), {
      type: 'PassCommand',
      clientRequestId: '',
      userId: 1,
    })
    expect(res.statusCode).toBe(200)
    expect(res.data.done).toBe(true)
    // 刷新端点被命中
    expect(calls.some((u) => u.includes('/token/token'))).toBe(true)
    // 旧 token 失效后用新 token 重放: setToken 被调用
    expect(mockStore.setToken).toHaveBeenCalledWith('new-token')
    // 原游戏命令被重放 (出现两次: 首次 401 + 重放 200)
    const gameCalls = calls.filter((u) => u.includes('/game/room'))
    expect(gameCalls.length).toBe(2)
  })
})
