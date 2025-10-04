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
          <v-list-item v-for="(p, idx) in products" :key="idx" class="py-2 px-2 mb-1 bg-grey-lighten-3 rounded" :class="getQty(p.name) < 0 ? 'bg-red-lighten-4' : ''">
            <template #prepend>
              <div class="d-flex flex-column">                
                <span class="text-body-2 font-weight-medium">{{ p.name }}</span>
                <span class="text-caption text-blue-accent-4">
                  <span
                    v-if="useScarf"
                    class="currency-icon"
                    role="img"
                    aria-label="Lenço"
                  ></span>
                  <span v-else class="currency-text" aria-hidden="true">€</span>
                  {{ p.price.toFixed(2) }}
                </span>
              </div>
            </template>
            <template #append>
              <div class="d-flex align-center">
                <v-btn icon size="small" @click="decrement(p.name)">
                  <v-icon size="large">mdi-minus</v-icon>
                </v-btn>
                <v-chip size="large" class="mx-1" :color="getQty(p.name) < 0 ? 'red' : 'primary'" variant="elevated">{{ getQty(p.name) }}</v-chip>
                <v-btn icon size="small" @click="increment(p.name)">
                  <v-icon size="large">mdi-plus</v-icon>
                </v-btn>
              </div>
            </template>
          </v-list-item>
        </v-list>
      </div>
      <v-divider class="my-2" v-if="selectedItems.length && !saleComplete" />
      <div v-if="selectedItems.length && !saleComplete">
        <div class="text-end mb-4">
          Total:
          <strong>
            <span
              v-if="useScarf"
              class="currency-icon"
              role="img"
              aria-label="Lenço"
            ></span>
            <span v-else class="currency-text" aria-hidden="true">€</span>
            {{ total }}
          </strong>
        </div>
        <v-form @submit.prevent="finalizeSale">
          <v-text-field
            v-model.number="given"
            label="Valor dado pelo cliente — opcional"
            type="number"
            inputmode="decimal"
            density="comfortable"
            hide-details
            class="mb-4"
          >
            <template #prepend-inner>
              <span
                v-if="useScarf"
                class="currency-icon currency-icon--input"
                role="img"
                aria-label="Lenço"
              ></span>
              <span v-else class="currency-text currency-text--input" aria-hidden="true">€</span>
            </template>
          </v-text-field>
          <v-btn type="submit" color="success" block class="mb-2">Finalizar Venda e Calcular Troco</v-btn>
        </v-form>
      </div>
      <!-- Resumo -->
      <div v-if="saleComplete" class="pa-4 bg-grey-lighten-4 rounded">
        <h3 class="text-h6 mb-3 text-center text-primary">Resumo da Venda</h3>
        <v-list density="compact" class="bg-transparent">
          <v-list-item v-for="(item, idx) in lastSale.items" :key="idx">
            <v-list-item-title class="text-body-2" :class="item.quantity < 0 ? 'text-red' : ''">
              {{ item.product }} × {{ item.quantity }} @
              <span
                v-if="useScarf"
                class="currency-icon"
                role="img"
                aria-label="Lenço"
              ></span>
              <span v-else class="currency-text" aria-hidden="true">€</span>
              {{ getUnitPrice(item.product) }}
              =
              <strong>
                <span
                  v-if="useScarf"
                  class="currency-icon"
                  role="img"
                  aria-label="Lenço"
                ></span>
                <span v-else class="currency-text" aria-hidden="true">€</span>
                {{ getProductPrice(item.product, item.quantity) }}
              </strong>
            </v-list-item-title>
          </v-list-item>
        </v-list>
        <v-divider class="my-3" />
        <div class="text-end text-h6">
          Total:
          <strong :class="lastSale.total < 0 ? 'text-red' : 'text-success'">
            <span
              v-if="useScarf"
              class="currency-icon"
              role="img"
              aria-label="Lenço"
            ></span>
            <span v-else class="currency-text" aria-hidden="true">€</span>
            {{ lastSale.total.toFixed(2) }}
          </strong>
        </div>
        <div class="text-end text-h6">
          Valor dado:
          <strong class="text-warning">
            <span
              v-if="useScarf"
              class="currency-icon"
              role="img"
              aria-label="Lenço"
            ></span>
            <span v-else class="currency-text" aria-hidden="true">€</span>
            {{ lastSale.given.toFixed(2) }}
          </strong>
        </div>
        <div class="text-end text-h5">
          <template v-if="lastSale.total < 0">Devolver:</template>
          <template v-else>Troco:</template>
          <strong class="text-error">
            <span
              v-if="useScarf"
              class="currency-icon"
              role="img"
              aria-label="Lenço"
            ></span>
            <span v-else class="currency-text" aria-hidden="true">€</span>
            {{ lastSale.change }}
          </strong>
        </div>
        <v-btn color="secondary" block class="mt-4" @click="gerarTalao">Gerar Talão</v-btn>
        <v-btn color="primary" block class="mt-2" @click="novaVenda">Nova Venda</v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>
<script setup>
import { ref, computed, toRefs, inject } from 'vue'
const props = defineProps(['products', 'eventName'])
const emit = defineEmits(['sale-registered'])
const { products } = toRefs(props)
const { eventName } = toRefs(props)

const currencyPreference = inject('currencyPreference', ref('scarf'))
const useScarf = computed(() => (currencyPreference?.value || 'scarf') === 'scarf')
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
  quantities.value[name] = q - 1
  saleComplete.value = false
}
function getProductPrice(name, quantity) {
  const p = products.value.find(x => x.name === name)
  return p ? (p.price * quantity).toFixed(2) : '0.00'
}
const selectedItems = computed(() => {
  return products.value
    .map(p => ({ product: p.name, quantity: getQty(p.name) }))
    .filter(i => i.quantity !== 0)
})
const total = computed(() => selectedItems.value.reduce((acc, item) => {
  const p = products.value.find(x => x.name === item.product)
  return acc + ((p?.price || 0) * item.quantity)
}, 0).toFixed(2))
function finalizeSale() {
  if (!selectedItems.value.length) return
  let valorDado
  if (given.value == null || given.value === '') {
    valorDado = Number(total.value) > 0 ? Number(total.value) : 0
  } else {
    valorDado = Number(given.value)
  }
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
  const iconSrc = '/lenco.png'
  const iconSize = 16
  const iconSpacing = 6
  const useIcon = useScarf.value

  const lines = []

  lines.push({ type: 'center', text: eventName.value || 'Venda' })
  lines.push({ type: 'center', text: '----------------' })
  lastSale.value.items.forEach(it => {
    const total = getProductPrice(it.product, it.quantity)
    lines.push({
      type: 'row',
      left: it.product + ' x' + it.quantity,
      right: { text: total, icon: useIcon }
    })
  })
  lines.push({ type: 'center', text: '----------------' })
  lines.push({
    type: 'row',
    left: 'Total',
    right: { text: lastSale.value.total.toFixed(2), icon: useIcon }
  })
  lines.push({
    type: 'row',
    left: 'Valor dado',
    right: { text: lastSale.value.given.toFixed(2), icon: useIcon }
  })
  lines.push({
    type: 'row',
    left: lastSale.value.total < 0 ? 'Devolver' : 'Troco',
    right: { text: lastSale.value.change, icon: useIcon }
  })
  lines.push({ type: 'center', text: '----------------' })
  lines.push({ type: 'center', text: formatDatePT(lastSale.value.date) })
  lines.push({ type: 'center', text: 'Este talão não tem valor legal.' })

  canvas.width = width
  canvas.height = margin * 2 + lines.length * lineHeight

  const draw = icon => {
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#000'
    ctx.font = '16px sans-serif'
    ctx.textBaseline = 'middle'

    lines.forEach((line, idx) => {
      const y = margin + idx * lineHeight + lineHeight / 2
      if (line.type === 'center') {
        ctx.textAlign = 'center'
        ctx.fillText(line.text, width / 2, y)
      } else if (line.type === 'row') {
        ctx.textAlign = 'left'
        ctx.fillText(line.left, margin, y)

        const rightX = width - margin
        const rightText = typeof line.right === 'string' ? line.right : line.right.text
        ctx.textAlign = 'right'
        ctx.fillText(rightText, rightX, y)

        const showIcon = typeof line.right === 'object' && line.right.icon && icon
        if (showIcon) {
          const textWidth = ctx.measureText(rightText).width
          const iconX = rightX - textWidth - iconSpacing - iconSize
          const iconY = y - iconSize / 2
          ctx.drawImage(icon, iconX, iconY, iconSize, iconSize)
        }
      }
    })

    canvas.toBlob(blob => {
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank')
    }, 'image/png')
  }

  if (!useIcon) {
    draw(null)
    return
  }

  const icon = new Image()
  icon.src = iconSrc
  if (icon.complete) {
    draw(icon)
  } else {
    icon.onload = () => draw(icon)
    icon.onerror = () => draw(null)
  }
}
function novaVenda() {
  quantities.value = {}
  given.value = null
  change.value = null
  saleComplete.value = false
  lastSale.value = { items: [], total: 0, given: 0, change: 0 }
}
</script>
