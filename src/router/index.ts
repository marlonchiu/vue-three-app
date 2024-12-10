import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import GetStarted from '@/views/GetStarted.vue'
import Particle from '@/views/Particle.vue'

const routes: Array<RouteRecordRaw> = [
  { path: '/', component: GetStarted },
  { path: '/1', component: Particle },
  { path: '/s-1', component: () => import('@/views/Shader-1.vue') },
  { path: '/s-2', component: () => import('@/views/Shader-2.vue') },
  { path: '/s-3', component: () => import('@/views/Shader-3.vue') },
  { path: '/s-4', component: () => import('@/views/Shader-4.vue') },
  { path: '/s-5', component: () => import('@/views/Shader-5.vue') },
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
