<template>
  <div class="app-page">
    <header class="page-heading">
      <div>
        <p class="page-eyebrow">Catálogo</p>
        <h1 class="page-title">Produtos e evento</h1>
        <p class="page-subtitle">Configure o evento, a moeda e os artigos disponíveis no balcão.</p>
      </div>
      <v-chip color="secondary" variant="tonal" prepend-icon="mdi-package-variant-closed">{{ products.length }} produtos</v-chip>
    </header>
    <div class="settings-grid">
      <v-card class="surface-card settings-card" elevation="0">
        <v-card-text class="pa-5 pa-md-6">
          <div class="card-heading"><span class="card-icon"><v-icon icon="mdi-tune-variant" /></span><div><h2>Definições</h2><p>Contexto desta sessão de vendas</p></div></div>
          <v-text-field v-model="eventNameModel" label="Nome do evento" placeholder="Ex.: Feira Solidária" prepend-inner-icon="mdi-calendar-blank" variant="outlined" clearable />
          <fieldset class="currency-fieldset">
            <legend>Símbolo monetário</legend>
            <v-radio-group v-model="currencyPreferenceModel" hide-details>
              <v-radio value="scarf" color="primary"><template #label><span class="currency-option"><span class="currency-icon" role="img" aria-label="Lenço"></span><span><strong>Lenço</strong><small>Moeda solidária</small></span></span></template></v-radio>
              <v-radio value="euro" color="primary"><template #label><span class="currency-option"><span class="euro-badge" aria-hidden="true">€</span><span><strong>Euro</strong><small>Moeda convencional</small></span></span></template></v-radio>
            </v-radio-group>
          </fieldset>
        </v-card-text>
      </v-card>
      <ProductManager :products="products" @update="updateProducts" />
      <GoogleSheetsSettings />
    </div>
  </div>
</template>
<script setup>
import { inject, computed } from 'vue'
import ProductManager from '../components/ProductManager.vue'
import GoogleSheetsSettings from '../components/GoogleSheetsSettings.vue'
const products = inject('products'); const updateProducts = inject('updateProducts'); const eventName = inject('eventName'); const setEventName = inject('setEventName'); const currencyPreference = inject('currencyPreference'); const setCurrencyPreference = inject('setCurrencyPreference')
const eventNameModel = computed({ get: () => eventName.value, set: val => setEventName(val || '') })
const currencyPreferenceModel = computed({ get: () => currencyPreference.value, set: val => setCurrencyPreference(val) })
</script>
<style scoped>
.settings-grid { display: grid; grid-template-columns: minmax(260px, .78fr) minmax(380px, 1.22fr); gap: 24px; align-items: start; }
.settings-card { position: sticky; top: 24px; }
.card-heading { display: flex; align-items: center; gap: 14px; margin-bottom: 24px; }
.card-heading h2, .card-heading p { margin: 0; }
.card-heading h2 { color: var(--pos-navy); font: 700 1.15rem 'Outfit', sans-serif; }
.card-heading p { color: var(--pos-muted); font-size: .82rem; }
.card-icon { display: grid; place-items: center; width: 44px; height: 44px; color: var(--pos-primary); background: #e8f5f7; border-radius: 13px; }
.currency-fieldset { margin: 8px 0 0; padding: 0; border: 0; }
.currency-fieldset legend { margin-bottom: 8px; color: var(--pos-navy); font-size: .86rem; font-weight: 700; }
.currency-option { display: flex; align-items: center; gap: 10px; padding-block: 5px; }
.currency-option strong, .currency-option small { display: block; }
.currency-option small { color: var(--pos-muted); font-size: .72rem; }
.euro-badge { display: grid; place-items: center; width: 24px; height: 24px; color: var(--pos-primary); background: #e8f5f7; border-radius: 50%; font-weight: 800; }
@media (max-width: 959px) { .settings-grid { grid-template-columns: 1fr; } .settings-card { position: static; } }
</style>
