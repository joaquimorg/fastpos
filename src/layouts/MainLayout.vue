<template>
  <v-app>
    <a class="skip-link" href="#main-content">Saltar para o conteúdo</a>
    <aside class="desktop-sidebar d-none d-md-flex" aria-label="Navegação principal">
      <router-link to="/" class="brand-block" aria-label="fastPOS — página inicial">
        <span class="brand-mark"><img :src="logoSrc" alt="fastPOS" width="100" height="33" /></span>
        <span class="brand-copy">Ponto de venda</span>
      </router-link>
      <nav class="side-nav">
        <router-link v-for="item in navItems" :key="item.to" :to="item.to" class="side-nav__item">
          <v-icon :icon="item.icon" size="22" aria-hidden="true" /><span>{{ item.label }}</span>
        </router-link>
      </nav>
      <div class="sidebar-status">
        <span class="status-dot" :class="{ 'status-dot--pending': pendingReportsCount }" aria-hidden="true"></span>
        <div><strong>{{ pendingReportsCount ? `${pendingReportsCount} por sincronizar` : 'Dados protegidos' }}</strong><small>{{ googleSheetsSettings.spreadsheetId ? 'Google Sheets ligado' : 'Pronto para trabalhar offline' }}</small></div>
      </div>
      <footer class="sidebar-legal">
        <p>© {{ currentYear }} fastPOS<br><span>a product by <a href="https://joaquim.org" target="_blank" rel="noopener noreferrer">joaquim.org</a></span></p>
        <nav aria-label="Informação legal"><router-link to="/privacidade">Privacidade</router-link><router-link to="/termos">Termos</router-link></nav>
      </footer>
    </aside>
    <header class="mobile-header d-flex d-md-none">
      <router-link to="/" aria-label="fastPOS — página inicial"><img :src="logoSrc" alt="fastPOS" width="100" height="33" /></router-link>
      <span v-if="eventName" class="event-pill">{{ eventName }}</span>
    </header>
    <v-main class="app-main">
      <main id="main-content" tabindex="-1"><router-view /></main>
    </v-main>
    <nav class="mobile-nav" aria-label="Navegação principal">
      <router-link v-for="item in navItems" :key="item.to" :to="item.to" class="mobile-nav__item">
        <v-icon :icon="item.icon" size="23" aria-hidden="true" /><span>{{ item.shortLabel }}</span>
      </router-link>
    </nav>
  </v-app>
</template>

<script setup>
import { ref, provide, watch, nextTick, computed } from 'vue'
import { useRoute } from 'vue-router'
import { authorizeGoogleSheets, createSalesSpreadsheet, disconnectGoogleSheets, isGoogleSheetsAvailable, syncDailyReport } from '../services/googleSheets'
const logoSrc = '/fastpos-logo.png'
const route = useRoute()
const navItems = [
  { to: '/', label: 'Registar venda', shortLabel: 'Venda', icon: 'mdi-cash-register' },
  { to: '/resumo', label: 'Resumo do dia', shortLabel: 'Resumo', icon: 'mdi-chart-box-outline' },
  { to: '/produtos', label: 'Produtos e evento', shortLabel: 'Produtos', icon: 'mdi-package-variant-closed' },
  { to: '/ajuda', label: 'Ajuda', shortLabel: 'Ajuda', icon: 'mdi-lifebuoy' },
]
const currentYear = new Date().getFullYear()
const products = ref(JSON.parse(localStorage.getItem('sales_products') || '[]'))
const sales = ref(JSON.parse(localStorage.getItem('sales_data') || '[]'))
const saleSeq = ref(Number(localStorage.getItem('sales_seq') || 1))
const eventName = ref(localStorage.getItem('event_name') || '')
const currencyPreference = ref(localStorage.getItem('currency_pref') === 'euro' ? 'euro' : 'scarf')
const closedDays = ref(JSON.parse(localStorage.getItem('closed_day_reports') || '[]'))
const googleSheetsSettings = ref(JSON.parse(localStorage.getItem('google_sheets_settings') || '{"spreadsheetId":"","spreadsheetName":"","spreadsheetUrl":"","lastSync":""}'))
const pendingReportsCount = computed(() => closedDays.value.filter(day => day.status !== 'synced').length)
function updateProducts(newList) { products.value = newList }
function setEventName(name) { eventName.value = name }
function setCurrencyPreference(pref) { currencyPreference.value = pref === 'euro' ? 'euro' : 'scarf' }
function makeId() { return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}` }
function registerSale(sale) {
  sales.value.push({ ...sale, id: sale.id || makeId(), seq: saleSeq.value, eventName: eventName.value, currency: currencyPreference.value })
  saleSeq.value++
}
function localDateKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Lisbon', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date)
  const value = type => parts.find(part => part.type === type)?.value
  return `${value('year')}-${value('month')}-${value('day')}`
}
function dateTimeLabel(value) {
  return new Intl.DateTimeFormat('pt-PT', { timeZone: 'Europe/Lisbon', dateStyle: 'short', timeStyle: 'short' }).format(new Date(value))
}
function snapshotSales(list) {
  return list.map(sale => ({ ...sale, items: (sale.items || []).map(item => {
    const fallbackPrice = Number(products.value.find(product => String(product.name).trim().toLowerCase() === String(item.product).trim().toLowerCase())?.price || 0)
    const unitPrice = Number.isFinite(Number(item.unitPrice)) ? Number(item.unitPrice) : fallbackPrice
    return { ...item, unitPrice, lineTotal: Number((unitPrice * Number(item.quantity || 0)).toFixed(2)) }
  }) }))
}
function buildDailyReport(day) {
  const stats = new Map()
  let totalReceived = 0; let totalChange = 0
  for (const sale of day.sales) {
    if (Number(sale.total || 0) > 0) {
      totalReceived += Number(sale.given || 0)
      totalChange += Math.max(Number(sale.change || 0), 0)
    }
    for (const item of sale.items || []) {
      const key = String(item.product).trim().toLowerCase()
      if (!stats.has(key)) stats.set(key, { product: item.product, soldQuantity: 0, salesTotal: 0, returnedQuantity: 0, returnsTotal: 0, netTotal: 0 })
      const stat = stats.get(key); const quantity = Number(item.quantity || 0); const amount = Math.abs(Number(item.lineTotal ?? (Number(item.unitPrice || 0) * quantity)))
      if (quantity > 0) { stat.soldQuantity += quantity; stat.salesTotal += amount } else { stat.returnedQuantity += Math.abs(quantity); stat.returnsTotal += amount }
      stat.netTotal = stat.salesTotal - stat.returnsTotal
    }
  }
  const productRows = [...stats.values()].sort((a, b) => a.product.localeCompare(b.product, 'pt'))
  const totalSales = productRows.reduce((sum, row) => sum + row.salesTotal, 0)
  const totalReturns = productRows.reduce((sum, row) => sum + row.returnsTotal, 0)
  const date = new Date(`${day.date}T12:00:00`)
  return {
    ...day,
    displayDate: new Intl.DateTimeFormat('pt-PT', { dateStyle: 'long' }).format(date),
    openedAtLabel: dateTimeLabel(day.sales[0]?.date || day.closedAt),
    closedAtLabel: dateTimeLabel(day.closedAt),
    saleCount: day.sales.length,
    products: productRows,
    totalSales,
    totalReturns,
    totalNet: totalSales - totalReturns,
    totalReceived,
    totalChange,
  }
}
async function ensureSpreadsheet() {
  if (googleSheetsSettings.value.spreadsheetId) return googleSheetsSettings.value
  const created = await createSalesSpreadsheet()
  googleSheetsSettings.value = { ...googleSheetsSettings.value, ...created }
  return googleSheetsSettings.value
}
async function syncStoredReports() {
  const settings = await ensureSpreadsheet()
  const pending = closedDays.value.filter(day => day.status !== 'synced')
  for (const day of pending) {
    try {
      await syncDailyReport(settings.spreadsheetId, buildDailyReport(day))
      day.status = 'synced'; day.syncedAt = new Date().toISOString(); day.error = ''
      googleSheetsSettings.value.lastSync = day.syncedAt
    } catch (error) {
      day.status = 'pending'; day.error = error.message
      closedDays.value = [...closedDays.value]
      throw error
    }
  }
  closedDays.value = [...closedDays.value]
  googleSheetsSettings.value = { ...googleSheetsSettings.value }
  return pending.length
}
async function connectGoogleSheets() {
  await authorizeGoogleSheets()
  await ensureSpreadsheet()
  const synced = await syncStoredReports()
  return { synced, ...googleSheetsSettings.value }
}
async function syncPendingReports() {
  await authorizeGoogleSheets()
  return syncStoredReports()
}
function disconnectSheets() {
  disconnectGoogleSheets()
  googleSheetsSettings.value = { spreadsheetId: '', spreadsheetName: '', spreadsheetUrl: '', lastSync: '' }
}
async function closeDay() {
  if (!sales.value.length) return { closed: false }
  const now = new Date(); const date = localDateKey(now); const archivedSales = snapshotSales(sales.value)
  const existingIndex = closedDays.value.findIndex(day => day.date === date)
  const day = existingIndex >= 0 ? { ...closedDays.value[existingIndex], sales: [...closedDays.value[existingIndex].sales, ...archivedSales] } : { id: makeId(), date, eventName: eventName.value, currency: currencyPreference.value, sales: archivedSales }
  day.eventName = eventName.value || day.eventName; day.currency = currencyPreference.value; day.closedAt = now.toISOString(); day.status = 'pending'; day.error = ''
  if (existingIndex >= 0) closedDays.value.splice(existingIndex, 1, day); else closedDays.value.push(day)
  closedDays.value = [...closedDays.value]
  sales.value = []

  if (!googleSheetsSettings.value.spreadsheetId) return { closed: true, synced: false, reason: 'not-connected' }
  try {
    await authorizeGoogleSheets()
    await syncStoredReports()
    return { closed: true, synced: true }
  } catch (error) {
    return { closed: true, synced: false, reason: 'sync-failed', message: error.message }
  }
}
watch(products, v => localStorage.setItem('sales_products', JSON.stringify(v)), { deep: true })
watch(sales, v => localStorage.setItem('sales_data', JSON.stringify(v)), { deep: true })
watch(saleSeq, v => localStorage.setItem('sales_seq', v))
watch(eventName, v => localStorage.setItem('event_name', v))
watch(currencyPreference, v => localStorage.setItem('currency_pref', v))
watch(closedDays, v => localStorage.setItem('closed_day_reports', JSON.stringify(v)), { deep: true })
watch(googleSheetsSettings, v => localStorage.setItem('google_sheets_settings', JSON.stringify(v)), { deep: true })
watch(() => route.fullPath, async () => {
  await nextTick()
  document.getElementById('main-content')?.focus({ preventScroll: true })
})
provide('products', products); provide('sales', sales); provide('updateProducts', updateProducts); provide('registerSale', registerSale); provide('closeDay', closeDay); provide('eventName', eventName); provide('setEventName', setEventName); provide('currencyPreference', currencyPreference); provide('setCurrencyPreference', setCurrencyPreference); provide('closedDays', closedDays); provide('googleSheetsSettings', googleSheetsSettings); provide('pendingReportsCount', pendingReportsCount); provide('googleSheetsAvailable', isGoogleSheetsAvailable()); provide('connectGoogleSheets', connectGoogleSheets); provide('syncPendingReports', syncPendingReports); provide('disconnectGoogleSheets', disconnectSheets)
</script>

<style scoped>
.skip-link { position: fixed; z-index: 1000; top: 8px; left: 8px; padding: 10px 14px; color: white; background: #112d38; border-radius: 8px; transform: translateY(-150%); }
.skip-link:focus { transform: translateY(0); }
.desktop-sidebar { position: fixed; z-index: 20; inset: 0 auto 0 0; width: 260px; flex-direction: column; padding: 28px 20px 24px; color: white; background: #112d38; }
.brand-block { display: flex; align-items: center; gap: 12px; padding: 4px 8px 30px; color: white; text-decoration: none; }
.brand-mark { display: grid; place-items: center; width: 116px; height: 52px; padding: 6px 8px; background: white; border-radius: 14px; }
.brand-mark img { width: 100px; height: auto; }
.brand-copy { font-size: .72rem; line-height: 1.2; color: #a9bec5; }
.side-nav { display: grid; gap: 8px; }
.side-nav__item { display: flex; align-items: center; gap: 14px; min-height: 52px; padding: 0 15px; color: #c8d6da; border-radius: 14px; text-decoration: none; font-weight: 600; transition: 160ms ease; }
.side-nav__item:hover { color: white; background: rgba(255,255,255,.08); }
.side-nav__item.router-link-exact-active { color: #112d38; background: #d9ef56; }
.sidebar-status { display: flex; align-items: flex-start; gap: 10px; margin-top: auto; padding: 16px 12px 0; border-top: 1px solid rgba(255,255,255,.12); }
.sidebar-status strong, .sidebar-status small { display: block; }
.sidebar-status strong { font-size: .83rem; }
.sidebar-status small { margin-top: 2px; color: #95aeb5; font-size: .7rem; line-height: 1.35; }
.sidebar-legal { padding: 15px 12px 0; color: #79949c; font-size: .67rem; line-height: 1.45; }
.sidebar-legal p { margin: 0 0 9px; }
.sidebar-legal p > span { color: #a9bec5; }
.sidebar-legal nav { display: flex; gap: 13px; }
.sidebar-legal a { color: #a9bec5; font-weight: 600; text-decoration: none; }
.sidebar-legal a:hover { color: var(--pos-accent); text-decoration: underline; }
.status-dot { width: 9px; height: 9px; margin-top: 4px; background: #d9ef56; border-radius: 50%; box-shadow: 0 0 0 4px rgba(217,239,86,.14); }
.status-dot--pending { background: #ffbd59; box-shadow: 0 0 0 4px rgba(255,189,89,.14); }
.app-main, #main-content { width: 100%; max-width: 100%; min-width: 0; overflow-x: clip; }
.app-main { min-height: 100dvh; }
.mobile-header { position: sticky; z-index: 15; top: 0; align-items: center; justify-content: space-between; min-height: calc(68px + env(safe-area-inset-top)); padding: calc(8px + env(safe-area-inset-top)) 16px 8px; border-bottom: 1px solid #e0e7e3; background: rgba(255,255,255,.94); backdrop-filter: blur(12px); }
.mobile-header img { display: block; width: 100px; height: auto; }
.event-pill { overflow: hidden; max-width: 46vw; padding: 7px 10px; color: #06647d; background: #e8f5f7; border-radius: 999px; font-size: .75rem; font-weight: 700; text-overflow: ellipsis; white-space: nowrap; }
.mobile-nav { position: fixed !important; z-index: 100; right: 0; bottom: 0 !important; left: 0; width: 100%; max-width: 100%; min-height: calc(60px + env(safe-area-inset-bottom)); padding: 4px 8px calc(4px + env(safe-area-inset-bottom)); overflow: hidden; border-top: 1px solid rgba(255,255,255,.14); background: #112d38; box-shadow: 0 -6px 24px rgba(17,45,56,.14); transform: translate3d(0,0,0); backface-visibility: hidden; }
.mobile-nav__item { align-items: center; justify-content: center; flex: 1 1 25%; flex-direction: column; width: 25%; min-width: 0; min-height: 52px; gap: 1px; color: #a9bec5; border-radius: 10px; font-size: .65rem; font-weight: 600; text-decoration: none; }
.mobile-nav__item.router-link-exact-active { color: #112d38; background: #d9ef56; }
@media (max-width: 959px) { html, body { touch-action: pan-y pinch-zoom; } .mobile-nav, .mobile-nav__item { display: flex !important; } }
@media (min-width: 960px) { .app-main { padding-left: 260px; } .mobile-nav { display: none !important; } }
@media (max-width: 380px) { .mobile-nav { padding-inline: 4px; } .mobile-nav__item { font-size: .6rem; } }
</style>
