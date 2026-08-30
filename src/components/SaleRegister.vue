<template>
  <div v-if="!saleComplete" class="sale-layout" :class="{ 'sale-layout--has-selection': selectedItems.length }">
    <v-card class="surface-card products-panel" elevation="0">
      <v-card-text class="pa-4 pa-md-6">
        <div class="panel-heading"><div><h2>Produtos</h2><p>{{ products.length ? 'Ajuste as quantidades para esta venda' : 'Configure o catálogo antes de começar' }}</p></div><v-btn v-if="selectedItems.length" variant="text" size="small" prepend-icon="mdi-refresh" @click="clearSelection">Limpar</v-btn></div>
        <div v-if="products.length" class="sale-products">
          <article v-for="p in products" :key="p.name" class="sale-product" :class="{ 'sale-product--selected': getQty(p.name) !== 0, 'sale-product--return': getQty(p.name) < 0 }">
            <div class="product-details"><strong>{{ p.name }}</strong><span class="numeric"><span v-if="useScarf" class="currency-icon" role="img" aria-label="Lenço"></span><span v-else class="currency-text" aria-hidden="true">€</span>{{ Number(p.price).toFixed(2) }}</span></div>
            <div class="quantity-control" :aria-label="`Quantidade de ${p.name}: ${getQty(p.name)}`">
              <v-btn icon="mdi-minus" variant="text" size="44" :aria-label="`Diminuir quantidade de ${p.name}`" @click="decrement(p.name)" />
              <output class="quantity-value numeric" :class="{ 'text-error': getQty(p.name) < 0 }">{{ getQty(p.name) }}</output>
              <v-btn icon="mdi-plus" color="primary" variant="tonal" size="44" :aria-label="`Aumentar quantidade de ${p.name}`" @click="increment(p.name)" />
            </div>
          </article>
        </div>
        <div v-else class="empty-state"><span class="empty-state__icon"><v-icon icon="mdi-package-variant-closed-remove" size="30" /></span><strong>Catálogo vazio</strong><span>Crie pelo menos um produto para registar vendas.</span><v-btn to="/produtos" color="primary" variant="tonal" class="mt-4" prepend-icon="mdi-plus">Criar produtos</v-btn></div>
      </v-card-text>
    </v-card>

    <v-card class="surface-card checkout-panel d-none d-md-block" elevation="0">
      <v-card-text class="pa-5 pa-md-6">
        <div class="panel-heading"><div><h2>Venda atual</h2><p>{{ selectedItems.length ? `${selectedItems.length} ${selectedItems.length === 1 ? 'produto selecionado' : 'produtos selecionados'}` : 'Nenhum produto selecionado' }}</p></div><span class="receipt-icon"><v-icon icon="mdi-receipt-text-outline" /></span></div>
        <div v-if="selectedItems.length" class="checkout-content">
          <div class="checkout-lines">
            <div v-for="item in selectedItems" :key="item.product" class="checkout-line"><div><strong>{{ item.product }}</strong><span :class="{ 'text-error': item.quantity < 0 }">{{ item.quantity < 0 ? 'Devolução' : 'Venda' }} · {{ item.quantity }} × {{ formatMoney(getUnitPriceNumber(item.product)) }}</span></div><b class="numeric" :class="{ 'text-error': item.quantity < 0 }">{{ formatMoney(getProductPriceNumber(item.product, item.quantity)) }}</b></div>
          </div>
          <div class="total-block"><span>Total</span><strong class="metric-value numeric" :class="{ 'text-error': Number(total) < 0 }">{{ formatMoney(Number(total)) }}</strong></div>
          <v-form @submit.prevent="finalizeSale">
            <v-text-field v-model.number="given" label="Valor recebido (opcional)" type="number" inputmode="decimal" step="0.01" min="0" variant="outlined" hint="Se ficar vazio, assume pagamento exato" persistent-hint>
              <template #prepend-inner><span v-if="useScarf" class="currency-icon currency-icon--input" role="img" aria-label="Lenço"></span><span v-else class="currency-text currency-text--input" aria-hidden="true">€</span></template>
            </v-text-field>
            <v-btn type="submit" color="primary" block size="large" prepend-icon="mdi-check-circle-outline">Concluir venda</v-btn>
          </v-form>
        </div>
        <div v-else class="checkout-empty"><v-icon icon="mdi-cursor-default-click-outline" size="30" /><p>Use os controlos <strong>+</strong> e <strong>−</strong> para adicionar vendas ou devoluções.</p></div>
      </v-card-text>
    </v-card>

    <div v-if="selectedItems.length" class="mobile-sale-bar d-flex d-md-none" role="region" aria-label="Resumo da venda atual">
      <div class="mobile-sale-bar__summary" aria-live="polite">
        <span>{{ selectedItems.length }} {{ selectedItems.length === 1 ? 'artigo' : 'artigos' }}</span>
        <strong class="numeric">{{ formatMoney(Number(total)) }}</strong>
      </div>
      <v-btn color="accent" class="mobile-sale-bar__button" append-icon="mdi-arrow-right" @click="mobileCheckout = true">Terminar venda</v-btn>
    </div>

    <v-dialog v-model="mobileCheckout" class="d-md-none" fullscreen transition="dialog-bottom-transition">
      <v-card class="mobile-checkout-sheet">
        <v-card-text class="px-5 pb-5">
          <div class="sheet-heading">
            <div><p>Venda atual</p><h2>Confirmar operação</h2></div>
            <v-btn icon="mdi-close" variant="text" size="48" aria-label="Fechar resumo da venda" @click="mobileCheckout = false" />
          </div>
          <div class="mobile-checkout-lines">
            <div v-for="item in selectedItems" :key="`mobile-${item.product}`" class="checkout-line">
              <div><strong>{{ item.product }}</strong><span :class="{ 'text-error': item.quantity < 0 }">{{ item.quantity < 0 ? 'Devolução' : 'Venda' }} · {{ item.quantity }} × {{ formatMoney(getUnitPriceNumber(item.product)) }}</span></div>
              <b class="numeric" :class="{ 'text-error': item.quantity < 0 }">{{ formatMoney(getProductPriceNumber(item.product, item.quantity)) }}</b>
            </div>
          </div>
          <div class="sheet-total"><span>Total</span><strong class="metric-value numeric" :class="{ 'text-error': Number(total) < 0 }">{{ formatMoney(Number(total)) }}</strong></div>
          <v-form @submit.prevent="finalizeSale">
            <v-text-field v-model.number="given" label="Valor recebido (opcional)" type="number" inputmode="decimal" step="0.01" min="0" variant="outlined" hint="Vazio significa pagamento exato" persistent-hint autofocus>
              <template #prepend-inner><span v-if="useScarf" class="currency-icon currency-icon--input" role="img" aria-label="Lenço"></span><span v-else class="currency-text currency-text--input" aria-hidden="true">€</span></template>
            </v-text-field>
            <v-btn type="submit" color="primary" block size="large" prepend-icon="mdi-check-circle-outline">Concluir venda</v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>

  <v-card v-else class="surface-card success-card" elevation="0">
    <v-card-text class="pa-5 pa-md-8">
      <div class="success-heading"><span><v-icon icon="mdi-check" size="32" /></span><p>Venda registada</p><h2>Operação concluída</h2><small>{{ formatDatePT(lastSale.date) }}</small></div>
      <div class="receipt-summary">
        <div v-for="item in lastSale.items" :key="item.product" class="receipt-row"><span>{{ item.product }} <small>× {{ item.quantity }}</small></span><strong class="numeric" :class="{ 'text-error': item.quantity < 0 }">{{ formatMoney(getProductPriceNumber(item.product, item.quantity)) }}</strong></div>
        <v-divider class="my-4" />
        <div class="receipt-total"><span>Total</span><strong class="numeric">{{ formatMoney(lastSale.total) }}</strong></div>
        <div class="receipt-meta"><span>Valor recebido</span><strong class="numeric">{{ formatMoney(lastSale.given) }}</strong></div>
        <div class="change-card"><span>{{ lastSale.total < 0 ? 'Valor a devolver' : 'Troco' }}</span><strong class="metric-value numeric">{{ formatMoney(Number(lastSale.change)) }}</strong></div>
      </div>
      <div class="success-actions"><v-btn color="secondary" variant="tonal" prepend-icon="mdi-receipt-text-outline" @click="gerarTalao">Gerar talão</v-btn><v-btn color="primary" prepend-icon="mdi-plus" @click="novaVenda">Nova venda</v-btn></div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, computed, toRefs, inject } from 'vue'
const props = defineProps({ products: { type: Array, required: true }, eventName: { type: String, default: '' } })
const emit = defineEmits(['sale-registered'])
const { products, eventName } = toRefs(props)
const currencyPreference = inject('currencyPreference', ref('scarf'))
const useScarf = computed(() => (currencyPreference?.value || 'scarf') === 'scarf')
const quantities = ref({}); const given = ref(null); const saleComplete = ref(false); const mobileCheckout = ref(false); const lastSale = ref({ items: [], total: 0, given: 0, change: 0, date: '' })
function formatDatePT(dateStr) { return new Date(dateStr).toLocaleString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }) }
function formatMoney(value) { const number = Number(value) || 0; return useScarf.value ? `${number.toFixed(2)} lenços` : `€ ${number.toFixed(2)}` }
function getUnitPriceNumber(name) { return Number(products.value.find(x => x.name === name)?.price || 0) }
function getQty(name) { return quantities.value[name] || 0 }
function increment(name) { quantities.value[name] = getQty(name) + 1 }
function decrement(name) { quantities.value[name] = getQty(name) - 1 }
function getProductPriceNumber(name, quantity) { return getUnitPriceNumber(name) * quantity }
const selectedItems = computed(() => products.value.map(p => {
  const quantity = getQty(p.name); const unitPrice = Number(p.price || 0)
  return { product: p.name, quantity, unitPrice, lineTotal: Number((unitPrice * quantity).toFixed(2)) }
}).filter(i => i.quantity !== 0))
const total = computed(() => selectedItems.value.reduce((sum, item) => sum + item.lineTotal, 0).toFixed(2))
function clearSelection() { quantities.value = {}; given.value = null }
function finalizeSale() {
  if (!selectedItems.value.length) return
  const totalNumber = Number(total.value); const received = given.value == null || given.value === '' ? Math.max(totalNumber, 0) : Number(given.value)
  const reg = { items: selectedItems.value.map(i => ({ ...i })), total: totalNumber, given: received, change: (received - totalNumber).toFixed(2), date: new Date().toISOString() }
  emit('sale-registered', reg); lastSale.value = reg; mobileCheckout.value = false; saleComplete.value = true
}
function gerarTalao() {
  if (!lastSale.value.items.length) return
  const canvas = document.createElement('canvas'); const ctx = canvas.getContext('2d'); const lineHeight = 20; const margin = 20; const width = 280; const useIcon = useScarf.value
  const lines = [{ type: 'center', text: eventName.value || 'Venda' }, { type: 'center', text: '----------------' }]
  lastSale.value.items.forEach(it => lines.push({ type: 'row', left: `${it.product} x${it.quantity}`, right: { text: getProductPriceNumber(it.product, it.quantity).toFixed(2), icon: useIcon } }))
  lines.push({ type: 'center', text: '----------------' }, { type: 'row', left: 'Total', right: { text: lastSale.value.total.toFixed(2), icon: useIcon } }, { type: 'row', left: 'Valor dado', right: { text: lastSale.value.given.toFixed(2), icon: useIcon } }, { type: 'row', left: lastSale.value.total < 0 ? 'Devolver' : 'Troco', right: { text: lastSale.value.change, icon: useIcon } }, { type: 'center', text: '----------------' }, { type: 'center', text: formatDatePT(lastSale.value.date) }, { type: 'center', text: 'Este talão não tem valor legal.' })
  canvas.width = width; canvas.height = margin * 2 + lines.length * lineHeight
  const draw = icon => { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.fillStyle = '#000'; ctx.font = '16px sans-serif'; ctx.textBaseline = 'middle'; lines.forEach((line, idx) => { const y = margin + idx * lineHeight + lineHeight / 2; if (line.type === 'center') { ctx.textAlign = 'center'; ctx.fillText(line.text, width / 2, y) } else { ctx.textAlign = 'left'; ctx.fillText(line.left, margin, y); const rightX = width - margin; ctx.textAlign = 'right'; ctx.fillText(line.right.text, rightX, y); if (line.right.icon && icon) { const textWidth = ctx.measureText(line.right.text).width; ctx.drawImage(icon, rightX - textWidth - 22, y - 8, 16, 16) } } }); canvas.toBlob(blob => window.open(URL.createObjectURL(blob), '_blank'), 'image/png') }
  if (!useIcon) return draw(null)
  const icon = new Image(); icon.src = '/lenco.png'; if (icon.complete) draw(icon); else { icon.onload = () => draw(icon); icon.onerror = () => draw(null) }
}
function novaVenda() { quantities.value = {}; given.value = null; saleComplete.value = false; lastSale.value = { items: [], total: 0, given: 0, change: 0, date: '' } }
</script>

<style scoped>
.sale-layout { display: grid; grid-template-columns: minmax(0, 1.35fr) minmax(310px, .65fr); gap: 24px; align-items: start; }
.panel-heading { display: flex; justify-content: space-between; align-items: start; gap: 16px; margin-bottom: 20px; }
.panel-heading h2, .panel-heading p { margin: 0; }
.panel-heading h2 { color: var(--pos-navy); font: 700 1.15rem 'Outfit', sans-serif; }
.panel-heading p { margin-top: 3px; color: var(--pos-muted); font-size: .82rem; }
.sale-products { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.sale-product { display: flex; align-items: center; justify-content: space-between; gap: 12px; min-height: 82px; padding: 12px; border: 1px solid var(--pos-line); border-radius: 16px; background: #fafbfa; transition: 160ms ease; }
.sale-product--selected { border-color: rgba(8,126,156,.35); background: #f0f9fa; }
.sale-product--return { border-color: rgba(189,59,67,.3); background: #fff7f7; }
.product-details { min-width: 0; }
.product-details strong, .product-details > span { display: block; overflow-wrap: anywhere; }
.product-details strong { color: var(--pos-navy); line-height: 1.25; }
.product-details > span { margin-top: 5px; color: var(--pos-primary-dark); font-size: .78rem; font-weight: 700; }
.quantity-control { display: flex; flex: 0 0 auto; align-items: center; gap: 2px; }
.quantity-value { display: grid; place-items: center; min-width: 30px; color: var(--pos-navy); font-size: 1rem; font-weight: 800; }
.checkout-panel { position: sticky; top: 24px; }
.receipt-icon { display: grid; place-items: center; width: 42px; height: 42px; color: var(--pos-primary); background: #e8f5f7; border-radius: 13px; }
.checkout-lines { display: grid; gap: 12px; }
.checkout-line { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.checkout-line strong, .checkout-line span { display: block; }
.checkout-line strong { color: var(--pos-navy); font-size: .88rem; }
.checkout-line span { margin-top: 2px; color: var(--pos-muted); font-size: .72rem; }
.checkout-line b { color: var(--pos-navy); font-size: .86rem; }
.total-block { display: flex; align-items: center; justify-content: space-between; margin: 22px -24px 20px; padding: 18px 24px; color: white; background: var(--pos-navy); }
.total-block span { font-size: .82rem; font-weight: 600; }
.total-block strong { font-size: 1.7rem; }
.checkout-empty { display: grid; justify-items: center; padding: 44px 12px; color: #8a999e; text-align: center; }
.checkout-empty p { max-width: 245px; margin: 14px 0 0; font-size: .85rem; line-height: 1.55; }
.mobile-sale-bar { position: fixed; z-index: 28; right: 8px; bottom: calc(60px + env(safe-area-inset-bottom)); left: 8px; align-items: center; gap: 8px; min-height: 58px; padding: 6px 6px 6px 14px; color: white; background: var(--pos-navy); border: 1px solid rgba(255,255,255,.12); border-radius: 14px 14px 0 0; box-shadow: 0 -6px 22px rgba(17,45,56,.18); }
.mobile-sale-bar__summary { display: flex; flex: 1; min-width: 0; align-items: flex-start; justify-content: center; flex-direction: column; min-height: 46px; padding: 0; color: inherit; }
.mobile-sale-bar__summary span { color: #afc3c9; font-size: .72rem; font-weight: 600; }
.mobile-sale-bar__summary strong { overflow: hidden; width: 100%; font-size: 1.05rem; text-overflow: ellipsis; white-space: nowrap; }
.mobile-sale-bar__button { color: var(--pos-navy) !important; }
.mobile-checkout-sheet { min-height: 100dvh; padding: calc(10px + env(safe-area-inset-top)) 0 env(safe-area-inset-bottom); overflow-y: auto; background: #fff !important; }
.sheet-heading { position: sticky; z-index: 2; top: calc(-10px - env(safe-area-inset-top)); display: flex; align-items: center; justify-content: space-between; margin: 0 -20px 20px; padding: 10px 20px; border-bottom: 1px solid var(--pos-line); background: rgba(255,255,255,.96); }
.sheet-heading p, .sheet-heading h2 { margin: 0; }
.sheet-heading p { color: var(--pos-primary); font-size: .72rem; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; }
.sheet-heading h2 { margin-top: 2px; color: var(--pos-navy); font: 700 1.45rem 'Outfit', sans-serif; }
.mobile-checkout-lines { display: grid; gap: 13px; max-height: 26dvh; padding-right: 3px; overflow-y: auto; overscroll-behavior: contain; }
.sheet-total { display: flex; align-items: center; justify-content: space-between; margin: 20px -20px; padding: 17px 20px; color: white; background: var(--pos-navy); }
.sheet-total span { font-size: .82rem; font-weight: 700; }
.sheet-total strong { font-size: 1.55rem; }
.success-card { max-width: 680px; margin-inline: auto; }
.success-heading { text-align: center; }
.success-heading > span { display: grid; place-items: center; width: 64px; height: 64px; margin: 0 auto 14px; color: var(--pos-navy); background: var(--pos-accent); border-radius: 20px; }
.success-heading p { margin: 0; color: var(--pos-primary); font-size: .78rem; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; }
.success-heading h2 { margin: 4px 0; color: var(--pos-navy); font: 700 1.65rem 'Outfit', sans-serif; }
.success-heading small { color: var(--pos-muted); }
.receipt-summary { max-width: 480px; margin: 28px auto; padding: 22px; border: 1px solid var(--pos-line); border-radius: 18px; background: #fafbfa; }
.receipt-row, .receipt-total, .receipt-meta { display: flex; justify-content: space-between; gap: 16px; }
.receipt-row + .receipt-row { margin-top: 10px; }
.receipt-row small { color: var(--pos-muted); }
.receipt-total { color: var(--pos-navy); font-size: 1.05rem; font-weight: 800; }
.receipt-meta { margin-top: 8px; color: var(--pos-muted); font-size: .84rem; }
.change-card { display: flex; align-items: center; justify-content: space-between; gap: 20px; margin: 20px -10px -10px; padding: 18px; color: var(--pos-navy); background: var(--pos-accent); border-radius: 14px; }
.change-card span { font-size: .85rem; font-weight: 700; }
.change-card strong { font-size: 1.6rem; }
.success-actions { display: flex; justify-content: center; gap: 10px; }
@media (max-width: 1100px) { .sale-products { grid-template-columns: 1fr; } }
@media (max-width: 959px) { .sale-layout { grid-template-columns: 1fr; } .sale-layout--has-selection { padding-bottom: 62px; } .sale-products { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 599px) { .products-panel { box-shadow: 0 8px 26px rgba(24,51,59,.07) !important; } .products-panel > :deep(.v-card__underlay) { display: none; } .products-panel .v-card-text { padding: 12px !important; } .sale-products { grid-template-columns: 1fr; gap: 8px; } .sale-product { min-height: 76px; padding: 9px 8px 9px 12px; } .quantity-control { gap: 4px; } .quantity-control .v-btn { width: 48px !important; height: 48px !important; } .panel-heading { align-items: center; margin-bottom: 14px; } .panel-heading h2 { font-size: 1.1rem; } .panel-heading p { display: none; } .success-actions { flex-direction: column-reverse; } .success-actions .v-btn { width: 100%; } }
@media (max-width: 380px) { .mobile-sale-bar { right: 4px; left: 4px; gap: 5px; padding-left: 10px; } .mobile-sale-bar__summary strong { font-size: .92rem; } .mobile-sale-bar__button { min-width: 146px; padding-inline: 10px !important; } .product-details strong { font-size: .9rem; } }
</style>
