import { createRouter, createWebHistory } from 'vue-router'

import TodoPage from '../views/TodoPage.vue'
import LoginPage from '../views/LoginPage.vue'
import SignUpPage from '../views/SignUpPage.vue'
import ChaoJanPage from '../views/ChaoJanPage.vue'
import ChatRoomPage from '../views/ChatRoomPage.vue'
import MemberListPage from '../views/MemberListPage.vue'

const routes = [
    { path: '/', redirect: '/login' },
    { path: '/todo', component: TodoPage },
    { path: '/login', component: LoginPage },
    { path: '/signup', component: SignUpPage },
    { path: '/chaojan', component: ChaoJanPage },
    { path: '/memberlist', component: MemberListPage },
    { path: '/chatroom', component: ChatRoomPage }
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
})

export default router