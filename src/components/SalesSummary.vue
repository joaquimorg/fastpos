<template>
  <div v-if="sales.length" class="summary-content">
    <section class="metrics-grid" aria-label="Totais do dia">
      <v-card class="surface-card metric-card" elevation="0"><v-card-text><span class="metric-icon metric-icon--sales"><v-icon icon="mdi-trending-up" /></span><p>Vendas</p><strong class="metric-value numeric">{{ formatMoney(totalSales) }}</strong></v-card-text></v-card>
      <v-card class="surface-card metric-card" elevation="0"><v-card-text><span class="metric-icon metric-icon--returns"><v-icon icon="mdi-arrow-u-left-top" /></span><p>Devoluções</p><strong class="metric-value numeric">{{ formatMoney(totalReturns) }}</strong></v-card-text></v-card>
      <v-card class="surface-card metric-card metric-card--net" elevation="0"><v-card-text><span class="metric-icon"><v-icon icon="mdi-wallet-outline" /></span><p>Total líquido</p><strong class="metric-value numeric">{{ formatMoney(totalNet) }}</strong></v-card-text></v-card>
    </section>

    <v-card class="surface-card breakdown-card" elevation="0">
      <v-card-text class="pa-5 pa-md-6">
        <div class="summary-header"><div><h2>Movimento por produto</h2><p>{{ sales.length }} {{ sales.length === 1 ? 'operação registada' : 'operações registadas' }}</p></div><v-btn color="secondary" variant="tonal" prepend-icon="mdi-receipt-text-outline" @click="gerarTalaoResumo">Gerar talão resumo</v-btn></div>
        <div class="summary-table" role="table" aria-label="Resumo por produto">
          <div class="summary-table__head" role="row"><span role="columnheader">Produto</span><span role="columnheader">Tipo</span><span role="columnheader">Qtd.</span><span role="columnheader">Total</span></div>
          <div v-for="stat in salesStats" :key="`sale-${stat.product}`" class="summary-table__row" role="row"><strong role="cell">{{ stat.product }}</strong><span role="cell"><v-chip size="x-small" color="success" variant="tonal">Venda</v-chip></span><span role="cell" class="numeric" data-label="Quantidade">{{ stat.quantity }}</span><b role="cell" class="numeric" data-label="Total">{{ formatMoney(stat.total) }}</b></div>
          <div v-for="stat in returnStats" :key="`return-${stat.product}`" class="summary-table__row summary-table__row--return" role="row"><strong role="cell">{{ stat.product }}</strong><span role="cell"><v-chip size="x-small" color="error" variant="tonal">Devolução</v-chip></span><span role="cell" class="numeric" data-label="Quantidade">{{ stat.quantity }}</span><b role="cell" class="numeric text-error" data-label="Total">− {{ formatMoney(stat.total) }}</b></div>
        </div>
        <div class="close-day"><div><strong>Terminou a operação?</strong><p>O dia será arquivado no dispositivo{{ sheetsConnected ? ' e enviado para o Google Sheets' : '' }}.</p></div><v-btn color="primary" variant="flat" prepend-icon="mdi-calendar-check-outline" @click="closeDialog = true">Fechar dia</v-btn></div>
      </v-card-text>
    </v-card>
  </div>

  <v-card v-else class="surface-card" elevation="0"><div class="empty-state summary-empty"><span class="empty-state__icon"><v-icon icon="mdi-chart-box-outline" size="30" /></span><h2>O dia ainda está a começar</h2><p>As vendas e devoluções registadas vão aparecer aqui.</p><v-btn to="/" color="primary" prepend-icon="mdi-cash-register" class="mt-3">Registar primeira venda</v-btn></div></v-card>

  <v-dialog v-model="closeDialog" max-width="440">
    <v-card rounded="xl"><v-card-text class="pa-6"><span class="close-icon"><v-icon icon="mdi-calendar-check-outline" /></span><h2 class="dialog-title">Fechar o dia?</h2><p class="dialog-copy">As vendas ficam arquivadas em segurança. {{ sheetsConnected ? 'Será criada ou atualizada a aba de hoje no seu relatório.' : 'Pode ligar o Google Sheets mais tarde para as sincronizar.' }}</p></v-card-text><v-card-actions class="pa-4 pt-0"><v-spacer /><v-btn variant="text" :disabled="closing" @click="closeDialog = false">Cancelar</v-btn><v-btn color="primary" :loading="closing" @click="confirmCloseDay">Fechar dia</v-btn></v-card-actions></v-card>
  </v-dialog>

  <v-snackbar v-model="showFeedback" :color="feedback.color" timeout="6000" location="top"><v-icon :icon="feedback.icon" class="mr-2" />{{ feedback.message }}<template #actions><v-btn variant="text" @click="showFeedback = false">Fechar</v-btn></template></v-snackbar>
</template>

<script setup>
import { computed, inject, ref } from 'vue'
const props = defineProps({ sales: { type: Array, required: true }, products: { type: Array, default: () => [] } })
const closeDay = inject('closeDay'); const googleSheetsSettings = inject('googleSheetsSettings', ref({}))
const closeDialog = ref(false); const closing = ref(false); const showFeedback = ref(false); const feedback = ref({ color: 'success', icon: 'mdi-check-circle-outline', message: '' }); const currencyPreference = inject('currencyPreference', ref('scarf')); const eventName = inject('eventName', ref(''))
const useScarf = computed(() => (currencyPreference?.value || 'scarf') === 'scarf')
const sheetsConnected = computed(() => Boolean(googleSheetsSettings.value?.spreadsheetId))
const getProductPrice = name => Number(props.products.find(p => String(p.name).trim().toLowerCase() === String(name).trim().toLowerCase())?.price || 0)
function aggregate(returns = false) { const result = {}; for (const sale of props.sales) { if (!Array.isArray(sale.items)) continue; for (const item of sale.items) { if (returns ? item.quantity >= 0 : item.quantity <= 0) continue; const key = String(item.product).trim().toLowerCase(); if (!result[key]) result[key] = { product: item.product, quantity: 0, total: 0 }; const qty = Math.abs(item.quantity); const unitPrice = Number.isFinite(Number(item.unitPrice)) ? Number(item.unitPrice) : getProductPrice(item.product); result[key].quantity += qty; result[key].total += unitPrice * qty } } return Object.values(result) }
const salesStats = computed(() => aggregate(false)); const returnStats = computed(() => aggregate(true))
const totalSales = computed(() => salesStats.value.reduce((sum, stat) => sum + stat.total, 0)); const totalReturns = computed(() => returnStats.value.reduce((sum, stat) => sum + stat.total, 0)); const totalNet = computed(() => totalSales.value - totalReturns.value)
function formatMoney(value) { return useScarf.value ? `${Number(value).toFixed(2)} lenços` : `€ ${Number(value).toFixed(2)}` }
function formatDatePT(dateStr) { return new Date(dateStr).toLocaleString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }) }
async function confirmCloseDay() {
  closing.value = true
  const result = await closeDay()
  closing.value = false; closeDialog.value = false
  if (result.synced) feedback.value = { color: 'success', icon: 'mdi-cloud-check-outline', message: 'Dia fechado e relatório atualizado no Google Sheets.' }
  else if (result.reason === 'not-connected') feedback.value = { color: 'info', icon: 'mdi-content-save-check-outline', message: 'Dia fechado e guardado no dispositivo. Pode ligar o Google Sheets nas definições.' }
  else feedback.value = { color: 'warning', icon: 'mdi-cloud-alert-outline', message: 'Dia guardado no dispositivo. A sincronização pode ser repetida nas definições.' }
  showFeedback.value = true
}
function gerarTalaoResumo() {
  if (!salesStats.value.length && !returnStats.value.length) return
  const canvas = document.createElement('canvas'); const ctx = canvas.getContext('2d'); const lineHeight = 20; const margin = 20; const width = 280; const useIcon = useScarf.value
  const lines = [{ type: 'center', text: eventName?.value || 'Evento' }, { type: 'center', text: 'Resumo do Dia' }, { type: 'center', text: '----------------' }]
  salesStats.value.forEach(st => lines.push({ type: 'row', left: `${st.product} x${st.quantity}`, right: { text: st.total.toFixed(2), icon: useIcon } }))
  if (returnStats.value.length) { lines.push({ type: 'center', text: '----------------' }, { type: 'center', text: 'Devoluções' }); returnStats.value.forEach(st => lines.push({ type: 'row', left: `${st.product} x${st.quantity}`, right: { text: st.total.toFixed(2), icon: useIcon } })) }
  lines.push({ type: 'center', text: '----------------' }, { type: 'row', left: 'Total Vendas', right: { text: totalSales.value.toFixed(2), icon: useIcon } }, { type: 'row', left: 'Total Devoluções', right: { text: totalReturns.value.toFixed(2), icon: useIcon } }, { type: 'row', left: 'Total Real', right: { text: totalNet.value.toFixed(2), icon: useIcon } }, { type: 'center', text: '----------------' }, { type: 'center', text: formatDatePT(new Date().toISOString()) }, { type: 'center', text: 'Este talão não tem valor legal.' })
  canvas.width = width; canvas.height = margin * 2 + lines.length * lineHeight
  const draw = icon => { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, width, canvas.height); ctx.fillStyle = '#000'; ctx.font = '16px sans-serif'; ctx.textBaseline = 'middle'; lines.forEach((line, idx) => { const y = margin + idx * lineHeight + lineHeight / 2; if (line.type === 'center') { ctx.textAlign = 'center'; ctx.fillText(line.text, width / 2, y) } else { ctx.textAlign = 'left'; ctx.fillText(line.left, margin, y); ctx.textAlign = 'right'; ctx.fillText(line.right.text, width - margin, y); if (line.right.icon && icon) { const tw = ctx.measureText(line.right.text).width; ctx.drawImage(icon, width - margin - tw - 22, y - 8, 16, 16) } } }); canvas.toBlob(blob => window.open(URL.createObjectURL(blob), '_blank'), 'image/png') }
  if (!useIcon) return draw(null)
  const icon = new Image(); icon.src = '/lenco.png'; if (icon.complete) draw(icon); else { icon.onload = () => draw(icon); icon.onerror = () => draw(null) }
}
</script>

<style scoped>
.summary-content { display: grid; gap: 24px; }
.metrics-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.metric-card .v-card-text { position: relative; padding: 22px; }
.metric-card p { margin: 18px 0 4px; color: var(--pos-muted); font-size: .8rem; font-weight: 600; }
.metric-card strong { color: var(--pos-navy); font-size: clamp(1.45rem, 3vw, 2rem); }
.metric-icon { display: grid; place-items: center; width: 42px; height: 42px; color: var(--pos-navy); background: #eaf0ec; border-radius: 13px; }
.metric-icon--sales { color: #207a55; background: #e6f5ee; }
.metric-icon--returns { color: var(--pos-danger); background: #fbeaec; }
.metric-card--net { color: white; background: var(--pos-navy) !important; }
.metric-card--net p, .metric-card--net strong { color: white; }
.metric-card--net .metric-icon { color: var(--pos-navy); background: var(--pos-accent); }
.summary-header { display: flex; align-items: start; justify-content: space-between; gap: 20px; margin-bottom: 22px; }
.summary-header h2, .summary-header p { margin: 0; }
.summary-header h2 { color: var(--pos-navy); font: 700 1.2rem 'Outfit', sans-serif; }
.summary-header p { margin-top: 3px; color: var(--pos-muted); font-size: .82rem; }
.summary-table__head, .summary-table__row { display: grid; grid-template-columns: minmax(140px, 1fr) 120px 70px 110px; align-items: center; gap: 12px; }
.summary-table__head { padding: 10px 14px; color: var(--pos-muted); border-bottom: 1px solid var(--pos-line); font-size: .72rem; font-weight: 700; text-transform: uppercase; }
.summary-table__row { min-height: 58px; padding: 9px 14px; border-bottom: 1px solid #edf1ee; }
.summary-table__row > :last-child, .summary-table__head > :last-child { text-align: right; }
.summary-table__row > :nth-child(3), .summary-table__head > :nth-child(3) { text-align: center; }
.summary-table__row strong { color: var(--pos-navy); }
.summary-table__row--return { background: #fffafa; }
.close-day { display: flex; align-items: center; justify-content: space-between; gap: 20px; margin-top: 24px; padding: 18px 20px; border: 1px solid #f1d9dc; border-radius: 16px; background: #fffafa; }
.close-day strong, .close-day p { margin: 0; }
.close-day strong { color: var(--pos-navy); }
.close-day p { margin-top: 2px; color: var(--pos-muted); font-size: .8rem; }
.summary-empty h2 { margin: 0 0 6px; color: var(--pos-navy); font: 700 1.3rem 'Outfit', sans-serif; }
.summary-empty p { margin: 0; }
.danger-icon { display: grid; place-items: center; width: 48px; height: 48px; color: var(--pos-danger); background: #fbeaec; border-radius: 14px; }
.close-icon { display: grid; place-items: center; width: 48px; height: 48px; color: #176b34; background: #e9f6ed; border-radius: 14px; }
.dialog-title { margin: 16px 0 6px; color: var(--pos-navy); font: 700 1.35rem 'Outfit', sans-serif; }
.dialog-copy { margin: 0; color: var(--pos-muted); line-height: 1.5; }
@media (max-width: 767px) {
  .summary-content { gap: 16px; }
  .metrics-grid { grid-template-columns: 1fr 1fr; gap: 10px; }
  .metric-card .v-card-text { padding: 14px; }
  .metric-card p { margin: 12px 0 2px; font-size: .72rem; }
  .metric-card strong { font-size: 1.2rem; }
  .metric-card--net { grid-column: 1 / -1; }
  .metric-card--net .v-card-text { display: grid; grid-template-columns: 44px 1fr; align-items: center; column-gap: 12px; }
  .metric-card--net p { align-self: end; margin: 0; }
  .metric-card--net strong { grid-column: 2; }
  .summary-header, .close-day { align-items: stretch; flex-direction: column; }
  .summary-header .v-btn, .close-day .v-btn { width: 100%; }
  .summary-table__head { display: none; }
  .summary-table { display: grid; gap: 10px; }
  .summary-table__row { grid-template-columns: 1fr auto; gap: 8px 12px; min-width: 0; min-height: 0; padding: 14px; border: 1px solid var(--pos-line); border-radius: 14px; }
  .summary-table__row > :nth-child(3), .summary-table__row > :last-child { display: flex; justify-content: space-between; grid-column: 1 / -1; padding-top: 8px; border-top: 1px solid #edf1ee; text-align: right; }
  .summary-table__row > [data-label]::before { content: attr(data-label); color: var(--pos-muted); font-size: .72rem; font-weight: 600; }
  .close-day { margin-top: 18px; padding: 16px; }
}
</style>
