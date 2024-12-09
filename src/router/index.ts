import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import GetStarted from '@/views/GetStarted.vue'
import Particle from '@/views/Particle.vue'

const routes: Array<RouteRecordRaw> = [
  { path: '/', component: GetStarted },
  { path: '/1', component: Particle }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 在这里添加路由的导航守卫
router.beforeEach((to, from, next) => {
  console.log('Navigating to:', to)
  next()
})

export default router
