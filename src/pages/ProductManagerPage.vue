<template>
  <v-card class="mx-auto my-4" max-width="480" elevation="5">
    <v-card-title class="text-h6 text-center">Configurações</v-card-title>
    <v-card-text>
      <v-text-field v-model="eventNameModel" label="Nome do evento" density="comfortable" hide-details />
    </v-card-text>
  </v-card>
  <ProductManager :products="products" @update="updateProducts" />
</template>
<script setup>
import { inject, computed } from 'vue'
import ProductManager from '../components/ProductManager.vue'
const products = inject('products')
const updateProducts = inject('updateProducts')
const eventName = inject('eventName')
const setEventName = inject('setEventName')
const eventNameModel = computed({
  get: () => eventName.value,
  set: val => setEventName(val)
})
</script>
