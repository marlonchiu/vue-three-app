import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import GetStarted from '@/views/GetStarted.vue'

const routes: Array<RouteRecordRaw> = [
  { path: '/', component: GetStarted },
  { path: '/a-1', component: () => import('@/views/article/Shader-1.vue') },
  { path: '/a-2', component: () => import('@/views/article/Shader-2.vue') },
  { path: '/a-3', component: () => import('@/views/article/Shader-3.vue') },
  { path: '/a-4', component: () => import('@/views/article/Shader-4.vue') },
  { path: '/a-5', component: () => import('@/views/article/Shader-5.vue') },
  { path: '/a-6', component: () => import('@/views/article/Shader-6.vue') },
  { path: '/a-7', component: () => import('@/views/article/Shader-7.vue') },
  { path: '/a-8', component: () => import('@/views/article/Shader-8.vue') },
  { path: '/d-1', component: () => import('@/views/demo/Particle.vue') },
  { path: '/d-2', component: () => import('@/views/demo/Bravo.vue') },
  { path: '/d-3', component: () => import('@/views/demo/HandDrawn.vue') },
  { path: '/d-4', component: () => import('@/views/demo/HandDrawn2.vue') }
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
