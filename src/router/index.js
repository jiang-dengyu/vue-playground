import {createRouter, createWebHistory} from 'vue-router'

import TodoPage from  '../views/TodoPage.vue'
import LoginPage from  '../views/LoginPage.vue'

const routes = [
    {path:'/', redirect:'/login'},
    {path:'/todo', component:TodoPage},
    {path:'/login', component:LoginPage}
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
})

export default router