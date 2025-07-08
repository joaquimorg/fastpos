<template>
  <v-app>
    <v-app-bar app color="primary" dark dense flat>
      <v-toolbar-title class="d-flex align-center">
        <img :src="logoSrc" alt="fastPOS" style="height:60px;margin-right:8px;vertical-align:middle" />        
      </v-toolbar-title>
      <v-spacer />
      <v-app-bar-nav-icon class="d-md-none" @click="drawer = !drawer" />
      <v-row class="d-none d-md-flex" no-gutters align="center">
        <v-btn to="/" text tag="router-link" prepend-icon="mdi-cash-register">Registar Venda</v-btn>
        <v-btn to="/produtos" text tag="router-link" prepend-icon="mdi-package-variant">Produtos</v-btn>
        <v-btn to="/resumo" text tag="router-link" prepend-icon="mdi-chart-bar">Resumo do Dia</v-btn>
        <v-btn to="/ajuda" text tag="router-link" prepend-icon="mdi-help-circle">Ajuda</v-btn>
      </v-row>
    </v-app-bar>
    <v-navigation-drawer v-model="drawer" app temporary class="d-md-none">
      <v-list>
        <v-list-item to="/" tag="router-link" prepend-icon="mdi-cash-register">Registar Venda</v-list-item>
        <v-list-item to="/produtos" tag="router-link" prepend-icon="mdi-package-variant">Produtos</v-list-item>
        <v-list-item to="/resumo" tag="router-link" prepend-icon="mdi-chart-bar">Resumo do Dia</v-list-item>
        <v-list-item to="/ajuda" tag="router-link" prepend-icon="mdi-help-circle">Ajuda</v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>
<script setup>
import { ref, provide, watch } from 'vue'
const logoSrc = '/fastpos-logo.png'
const drawer = ref(false)
// STATE PARTILHADO igual ao anterior...
const products = ref(JSON.parse(localStorage.getItem('sales_products')||'[]'))
const sales = ref(JSON.parse(localStorage.getItem('sales_data')||'[]'))
const saleSeq = ref(Number(localStorage.getItem('sales_seq')||1))
const eventName = ref(localStorage.getItem('event_name') || '')
function updateProducts(newList){ products.value = newList }
function setEventName(name){ eventName.value = name }
function registerSale(sale){
  sales.value.push({ ...sale, seq: saleSeq.value })
  saleSeq.value++
}
function closeDay(){ sales.value = [] }
watch(products, v => localStorage.setItem('sales_products', JSON.stringify(v)), { deep:true })
watch(sales, v => localStorage.setItem('sales_data', JSON.stringify(v)), { deep:true })
watch(saleSeq, v => localStorage.setItem('sales_seq', v))
watch(eventName, v => localStorage.setItem('event_name', v))
provide('products', products)
provide('sales', sales)
provide('updateProducts', updateProducts)
provide('registerSale', registerSale)
provide('closeDay', closeDay)
provide('eventName', eventName)
provide('setEventName', setEventName)
</script>
