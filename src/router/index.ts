import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import GetStarted from '@/views/GetStarted.vue'

const routes: Array<RouteRecordRaw> = [
  { path: '/', component: GetStarted },
  { path: '/s-1', component: () => import('@/views/Shader-1.vue') },
  { path: '/s-2', component: () => import('@/views/Shader-2.vue') },
  { path: '/s-3', component: () => import('@/views/Shader-3.vue') },
  { path: '/s-4', component: () => import('@/views/Shader-4.vue') },
  { path: '/s-5', component: () => import('@/views/Shader-5.vue') },
  { path: '/s-6', component: () => import('@/views/Shader-6.vue') },
  { path: '/s-7', component: () => import('@/views/Shader-7.vue') },
  { path: '/s-8', component: () => import('@/views/Shader-8.vue') },
  { path: '/d-1', component: () => import('@/views/Particle.vue') },
  { path: '/d-2', component: () => import('@/views/Bravo.vue') },
  { path: '/d-3', component: () => import('@/views/HandDrawn.vue') },
  { path: '/d-4', component: () => import('@/views/HandDrawn2.vue') },
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
