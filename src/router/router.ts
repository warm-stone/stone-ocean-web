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
      path: '/vote4fun/publish',
      name: 'vote4fun_publish',
      component: () => import('@/views/PublishPost.vue'),
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
      path: '/user/register',
      name: 'user_register',
      // component: OAuth2Login
      component: () => import('@/views/UserRegister.vue'),
    },
  ],
})

export default router
