<template>
  <SaleRegister :products="products" @sale-registered="registerSale" :eventName="eventName" />
</template>
<script setup>
import { inject } from 'vue'
import SaleRegister from '../components/SaleRegister.vue'
const products = inject('products')
const registerSale = inject('registerSale')
const eventName = inject('eventName')
</script>
