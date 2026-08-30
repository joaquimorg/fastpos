<template>
  <v-card class="surface-card transfer-card" elevation="0">
    <v-card-text class="pa-5 pa-md-6">
      <div class="transfer-heading">
        <span class="transfer-icon"><v-icon icon="mdi-folder-swap-outline" /></span>
        <div><h2>Importar e exportar</h2><p>Transfira as definições e o catálogo entre dispositivos</p></div>
      </div>

      <div class="transfer-options">
        <section class="transfer-option">
          <span class="option-icon"><v-icon icon="mdi-download-outline" /></span>
          <div><h3>Exportar configuração</h3><p>Cria um ficheiro JSON com o evento, a moeda e {{ products.length }} {{ products.length === 1 ? 'produto' : 'produtos' }}.</p></div>
          <v-btn color="secondary" variant="tonal" prepend-icon="mdi-tray-arrow-down" @click="exportSettings">Exportar JSON</v-btn>
        </section>

        <section class="transfer-option">
          <span class="option-icon option-icon--import"><v-icon icon="mdi-upload-outline" /></span>
          <div><h3>Importar configuração</h3><p>Valida o ficheiro e mostra um resumo antes de substituir as definições atuais.</p></div>
          <v-tooltip :text="hasOpenSales ? 'Feche o dia antes de substituir o catálogo' : 'Escolher ficheiro JSON'">
            <template #activator="{ props: tooltipProps }"><span v-bind="tooltipProps" class="button-wrap"><v-btn color="primary" variant="tonal" prepend-icon="mdi-tray-arrow-up" :disabled="hasOpenSales" @click="openFilePicker">Importar JSON</v-btn></span></template>
          </v-tooltip>
          <input ref="fileInput" class="visually-hidden" type="file" accept="application/json,.json" @change="readImportFile" />
        </section>
      </div>

      <div class="transfer-privacy"><v-icon icon="mdi-shield-lock-outline" size="20" /><span>O ficheiro não inclui vendas, relatórios ou dados de acesso à conta Google.</span></div>
      <v-alert v-if="feedback" :type="feedback.type" variant="tonal" density="compact" class="mt-4" closable @click:close="feedback = null">{{ feedback.message }}</v-alert>
    </v-card-text>
  </v-card>

  <v-dialog v-model="importDialog" max-width="500">
    <v-card rounded="xl">
      <v-card-text class="pa-6">
        <span class="dialog-icon"><v-icon icon="mdi-file-check-outline" /></span>
        <h2>Importar esta configuração?</h2>
        <p class="dialog-copy">Os produtos e definições atuais serão substituídos pelos dados validados do ficheiro.</p>
        <dl v-if="pendingImport" class="import-summary">
          <div><dt>Evento</dt><dd>{{ pendingImport.settings.eventName || 'Sem nome' }}</dd></div>
          <div><dt>Moeda</dt><dd>{{ pendingImport.settings.currencyPreference === 'euro' ? 'Euro' : 'Lenço' }}</dd></div>
          <div><dt>Produtos</dt><dd>{{ pendingImport.products.length }}</dd></div>
          <div><dt>Exportado em</dt><dd>{{ formatExportDate(pendingImport.exportedAt) }}</dd></div>
        </dl>
      </v-card-text>
      <v-card-actions class="pa-4 pt-0"><v-spacer /><v-btn variant="text" @click="cancelImport">Cancelar</v-btn><v-btn color="primary" prepend-icon="mdi-check" @click="confirmImport">Importar</v-btn></v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, inject, ref } from 'vue'

const products = inject('products')
const sales = inject('sales')
const eventName = inject('eventName')
const currencyPreference = inject('currencyPreference')
const updateProducts = inject('updateProducts')
const setEventName = inject('setEventName')
const setCurrencyPreference = inject('setCurrencyPreference')
const fileInput = ref(null); const importDialog = ref(false); const pendingImport = ref(null); const feedback = ref(null)
const hasOpenSales = computed(() => Boolean(sales.value.length))

function dateKey() {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Lisbon', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date())
  const value = type => parts.find(part => part.type === type)?.value
  return `${value('year')}-${value('month')}-${value('day')}`
}
function exportSettings() {
  const data = {
    format: 'fastpos-settings',
    version: 1,
    exportedAt: new Date().toISOString(),
    settings: { eventName: eventName.value, currencyPreference: currencyPreference.value },
    products: products.value.map(product => ({ name: product.name, price: Number(product.price) })),
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob); const link = document.createElement('a')
  link.href = url; link.download = `fastpos-config-${dateKey()}.json`; document.body.appendChild(link); link.click(); link.remove()
  URL.revokeObjectURL(url)
  feedback.value = { type: 'success', message: 'Configuração exportada. Guarde o ficheiro num local seguro.' }
}
function openFilePicker() { if (!hasOpenSales.value) fileInput.value?.click() }
function validateImport(raw) {
  if (!raw || typeof raw !== 'object' || raw.format !== 'fastpos-settings' || raw.version !== 1) throw new Error('Este ficheiro não é uma exportação válida do fastPOS.')
  if (!raw.settings || typeof raw.settings !== 'object' || !Array.isArray(raw.products)) throw new Error('O ficheiro está incompleto.')
  if (raw.products.length > 500) throw new Error('O ficheiro contém demasiados produtos.')
  const currency = raw.settings.currencyPreference
  if (!['scarf', 'euro'].includes(currency)) throw new Error('A moeda indicada no ficheiro não é válida.')
  if (raw.settings.eventName != null && typeof raw.settings.eventName !== 'string') throw new Error('O nome do evento não é válido.')
  const importedEventName = String(raw.settings.eventName || '').trim()
  if (importedEventName.length > 100) throw new Error('O nome do evento é demasiado longo.')
  const seen = new Set()
  const importedProducts = raw.products.map((product, index) => {
    if (!product || typeof product !== 'object' || typeof product.name !== 'string' || typeof product.price !== 'number') throw new Error(`O produto ${index + 1} não é válido.`)
    const name = product.name.trim(); const price = product.price
    if (!name || name.length > 32) throw new Error(`O produto ${index + 1} tem um nome inválido.`)
    if (!Number.isFinite(price) || price < 0) throw new Error(`O preço de “${name}” não é válido.`)
    const key = name.toLocaleLowerCase('pt-PT')
    if (seen.has(key)) throw new Error(`O produto “${name}” aparece mais do que uma vez.`)
    seen.add(key)
    return { name, price: Number(price.toFixed(2)) }
  })
  return { format: raw.format, version: raw.version, exportedAt: raw.exportedAt, settings: { eventName: importedEventName, currencyPreference: currency }, products: importedProducts }
}
async function readImportFile(event) {
  feedback.value = null
  const file = event.target.files?.[0]
  if (!file) return
  try {
    if (file.size > 1024 * 1024) throw new Error('O ficheiro é demasiado grande. O limite é 1 MB.')
    const raw = JSON.parse(await file.text())
    pendingImport.value = validateImport(raw); importDialog.value = true
  } catch (error) {
    feedback.value = { type: 'error', message: error instanceof SyntaxError ? 'O ficheiro não contém JSON válido.' : error.message }
  } finally { event.target.value = '' }
}
function formatExportDate(value) {
  if (!value || Number.isNaN(new Date(value).getTime())) return 'Data desconhecida'
  return new Intl.DateTimeFormat('pt-PT', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value))
}
function cancelImport() { importDialog.value = false; pendingImport.value = null }
function confirmImport() {
  if (!pendingImport.value || hasOpenSales.value) return
  updateProducts(pendingImport.value.products)
  setEventName(pendingImport.value.settings.eventName)
  setCurrencyPreference(pendingImport.value.settings.currencyPreference)
  const count = pendingImport.value.products.length
  importDialog.value = false; pendingImport.value = null
  feedback.value = { type: 'success', message: `Configuração importada com ${count} ${count === 1 ? 'produto' : 'produtos'}.` }
}
</script>

<style scoped>
.transfer-card { grid-column: 1 / -1; }
.transfer-heading { display: flex; align-items: center; gap: 14px; margin-bottom: 20px; }
.transfer-heading h2, .transfer-heading p { margin: 0; }
.transfer-heading h2 { color: var(--pos-navy); font: 700 1.15rem 'Outfit', sans-serif; }
.transfer-heading p { margin-top: 2px; color: var(--pos-muted); font-size: .82rem; }
.transfer-icon { display: grid; place-items: center; width: 46px; height: 46px; color: var(--pos-primary); background: #e8f5f7; border-radius: 13px; }
.transfer-options { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.transfer-option { display: grid; grid-template-columns: 42px 1fr; align-items: start; gap: 10px 12px; padding: 16px; background: #f7f9f7; border: 1px solid var(--pos-line); border-radius: 15px; }
.transfer-option h3, .transfer-option p { margin: 0; }
.transfer-option h3 { color: var(--pos-navy); font-size: .9rem; }
.transfer-option p { margin-top: 3px; color: var(--pos-muted); font-size: .76rem; line-height: 1.45; }
.transfer-option .v-btn, .button-wrap { grid-column: 2; justify-self: start; }
.option-icon { display: grid; place-items: center; width: 42px; height: 42px; color: #445d68; background: #e8eeeb; border-radius: 12px; }
.option-icon--import { color: var(--pos-primary-dark); background: #e5f3f6; }
.transfer-privacy { display: flex; align-items: center; gap: 8px; margin-top: 12px; color: #607177; font-size: .73rem; }
.visually-hidden { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip: rect(0 0 0 0); border: 0; }
.dialog-icon { display: grid; place-items: center; width: 48px; height: 48px; color: #176b34; background: #e9f6ed; border-radius: 14px; }
.dialog-icon + h2 { margin: 16px 0 6px; color: var(--pos-navy); font: 700 1.3rem 'Outfit', sans-serif; }
.dialog-copy { margin: 0; color: var(--pos-muted); font-size: .9rem; line-height: 1.5; }
.import-summary { display: grid; margin: 18px 0 0; border: 1px solid var(--pos-line); border-radius: 14px; overflow: hidden; }
.import-summary div { display: grid; grid-template-columns: 120px 1fr; padding: 10px 12px; }
.import-summary div + div { border-top: 1px solid var(--pos-line); }
.import-summary dt { color: var(--pos-muted); font-size: .76rem; }
.import-summary dd { overflow: hidden; margin: 0; color: var(--pos-navy); font-size: .78rem; font-weight: 700; text-overflow: ellipsis; white-space: nowrap; }
@media (max-width: 699px) { .transfer-options { grid-template-columns: 1fr; } .transfer-option .v-btn, .button-wrap { grid-column: 1 / -1; width: 100%; } .button-wrap .v-btn { width: 100%; } }
</style>
