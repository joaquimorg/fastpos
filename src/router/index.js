import { createRouter, createWebHistory } from 'vue-router'
export default createRouter({
  history: createWebHistory(),
  scrollBehavior() {
    return { top: 0 }
  },
  routes: [
    { path: '/', component: () => import('../pages/SaleRegisterPage.vue') },
    { path: '/resumo', component: () => import('../pages/SalesSummaryPage.vue') },
    { path: '/produtos', component: () => import('../pages/ProductManagerPage.vue') },
    { path: '/ajuda', component: () => import('../pages/HelpPage.vue') },
    { path: '/privacidade', component: () => import('../pages/PrivacyPage.vue') },
    { path: '/termos', component: () => import('../pages/TermsPage.vue') }
  ]
})
