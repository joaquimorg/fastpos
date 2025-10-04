<template>
  <v-card class="mx-auto my-4" max-width="480" elevation="5">
    <v-card-title class="text-h6 text-center">Resumo do Dia</v-card-title>
    <v-card-text>
      <v-list v-if="salesStats.length" density="compact" class="bg-transparent">
        <v-list-item v-for="(stat, idx) in salesStats" :key="`s-${idx}`">
          <v-list-item-title>
            <strong>{{ stat.product }}</strong>
            — {{ stat.quantity }} vendidos — Total:
            <span
              v-if="useScarf"
              class="currency-icon"
              role="img"
              aria-label="Lenço"
            ></span>
            <span v-else class="currency-text" aria-hidden="true">€</span>
            {{ stat.total.toFixed(2) }}
          </v-list-item-title>
        </v-list-item>
      </v-list>
      <v-divider class="my-2" v-if="salesStats.length"/>
      <v-list v-if="returnStats.length" density="compact" class="bg-transparent">
        <v-list-item v-for="(stat, idx) in returnStats" :key="`r-${idx}`">
          <v-list-item-title class="text-red">
            <strong>{{ stat.product }}</strong>
            — {{ stat.quantity }} devolvidos — Total:
            <span
              v-if="useScarf"
              class="currency-icon"
              role="img"
              aria-label="Lenço"
            ></span>
            <span v-else class="currency-text" aria-hidden="true">€</span>
            {{ stat.total.toFixed(2) }}
          </v-list-item-title>
        </v-list-item>
      </v-list>
      <v-divider class="my-2" v-if="salesStats.length || returnStats.length"/>
      <div class="text-end mb-2">
        <strong>Total de Vendas:</strong>
        <span
          v-if="useScarf"
          class="currency-icon"
          role="img"
          aria-label="Lenço"
        ></span>
        <span v-else class="currency-text" aria-hidden="true">€</span>
        {{ totalSales.toFixed(2) }}
      </div>
      <div class="text-end mb-2" v-if="returnStats.length">
        <strong>Total Devoluções:</strong>
        <span
          v-if="useScarf"
          class="currency-icon"
          role="img"
          aria-label="Lenço"
        ></span>
        <span v-else class="currency-text" aria-hidden="true">€</span>
        {{ totalReturns.toFixed(2) }}
      </div>
      <div class="text-end mb-2" v-if="returnStats.length">
        <strong>Total Real:</strong>
        <span
          v-if="useScarf"
          class="currency-icon"
          role="img"
          aria-label="Lenço"
        ></span>
        <span v-else class="currency-text" aria-hidden="true">€</span>
        {{ totalNet.toFixed(2) }}
      </div>
      <v-btn color="secondary" block class="mt-2" @click="gerarTalaoResumo">Gerar Talão Resumo</v-btn>
      <v-btn color="red" block class="mt-2" @click="$emit('close-day')">Fechar Dia</v-btn>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed, inject, ref } from 'vue'
const props = defineProps({
  sales: { type: Array, required: true },
  products: { type: Array, default: () => [] }
})

const currencyPreference = inject('currencyPreference', ref('scarf'))
const useScarf = computed(() => (currencyPreference?.value || 'scarf') === 'scarf')

const getProductPrice = (name) => {
  const match = props.products.find(p => String(p.name).trim().toLowerCase() === String(name).trim().toLowerCase())
  return match ? Number(match.price) : 0
}

const salesStats = computed(() => {
  const obj = {}
  for (const sale of props.sales) {
    if (!Array.isArray(sale.items)) continue
    for (const item of sale.items) {
      if (item.quantity <= 0) continue
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

const returnStats = computed(() => {
  const obj = {}
  for (const sale of props.sales) {
    if (!Array.isArray(sale.items)) continue
    for (const item of sale.items) {
      if (item.quantity >= 0) continue
      const key = String(item.product).trim().toLowerCase()
      if (!obj[key]) {
        obj[key] = { product: item.product, quantity: 0, total: 0 }
      }
      const unitPrice = getProductPrice(item.product)
      obj[key].quantity += Math.abs(item.quantity)
      obj[key].total += Math.abs(unitPrice * item.quantity)
    }
  }
  return Object.values(obj)
})

const totalSales = computed(() => salesStats.value.reduce((sum, st) => sum + st.total, 0))
const totalReturns = computed(() => returnStats.value.reduce((sum, st) => sum + st.total, 0))
const totalNet = computed(() => totalSales.value - totalReturns.value)

const eventName = inject('eventName', null)

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

function gerarTalaoResumo() {
  if (!salesStats.value.length && !returnStats.value.length) return
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

  lines.push({ type: 'center', text: eventName?.value || 'Evento' })
  lines.push({ type: 'center', text: 'Resumo do Dia' })
  lines.push({ type: 'center', text: '----------------' })
  salesStats.value.forEach(st => {
    lines.push({
      type: 'row',
      left: st.product + ' x' + st.quantity,
      right: { text: st.total.toFixed(2), icon: useIcon }
    })
  })
  if (returnStats.value.length) {
    lines.push({ type: 'center', text: '----------------' })
    lines.push({ type: 'center', text: 'Devoluções Anteriores' })
    returnStats.value.forEach(st => {
      lines.push({
        type: 'row',
        left: st.product + ' x' + st.quantity,
        right: { text: st.total.toFixed(2), icon: useIcon }
      })
    })
  }
  lines.push({ type: 'center', text: '----------------' })
  lines.push({
    type: 'row',
    left: 'Total Vendas',
    right: { text: totalSales.value.toFixed(2), icon: useIcon }
  })
  if (returnStats.value.length) {
    lines.push({
      type: 'row',
      left: 'Total Devoluções',
      right: { text: totalReturns.value.toFixed(2), icon: useIcon }
    })
    lines.push({
      type: 'row',
      left: 'Total Real',
      right: { text: totalNet.value.toFixed(2), icon: useIcon }
    })
  }
  lines.push({ type: 'center', text: '----------------' })
  lines.push({ type: 'center', text: formatDatePT(new Date().toISOString()) })
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
</script>
