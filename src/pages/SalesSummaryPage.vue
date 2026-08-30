<template>
  <div class="app-page">
    <header class="page-heading"><div><p class="page-eyebrow">Desempenho</p><h1 class="page-title">Resumo do dia</h1><p class="page-subtitle">Acompanhe vendas, devoluções e o total líquido da operação.</p></div></header>
    <SalesSummary :sales="sales" :products="products" @close-day="closeDay" />
  </div>
</template>
<script setup>
import { inject } from 'vue'
import SalesSummary from '../components/SalesSummary.vue'
const sales = inject('sales'); const products = inject('products'); const closeDay = inject('closeDay')
</script>
