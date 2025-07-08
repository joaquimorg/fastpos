<template>
  <v-card class="mx-auto my-2" max-width="480" elevation="5">
    <v-card-title class="text-h6 text-center">{{ eventName.value || 'Registar Venda' }}</v-card-title>
    <v-card-text class="pa-2">
      <v-form @submit.prevent="addItem" v-if="!saleComplete">
        <v-row class="g-1" align="center">
          <v-col cols="12">
            <v-select :items="products" item-title="name" item-value="name" label="Produto"
              v-model="currentItem.product" density="comfortable" hide-details required />
          </v-col>
          <v-col cols="12">
            <v-text-field v-model.number="currentItem.quantity" label="Quantidade" type="number" min="1"
              density="comfortable" hide-details required inputmode="numeric" />
          </v-col>
          <v-col cols="12" v-if="currentPrice > 0">
            <div class="text-body-2 text-end">Preço unitário: <strong>€{{ currentPrice.toFixed(2) }}</strong></div>
          </v-col>
        </v-row>
        <v-btn type="submit" color="primary" block class="my-2">Adicionar à venda</v-btn>
      </v-form>
      <v-list v-if="cart.length && !saleComplete" density="compact" class="bg-transparent">
        <v-list-item v-for="(item, idx) in cart" :key="idx" class="py-1 px-0">
          <v-list-item-title class="text-body-2">
            {{ item.product }} × {{ item.quantity }} @ €{{ getUnitPrice(item.product) }} = <strong>€{{
              getProductPrice(item.product, item.quantity) }}</strong>
          </v-list-item-title>
          <template #append>
            <v-btn icon @click="removeItem(idx)" size="x-small" color="red">
              <v-icon size="x-small">mdi-delete</v-icon>
            </v-btn>
          </template>
        </v-list-item>
      </v-list>
      <v-divider class="my-2" v-if="cart.length && !saleComplete" />
      <div v-if="cart.length && !saleComplete">
        <div class="text-end mb-4">Total: <strong>€{{ total }}</strong></div>
        <v-form @submit.prevent="finalizeSale">
          <v-text-field v-model.number="given" label="Valor dado pelo cliente (€) — opcional" type="number"
            inputmode="decimal" density="comfortable" hide-details class="mb-4" />
          <v-btn type="submit" color="success" block class="mb-2">Finalizar Venda e Calcular Troco</v-btn>
        </v-form>
      </div>
      <!-- Resumo -->
      <div v-if="saleComplete" class="pa-4 bg-grey-lighten-4 rounded">
        <h3 class="text-h6 mb-3 text-center text-primary">Resumo da Venda</h3>
        <v-list density="compact" class="bg-transparent">
          <v-list-item v-for="(item, idx) in lastSale.items" :key="idx">
            <v-list-item-title class="text-body-2">
              {{ item.product }} × {{ item.quantity }} @ €{{ getUnitPrice(item.product) }} = <strong>€{{ getProductPrice(item.product, item.quantity) }}</strong>
            </v-list-item-title>
          </v-list-item>
        </v-list>
        <v-divider class="my-3" />
        <div class="text-end text-h6">Total: <strong class="text-success">€{{ lastSale.total.toFixed(2) }}</strong>
        </div>
        <div class="text-end text-h6">Valor dado: <strong class="text-warning">€{{ lastSale.given.toFixed(2) }}</strong>
        </div>
        <div class="text-end text-h5">Troco: <strong class="text-error">€{{ lastSale.change }}</strong></div>
        <v-btn color="secondary" block class="mt-4" @click="gerarTalao">Gerar Talão</v-btn>
        <v-btn color="primary" block class="mt-2" @click="novaVenda">Nova Venda</v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>
<script setup>
import { ref, computed, toRefs, inject } from 'vue'
const props = defineProps(['products'])
const emit = defineEmits(['sale-registered'])
const { products } = toRefs(props)
const eventName = inject('eventName')

const currentItem = ref({ product: '', quantity: 1 })
const cart = ref([])
const given = ref(null)
const change = ref(null)
const saleComplete = ref(false)
const lastSale = ref({ items: [], total: 0, given: 0, change: 0 })

function getUnitPrice(name) {
  const p = products.value.find(x => x.name === name)
  return p ? p.price.toFixed(2) : '0.00'
}
const currentPrice = computed(() => {
  const p = products.value.find(x => x.name === currentItem.value.product)
  return p ? p.price : 0
})

function getProductPrice(name, quantity) {
  const p = products.value.find(x => x.name === name)
  return p ? (p.price * quantity).toFixed(2) : '0.00'
}

const total = computed(() => cart.value.reduce((acc, item) => {
  const p = products.value.find(x => x.name === item.product)
  return acc + ((p?.price || 0) * item.quantity)
}, 0).toFixed(2))

function addItem() {
  if (!currentItem.value.product || currentItem.value.quantity < 1) return
  cart.value.push({ ...currentItem.value })
  currentItem.value = { product: '', quantity: 1 }
  saleComplete.value = false
}
function removeItem(idx) {
  cart.value.splice(idx, 1)
}
function finalizeSale() {
  if (!cart.value.length) return
  let valorDado = (given.value == null || given.value === '') ? Number(total.value) : Number(given.value)
  change.value = (valorDado - total.value).toFixed(2)
  const reg = {
    items: cart.value.map(i => ({ ...i })),
    total: Number(total.value),
    given: valorDado,
    change: change.value,
    date: new Date().toISOString()
  }
  emit('sale-registered', reg)
  lastSale.value = reg
  saleComplete.value = true
}
function gerarTalao() {
  if (!lastSale.value.items.length) return
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  const lineHeight = 20
  const margin = 10
  const lines = []
  lines.push(eventName.value || 'Venda')
  lines.push('----------------')
  lastSale.value.items.forEach(it => {
    const total = getProductPrice(it.product, it.quantity)
    lines.push(`${it.product} x${it.quantity} = €${total}`)
  })
  lines.push('----------------')
  lines.push(`Total: €${lastSale.value.total.toFixed(2)}`)
  lines.push(`Valor dado: €${lastSale.value.given.toFixed(2)}`)
  lines.push(`Troco: €${lastSale.value.change}`)
  lines.push(new Date(lastSale.value.date).toLocaleString())
  lines.push('Este talão não tem valor legal')
  canvas.width = 280
  canvas.height = margin * 2 + lines.length * lineHeight
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#000'
  ctx.font = '16px sans-serif'
  lines.forEach((line, idx) => {
    ctx.fillText(line, margin, margin + idx * lineHeight)
  })
  const url = canvas.toDataURL('image/png')
  const link = document.createElement('a')
  link.href = url
  link.download = 'talao.png'
  link.click()
}
function novaVenda() {
  cart.value = []
  given.value = null
  change.value = null
  saleComplete.value = false
  lastSale.value = { items: [], total: 0, given: 0, change: 0 }
}
</script>
