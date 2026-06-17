import { createRouter, createWebHistory } from 'vue-router'
import { useSelfStore } from '@/utils/piniaCache.ts'
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
      meta: { requireAuth: true },
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
  ],
})

router.beforeEach((to, _from, next) => {
  if (to.meta.requireAuth) {
    const store = useSelfStore()
    if (!store.token) {
      ElMessage.warning('请先登录')
      next({ path: '/vote4fun' })
      return
    }
  }
  next()
})

export default router
