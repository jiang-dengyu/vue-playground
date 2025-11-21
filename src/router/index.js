import {createRouter, createWebHistory} from 'vue-router'

import FirstPage from  '../views/FirstPage.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes:[
        {
            path:'/',
            redirect:'/first'
        },
        {
            path: '/first',
            name: 'first',
            component: FirstPage
        }
    ]
})

export default router