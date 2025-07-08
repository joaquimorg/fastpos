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
      <v-btn color="secondary" block class="mt-2" @click="gerarTalaoResumo">Gerar Talão Resumo</v-btn>
      <v-btn color="red" block class="mt-2" @click="$emit('close-day')">Fechar Dia</v-btn>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed, inject } from 'vue'
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
  if (!stats.value.length) return
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  const lineHeight = 20
  const margin = 20
  const width = 280
  const lines = []

  lines.push({ text: eventName?.value || 'Evento', center: true })
  lines.push({ text: 'Resumo do Dia', center: true })
  lines.push({ text: '----------------', center: true })
  stats.value.forEach(st => {
    lines.push({ left: `${st.product} x${st.quantity}`, right: `€${st.total.toFixed(2)}` })
  })
  lines.push({ text: '----------------', center: true })
  lines.push({ left: 'Total Vendas', right: `€${total.value.toFixed(2)}` })
  lines.push({ text: '----------------', center: true })
  lines.push({ text: formatDatePT(new Date().toISOString()), center: true })
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
</script>
