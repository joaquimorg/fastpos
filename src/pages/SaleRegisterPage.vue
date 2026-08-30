<template>
  <div class="app-page">
    <header class="page-heading sale-page-heading">
      <div>
        <h1 class="page-title">Registar venda</h1>
      </div>
      <v-chip v-if="eventName" class="sale-event-chip" color="primary" variant="tonal" prepend-icon="mdi-calendar-blank">{{ eventName }}</v-chip>
    </header>
    <SaleRegister :products="products" :event-name="eventName" @sale-registered="registerSale" />
  </div>
</template>
<script setup>
import { inject } from 'vue'
import SaleRegister from '../components/SaleRegister.vue'
const products = inject('products')
const registerSale = inject('registerSale')
const eventName = inject('eventName')
</script>
<style scoped>
@media (max-width: 599px) {
  .sale-page-heading { margin-bottom: 12px; }
  .sale-event-chip { display: none; }
}
</style>
