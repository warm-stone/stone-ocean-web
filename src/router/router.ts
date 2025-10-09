import { createRouter, createWebHistory } from 'vue-router'

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
      path: '/biographic-note/:id',
      name: '简历',
      component: () => import('@/views/BiographicalNote.vue'),
    },
    {
      path: '/login/oauth2/code/:registrationId',
      name: 'oauth2 授权信息传递',
      // component: OAuth2Login
      component: () => import('@/views/OAuth2Login.vue'),
    },
  ],
})

export default router
