import { createRouter, createWebHistory } from 'vue-router'
import { useSelfStore, useGameStore } from '@/utils/piniaCache.ts'
import { get, API_URLS, type ApiResponse } from '@/utils/network.ts'
import type { RoomSnapshot } from '@/game/types.ts'
import { ElMessage } from 'element-plus'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: '',
      redirect: '/vote4fun',
    },
    {
      path: '/vote4fun',
      name: 'vote4fun',
      component: () => import('@/views/Vote4Fun.vue'),
      children: [],
    },
    {
      path: '/vote4fun/vote_detail/:rankListId',
      name: 'vote4fun_vote_detail',
      component: () => import('@/views/VoteDetail.vue'),
    },
    {
      path: '/vote4fun/publish',
      name: 'vote4fun_publish',
      component: () => import('@/views/PublishPost.vue'),
      meta: { requireAuth: true },
    },
    {
      path: '/biographic-note/:id',
      name: '简历',
      component: () => import('@/views/BiographicalNote.vue'),
    },
    {
      path: '/login/oauth2/code/:registrationId',
      name: 'login_oauth2_code',
      // component: OAuth2Login
      component: () => import('@/views/OAuth2Login.vue'),
    },
    {
      // value: [register, modify]
      path: '/user/:behavior',
      name: 'user_register',
      // component: OAuth2Login
      component: () => import('@/views/UserRegister.vue'),
    },
    {
      path: '/heart4zsm',
      name: 'heart',
      component: () => import('@/views/BeatingHeart.vue'),
    },
    // 游戏特性第一期 (设计 §4.2): /game 入口对接 BaseHeader.vue gotoGames()
    {
      path: '/game',
      redirect: '/game/lobby',
    },
    {
      path: '/game/lobby',
      name: 'game_lobby',
      component: () => import('@/views/game/Lobby.vue'),
      meta: { requireAuth: true },
    },
    {
      path: '/game/room/:id',
      name: 'game_room',
      component: () => import('@/views/game/Room.vue'),
      meta: { requireAuth: true },
    },
    {
      path: '/game/guess',
      name: 'game_guess',
      component: () => import('@/views/game/GuessView.vue'),
      meta: { requireAuth: true },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFound.vue'),
    },
  ],
})

router.beforeEach(async (to, _from, next) => {
  if (to.meta.requireAuth) {
    const store = useSelfStore()
    if (!store.token) {
      ElMessage.warning('请先登录')
      next({ path: '/vote4fun' })
      return
    }
  }
  // /game/room/:id 进入时 currentRoomId 不符则先调 /snapshot 全量恢复 (设计 §4.2)
  if (to.name === 'game_room') {
    const id = Number(to.params.id)
    if (Number.isFinite(id)) {
      const gameStore = useGameStore()
      if (gameStore.currentRoomId !== id) {
        try {
          // GET 需显式 userAuth:true (现有拦截器仅 POST 自动注入 Authorization)
          const body = await get<ApiResponse<RoomSnapshot>>(API_URLS.game.snapshot(id), {
            userAuth: true,
          })
          const snap = body?.data
          if (snap) {
            const self = useSelfStore()
            const myUserId = self.user?.id ?? null
            gameStore.setRoom(id, deriveMyRole(snap, myUserId), myUserId ?? 0)
            gameStore.setSnapshot(snap)
          }
        } catch {
          // snapshot 失败 (404/403/网络): 不阻塞导航, 由 Room.vue 组件处理错误态
        }
      }
    }
  }
  next()
})

/** 从 snapshot members 推断自己的角色 (myUserId 命中者; 未命中默认 SPECTATOR)。 */
function deriveMyRole(snap: RoomSnapshot, myUserId: number | null): 'HOST' | 'PLAYER' | 'SPECTATOR' {
  if (myUserId == null) return 'SPECTATOR'
  const me = snap.members.find((m) => m.userId === myUserId)
  if (!me) return 'SPECTATOR'
  return (me.role as 'HOST' | 'PLAYER' | 'SPECTATOR') ?? 'SPECTATOR'
}

export default router
