<template>
  <SalesSummary :sales="sales" :products="products" @close-day="closeDay" />
</template>

<script setup>
import { inject } from 'vue'
import SalesSummary from '../components/SalesSummary.vue'

const sales = inject('sales')
const products = inject('products')
const closeDay = inject('closeDay')

</script>
