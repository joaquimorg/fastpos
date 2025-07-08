<template>
  <ProductManager :products="products" @update="updateProducts" />
</template>
<script setup>
import { inject } from 'vue'
import ProductManager from '../components/ProductManager.vue'
const products = inject('products')
const updateProducts = inject('updateProducts')
</script>
