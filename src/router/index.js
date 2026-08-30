import { createRouter, createWebHistory } from 'vue-router'
export default createRouter({
  history: createWebHistory(),
  scrollBehavior() {
    return { top: 0 }
  },
  routes: [
    { path: '/', component: () => import('../pages/SaleRegisterPage.vue') },
    { path: '/produtos', component: () => import('../pages/ProductManagerPage.vue') },
    { path: '/resumo', component: () => import('../pages/SalesSummaryPage.vue') },
    { path: '/ajuda', component: () => import('../pages/HelpPage.vue') }
  ]
})
