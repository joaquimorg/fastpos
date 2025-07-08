import { createRouter, createWebHistory } from 'vue-router'
import SaleRegisterPage from '../pages/SaleRegisterPage.vue'
import ProductManagerPage from '../pages/ProductManagerPage.vue'
import SalesSummaryPage from '../pages/SalesSummaryPage.vue'

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: SaleRegisterPage },
    { path: '/produtos', component: ProductManagerPage },
    { path: '/resumo', component: SalesSummaryPage }
  ]
})
