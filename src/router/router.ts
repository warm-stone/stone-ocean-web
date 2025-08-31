import {createRouter, createWebHistory} from 'vue-router'
// import App from '../App.vue'
// import App from '@/App.vue'
import App from '@/App.vue'
// import NetHome from '@/views/NetHome.vue'
import _Test from '@/views/MyTest.vue'
import BiographicalNote from '@/views/BiographicalNote.vue'
import OAuth2Login from "@/views/OAuth2Login.vue";
import Vote4Fun from "@/views/Vote4Fun.vue";
import VoteDetail from "@/views/VoteDetail.vue";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: '',
            redirect: 'vote4fun'
        },
        {
            path: '/vote4fun',
            name: '投票',
            component: Vote4Fun,
        },
        {
            path: '/vote4fun',
            name: '投票',
            component: Vote4Fun,
        },
        {
            path: '/vote_detail',
            name: '投票',
            component: VoteDetail,
        },
        {
            path: '/biographic-note/:id',
            name: '简历',
            component: BiographicalNote
        },
        {
            path: '/login/oauth2/code/:registrationId',
            name: 'oauth2 授权信息传递',
            component: OAuth2Login
        },
        {
            path: '/test',
            name: 'test',
            component: _Test
        },

        {
            path: '/app',
            name: 'app',
            component: App
        },
        {
            path: '/about',
            name: 'about',
            // route level code-splitting
            // this generates a separate chunk (About.[hash].js) for this route
            // which is lazy-loaded when the route is visited.
            component: () => import('../views/AboutView.vue')
        }
    ]
})

export default router
