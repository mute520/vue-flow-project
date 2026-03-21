import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/home/index.vue')
  },
  {
    path: '/page1',
    name: 'Page1',
    component: () => import('@/views/page1/index.vue')
  },
  {
    path: '/page2',
    name: 'Page2',
    component: () => import('@/views/page2/index.vue')
  },
  {
    path: '/page3',
    name: 'Page3',
    component: () => import('@/views/page3/index.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
