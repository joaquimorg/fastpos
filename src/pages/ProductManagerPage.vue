<template>
  <v-card class="mx-auto my-4" max-width="480" elevation="5">
    <v-card-title class="text-h6 text-center">Configurações</v-card-title>
    <v-card-text>
      <v-text-field v-model="eventNameModel" label="Nome do evento" density="comfortable" hide-details />
      <div class="text-subtitle-2 mt-4">Símbolo monetário</div>
      <v-radio-group v-model="currencyPreferenceModel" hide-details density="comfortable">
        <v-radio value="scarf">
          <template #label>
            <span class="currency-icon currency-icon--label" role="img" aria-label="Lenço"></span>
            Lenço
          </template>
        </v-radio>
        <v-radio value="euro">
          <template #label>
            <span class="currency-text currency-text--label" aria-hidden="true">€</span>
            Euro (€)
          </template>
        </v-radio>
      </v-radio-group>
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
const currencyPreference = inject('currencyPreference')
const setCurrencyPreference = inject('setCurrencyPreference')
const eventNameModel = computed({
  get: () => eventName.value,
  set: val => setEventName(val)
})
const currencyPreferenceModel = computed({
  get: () => currencyPreference.value,
  set: val => setCurrencyPreference(val)
})
</script>
