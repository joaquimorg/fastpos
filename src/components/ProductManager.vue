<template>
  <v-card class="mx-auto my-4" max-width="480" elevation="5">
    <v-card-title class="text-h6 text-center">Produtos</v-card-title>
    <v-card-text class="pa-2">
      <v-form @submit.prevent="saveProduct" class="mb-2">
        <v-row class="g-1" align="center">
          <v-col cols="12">
            <v-text-field
              v-model="editProduct.name"
              label="Nome do Produto"
              required
              hide-details
              density="comfortable"
              maxlength="32"
            />
          </v-col>
          <v-col cols="12">
            <v-text-field
              v-model.number="editProduct.price"
              label="Preço (€)"
              type="number"
              min="0"
              step="0.01"
              required
              hide-details
              density="comfortable"
              inputmode="decimal"
            />
          </v-col>
        </v-row>
        <div class="text-center my-2">
          <v-btn type="submit" color="primary" block>{{ editIdx === null ? 'Adicionar' : 'Guardar' }}</v-btn>
          <v-btn v-if="editIdx !== null" @click="cancelEdit" color="grey" variant="text" block class="mt-1">Cancelar</v-btn>
        </div>
      </v-form>
      <v-list v-if="products.length" density="compact" class="bg-transparent">
        <v-list-item v-for="(p, idx) in products" :key="idx" class="py-1 px-0">
          <v-list-item-title class="text-body-2">
            {{ p.name }} <span class="grey--text">— €{{ p.price.toFixed(2) }}</span>
          </v-list-item-title>
          <template #append>
            <v-btn icon @click="edit(idx)" size="x-small" :disabled="productHasSales(p.name)">
              <v-icon size="x-small">mdi-pencil</v-icon>
            </v-btn>
            <v-btn icon @click="remove(idx)" size="x-small" color="red" :disabled="productHasSales(p.name)">
              <v-icon size="x-small">mdi-delete</v-icon>
            </v-btn>
          </template>
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
</template>
<script setup>
import { ref, toRefs, inject } from 'vue'
const props = defineProps(['products'])
const emit = defineEmits(['update'])
const { products } = toRefs(props)
const sales = inject('sales', ref([]))
const editProduct = ref({ name: '', price: null })
const editIdx = ref(null)
function saveProduct() {
  if (!editProduct.value.name || editProduct.value.price === null || editProduct.value.price < 0) return
  if (editIdx.value === null) {
    emit('update', [...products.value, {...editProduct.value}])
  } else {
    let updated = [...products.value]
    updated[editIdx.value] = {...editProduct.value}
    emit('update', updated)
  }
  editProduct.value = { name: '', price: null }
  editIdx.value = null
}
function edit(idx) {
  const name = products.value[idx]?.name
  if (productHasSales(name)) return
  editIdx.value = idx
  editProduct.value = { ...products.value[idx] }
}
function cancelEdit() {
  editIdx.value = null
  editProduct.value = { name: '', price: null }
}
function remove(idx) {
  const name = products.value[idx]?.name
  if (productHasSales(name)) return
  let updated = [...products.value]
  updated.splice(idx, 1)
  emit('update', updated)
}

function productHasSales(name) {
  if (!sales?.value || !Array.isArray(sales.value)) return false
  const target = String(name).trim().toLowerCase()
  return sales.value.some(sale =>
    Array.isArray(sale.items) &&
    sale.items.some(it => String(it.product).trim().toLowerCase() === target)
  )
}
</script>
