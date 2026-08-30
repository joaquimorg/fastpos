<template>
  <v-card class="surface-card" elevation="0">
    <v-card-text class="pa-5 pa-md-6">
      <div class="product-header">
        <div><h2>Catálogo de produtos</h2><p>Adicione os artigos disponíveis para venda</p></div>
        <v-chip size="small" color="primary" variant="tonal">{{ products.length }}</v-chip>
      </div>

      <v-form ref="form" @submit.prevent="saveProduct" class="product-form">
        <div class="form-grid">
          <v-text-field v-model.trim="editProduct.name" label="Nome do produto" placeholder="Ex.: Sopa" variant="outlined" maxlength="32" counter="32" :rules="nameRules" prepend-inner-icon="mdi-tag-outline" />
          <v-text-field v-model.number="editProduct.price" type="number" min="0" step="0.01" label="Preço" variant="outlined" inputmode="decimal" :rules="priceRules">
            <template #prepend-inner><span v-if="useScarf" class="currency-icon currency-icon--input" role="img" aria-label="Lenço"></span><span v-else class="currency-text currency-text--input" aria-hidden="true">€</span></template>
          </v-text-field>
        </div>
        <div class="form-actions">
          <v-btn v-if="editIdx !== null" variant="text" color="secondary" @click="cancelEdit">Cancelar</v-btn>
          <v-btn type="submit" color="primary" :prepend-icon="editIdx === null ? 'mdi-plus' : 'mdi-content-save-outline'">{{ editIdx === null ? 'Adicionar produto' : 'Guardar alterações' }}</v-btn>
        </div>
      </v-form>

      <v-divider class="my-5" />
      <div v-if="products.length" class="product-list">
        <article v-for="(p, idx) in products" :key="`${p.name}-${idx}`" class="product-row">
          <div class="product-avatar" aria-hidden="true">{{ p.name.charAt(0).toUpperCase() }}</div>
          <div class="product-info"><strong>{{ p.name }}</strong><span class="numeric"><span v-if="useScarf" class="currency-icon" role="img" aria-label="Lenço"></span><span v-else class="currency-text" aria-hidden="true">€</span>{{ Number(p.price).toFixed(2) }}</span></div>
          <v-tooltip :text="productHasSales(p.name) ? 'Produto protegido porque já tem vendas' : 'Editar produto'">
            <template #activator="{ props: tooltipProps }"><v-btn v-bind="tooltipProps" icon="mdi-pencil-outline" variant="text" size="44" :disabled="productHasSales(p.name)" :aria-label="`Editar ${p.name}`" @click="edit(idx)" /></template>
          </v-tooltip>
          <v-tooltip :text="productHasSales(p.name) ? 'Produto protegido porque já tem vendas' : 'Eliminar produto'">
            <template #activator="{ props: tooltipProps }"><v-btn v-bind="tooltipProps" icon="mdi-delete-outline" variant="text" color="error" size="44" :disabled="productHasSales(p.name)" :aria-label="`Eliminar ${p.name}`" @click="requestRemove(idx)" /></template>
          </v-tooltip>
        </article>
      </div>
      <div v-else class="empty-state"><span class="empty-state__icon"><v-icon icon="mdi-package-variant-plus" size="30" /></span><strong>Ainda não há produtos</strong><span>Preencha os campos acima para criar o primeiro.</span></div>
    </v-card-text>
  </v-card>

  <v-dialog v-model="deleteDialog" max-width="420">
    <v-card class="dialog-card" rounded="xl"><v-card-text class="pa-6"><span class="danger-icon"><v-icon icon="mdi-delete-outline" /></span><h2>Eliminar produto?</h2><p>“{{ pendingProduct?.name }}” será removido do catálogo. Esta ação não pode ser anulada.</p></v-card-text><v-card-actions class="pa-4 pt-0"><v-spacer /><v-btn variant="text" @click="deleteDialog = false">Cancelar</v-btn><v-btn color="error" variant="flat" @click="confirmRemove">Eliminar</v-btn></v-card-actions></v-card>
  </v-dialog>
</template>

<script setup>
import { ref, toRefs, inject, computed } from 'vue'
const props = defineProps({ products: { type: Array, required: true } })
const emit = defineEmits(['update'])
const { products } = toRefs(props)
const sales = inject('sales', ref([])); const currencyPreference = inject('currencyPreference', ref('scarf'))
const useScarf = computed(() => (currencyPreference?.value || 'scarf') === 'scarf')
const form = ref(null); const editProduct = ref({ name: '', price: null }); const editIdx = ref(null); const deleteDialog = ref(false); const pendingIdx = ref(null)
const pendingProduct = computed(() => pendingIdx.value === null ? null : products.value[pendingIdx.value])
const nameRules = [v => Boolean(v?.trim()) || 'Indique o nome do produto']
const priceRules = [v => v !== null && v !== '' || 'Indique o preço', v => Number(v) >= 0 || 'O preço não pode ser negativo']
async function saveProduct() {
  const { valid } = await form.value.validate(); if (!valid) return
  const next = [...products.value]; const product = { name: editProduct.value.name.trim(), price: Number(editProduct.value.price) }
  if (editIdx.value === null) next.push(product); else next[editIdx.value] = product
  emit('update', next); resetForm()
}
function resetForm() { editProduct.value = { name: '', price: null }; editIdx.value = null; form.value?.resetValidation() }
function edit(idx) { if (productHasSales(products.value[idx]?.name)) return; editIdx.value = idx; editProduct.value = { ...products.value[idx] } }
function cancelEdit() { resetForm() }
function requestRemove(idx) { if (productHasSales(products.value[idx]?.name)) return; pendingIdx.value = idx; deleteDialog.value = true }
function confirmRemove() { if (pendingIdx.value === null) return; const next = [...products.value]; next.splice(pendingIdx.value, 1); emit('update', next); deleteDialog.value = false; pendingIdx.value = null }
function productHasSales(name) { const target = String(name).trim().toLowerCase(); return Array.isArray(sales?.value) && sales.value.some(sale => Array.isArray(sale.items) && sale.items.some(it => String(it.product).trim().toLowerCase() === target)) }
</script>

<style scoped>
.product-header { display: flex; justify-content: space-between; align-items: start; gap: 16px; margin-bottom: 22px; }
.product-header h2, .product-header p { margin: 0; }
.product-header h2 { color: var(--pos-navy); font: 700 1.15rem 'Outfit', sans-serif; }
.product-header p { margin-top: 3px; color: var(--pos-muted); font-size: .82rem; }
.product-form { padding: 18px; background: #f7f9f7; border: 1px solid var(--pos-line); border-radius: 16px; }
.form-grid { display: grid; grid-template-columns: 1.45fr .8fr; gap: 14px; }
.form-actions { display: flex; justify-content: flex-end; gap: 8px; }
.product-list { display: grid; gap: 8px; }
.product-row { display: grid; grid-template-columns: 44px 1fr 44px 44px; align-items: center; gap: 8px; min-height: 64px; padding: 8px 10px; border: 1px solid transparent; border-radius: 14px; transition: 160ms ease; }
.product-row:hover { border-color: var(--pos-line); background: #f8faf8; }
.product-avatar { display: grid; place-items: center; width: 42px; height: 42px; color: var(--pos-primary-dark); background: #e8f5f7; border-radius: 12px; font: 700 1rem 'Outfit', sans-serif; }
.product-info { min-width: 0; }
.product-info strong, .product-info > span { display: block; }
.product-info strong { overflow-wrap: anywhere; color: var(--pos-navy); }
.product-info > span { margin-top: 2px; color: var(--pos-primary-dark); font-size: .82rem; font-weight: 700; }
.dialog-card h2 { margin: 16px 0 6px; color: var(--pos-navy); font: 700 1.35rem 'Outfit', sans-serif; }
.dialog-card p { margin: 0; color: var(--pos-muted); line-height: 1.5; }
.danger-icon { display: grid; place-items: center; width: 48px; height: 48px; color: var(--pos-danger); background: #fbeaec; border-radius: 14px; }
@media (max-width: 599px) { .form-grid { grid-template-columns: 1fr; gap: 0; } .form-actions { flex-direction: column-reverse; } .form-actions .v-btn { width: 100%; } .product-row > .v-btn { width: 48px !important; height: 48px !important; } .product-row { grid-template-columns: 42px minmax(0, 1fr) 48px 48px; gap: 4px; padding-inline: 6px; } }
</style>
