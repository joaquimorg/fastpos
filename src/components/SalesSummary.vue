<template>
  <v-card class="mx-auto my-4" max-width="480" elevation="5">
    <v-card-title class="text-h6 text-center">Resumo do Dia</v-card-title>
    <v-card-text>
      <v-list v-if="stats.length" density="compact" class="bg-transparent">
        <v-list-item v-for="(stat, idx) in stats" :key="idx">
          <v-list-item-title>
            <strong>{{ stat.product }}</strong> — {{ stat.quantity }} vendidos — Total: €{{ stat.total.toFixed(2) }}
          </v-list-item-title>
        </v-list-item>
      </v-list>
      <v-divider class="my-2" v-if="stats.length"/>
      <div class="text-end mb-2"><strong>Total de Vendas:</strong> €{{ total.toFixed(2) }}</div>
      <v-btn color="red" block class="mt-2" @click="$emit('close-day')">Fechar Dia</v-btn>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
  sales: { type: Array, required: true },
  products: { type: Array, default: () => [] }
})

const getProductPrice = (name) => {
  const match = props.products.find(p => String(p.name).trim().toLowerCase() === String(name).trim().toLowerCase())
  return match ? Number(match.price) : 0
}

const stats = computed(() => {
  const obj = {}
  for (const sale of props.sales) {
    if (!Array.isArray(sale.items)) continue
    for (const item of sale.items) {
      const key = String(item.product).trim().toLowerCase()
      if (!obj[key]) {
        obj[key] = { product: item.product, quantity: 0, total: 0 }
      }
      const unitPrice = getProductPrice(item.product)
      obj[key].quantity += item.quantity
      obj[key].total += unitPrice * item.quantity
    }
  }
  return Object.values(obj)
})

const total = computed(() => stats.value.reduce((sum, product) => sum + product.total, 0))
</script>
