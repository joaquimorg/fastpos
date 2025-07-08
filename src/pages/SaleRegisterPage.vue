<template>
  <SaleRegister :products="products" @sale-registered="registerSale" />
</template>
<script setup>
import { inject } from 'vue'
import SaleRegister from '../components/SaleRegister.vue'
const products = inject('products')
const registerSale = inject('registerSale')
</script>
