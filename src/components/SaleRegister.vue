<template>
  <v-card class="mx-auto my-2" max-width="480" elevation="5">
    <v-card-title class="text-h6 text-center">
      <template v-if="eventName">
        <strong class="text-success">{{ eventName }}</strong><br />
      </template>
      Registar Venda
    </v-card-title>
    <v-card-text class="pa-2">
      <div v-if="!saleComplete">
        <v-list density="compact" class="bg-transparent">
          <v-list-item v-for="(p, idx) in products" :key="idx" class="py-2 px-0">
            <template #prepend>
              <div class="d-flex flex-column">
                <span class="text-caption text-grey">{{ idx + 1 }}.</span>
                <span class="text-body-2 font-weight-medium">{{ p.name }}</span>
                <span class="text-caption text-grey">€{{ p.price.toFixed(2) }}</span>
              </div>
            </template>
            <template #append>
              <div class="d-flex align-center">
                <v-btn icon size="large" @click="decrement(p.name)" :disabled="getQty(p.name) === 0">
                  <v-icon size="large">mdi-minus</v-icon>
                </v-btn>
                <v-chip size="large" class="mx-1" color="primary" variant="elevated">{{ getQty(p.name) }}</v-chip>
                <v-btn icon size="large" @click="increment(p.name)">
                  <v-icon size="large">mdi-plus</v-icon>
                </v-btn>
              </div>
            </template>
          </v-list-item>
        </v-list>
      </div>
      <v-divider class="my-2" v-if="selectedItems.length && !saleComplete" />
      <div v-if="selectedItems.length && !saleComplete">
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
import { ref, computed, toRefs } from 'vue'
const props = defineProps(['products', 'eventName'])
const emit = defineEmits(['sale-registered'])
const { products } = toRefs(props)
const { eventName } = toRefs(props)

const quantities = ref({})
const given = ref(null)
const change = ref(null)
const saleComplete = ref(false)
const lastSale = ref({ items: [], total: 0, given: 0, change: 0 })

function formatDatePT(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

function getUnitPrice(name) {
  const p = products.value.find(x => x.name === name)
  return p ? p.price.toFixed(2) : '0.00'
}
function getQty(name) {
  return quantities.value[name] || 0
}
function increment(name) {
  quantities.value[name] = getQty(name) + 1
  saleComplete.value = false
}
function decrement(name) {
  const q = getQty(name)
  if (q > 0) {
    quantities.value[name] = q - 1
    saleComplete.value = false
  }
}
function getProductPrice(name, quantity) {
  const p = products.value.find(x => x.name === name)
  return p ? (p.price * quantity).toFixed(2) : '0.00'
}
const selectedItems = computed(() => {
  return products.value
    .map(p => ({ product: p.name, quantity: getQty(p.name) }))
    .filter(i => i.quantity > 0)
})
const total = computed(() => selectedItems.value.reduce((acc, item) => {
  const p = products.value.find(x => x.name === item.product)
  return acc + ((p?.price || 0) * item.quantity)
}, 0).toFixed(2))
function finalizeSale() {
  if (!selectedItems.value.length) return
  let valorDado = (given.value == null || given.value === '') ? Number(total.value) : Number(given.value)
  change.value = (valorDado - total.value).toFixed(2)
  const reg = {
    items: selectedItems.value.map(i => ({ ...i })),
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
  const margin = 20
  const width = 280
  const lines = []

  lines.push({ text: eventName.value || 'Venda', center: true })
  lines.push({ text: '----------------', center: true })
  lastSale.value.items.forEach(it => {
    const total = getProductPrice(it.product, it.quantity)
    lines.push({ left: `${it.product} x${it.quantity}`, right: `€${total}` })
  })
  lines.push({ text: '----------------', center: true })
  lines.push({ left: 'Total', right: `€${lastSale.value.total.toFixed(2)}` })
  lines.push({ left: 'Valor dado', right: `€${lastSale.value.given.toFixed(2)}` })
  lines.push({ left: 'Troco', right: `€${lastSale.value.change}` })
  lines.push({ text: '----------------', center: true })
  lines.push({ text: formatDatePT(lastSale.value.date), center: true })
  lines.push({ text: 'Este talão não tem valor legal.', center: true })

  canvas.width = width
  canvas.height = margin * 2 + lines.length * lineHeight
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#000'
  ctx.font = '16px sans-serif'

  lines.forEach((line, idx) => {
    const y = margin + idx * lineHeight
    if (line.center) {
      ctx.textAlign = 'center'
      ctx.fillText(line.text, width / 2, y)
    } else {
      ctx.textAlign = 'left'
      ctx.fillText(line.left, margin, y)
      ctx.textAlign = 'right'
      ctx.fillText(line.right, width - margin, y)
    }
  })

  canvas.toBlob(blob => {
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
  }, 'image/png')
}
function novaVenda() {
  quantities.value = {}
  given.value = null
  change.value = null
  saleComplete.value = false
  lastSale.value = { items: [], total: 0, given: 0, change: 0 }
}
</script>
