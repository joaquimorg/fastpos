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
        <span class="status-dot" aria-hidden="true"></span>
        <div><strong>Dados locais</strong><small>Pronto para trabalhar offline</small></div>
      </div>
    </aside>
    <header class="mobile-header d-flex d-md-none">
      <router-link to="/" aria-label="fastPOS — página inicial"><img :src="logoSrc" alt="fastPOS" width="100" height="33" /></router-link>
      <span v-if="eventName" class="event-pill">{{ eventName }}</span>
    </header>
    <v-main class="app-main"><main id="main-content" tabindex="-1"><router-view /></main></v-main>
    <nav class="mobile-nav" aria-label="Navegação principal">
      <router-link v-for="item in navItems" :key="item.to" :to="item.to" class="mobile-nav__item">
        <v-icon :icon="item.icon" size="23" aria-hidden="true" /><span>{{ item.shortLabel }}</span>
      </router-link>
    </nav>
  </v-app>
</template>

<script setup>
import { ref, provide, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
const logoSrc = '/fastpos-logo.png'
const route = useRoute()
const navItems = [
  { to: '/', label: 'Registar venda', shortLabel: 'Venda', icon: 'mdi-cash-register' },
  { to: '/produtos', label: 'Produtos e evento', shortLabel: 'Produtos', icon: 'mdi-package-variant-closed' },
  { to: '/resumo', label: 'Resumo do dia', shortLabel: 'Resumo', icon: 'mdi-chart-box-outline' },
  { to: '/ajuda', label: 'Ajuda', shortLabel: 'Ajuda', icon: 'mdi-lifebuoy' },
]
const products = ref(JSON.parse(localStorage.getItem('sales_products') || '[]'))
const sales = ref(JSON.parse(localStorage.getItem('sales_data') || '[]'))
const saleSeq = ref(Number(localStorage.getItem('sales_seq') || 1))
const eventName = ref(localStorage.getItem('event_name') || '')
const currencyPreference = ref(localStorage.getItem('currency_pref') === 'euro' ? 'euro' : 'scarf')
function updateProducts(newList) { products.value = newList }
function setEventName(name) { eventName.value = name }
function setCurrencyPreference(pref) { currencyPreference.value = pref === 'euro' ? 'euro' : 'scarf' }
function registerSale(sale) { sales.value.push({ ...sale, seq: saleSeq.value }); saleSeq.value++ }
function closeDay() { sales.value = [] }
watch(products, v => localStorage.setItem('sales_products', JSON.stringify(v)), { deep: true })
watch(sales, v => localStorage.setItem('sales_data', JSON.stringify(v)), { deep: true })
watch(saleSeq, v => localStorage.setItem('sales_seq', v))
watch(eventName, v => localStorage.setItem('event_name', v))
watch(currencyPreference, v => localStorage.setItem('currency_pref', v))
watch(() => route.fullPath, async () => {
  await nextTick()
  document.getElementById('main-content')?.focus({ preventScroll: true })
})
provide('products', products); provide('sales', sales); provide('updateProducts', updateProducts); provide('registerSale', registerSale); provide('closeDay', closeDay); provide('eventName', eventName); provide('setEventName', setEventName); provide('currencyPreference', currencyPreference); provide('setCurrencyPreference', setCurrencyPreference)
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
.status-dot { width: 9px; height: 9px; margin-top: 4px; background: #d9ef56; border-radius: 50%; box-shadow: 0 0 0 4px rgba(217,239,86,.14); }
.app-main { min-height: 100dvh; }
.mobile-header { position: sticky; z-index: 15; top: 0; align-items: center; justify-content: space-between; min-height: calc(68px + env(safe-area-inset-top)); padding: calc(8px + env(safe-area-inset-top)) 16px 8px; border-bottom: 1px solid #e0e7e3; background: rgba(255,255,255,.94); backdrop-filter: blur(12px); }
.mobile-header img { display: block; width: 100px; height: auto; }
.event-pill { overflow: hidden; max-width: 46vw; padding: 7px 10px; color: #06647d; background: #e8f5f7; border-radius: 999px; font-size: .75rem; font-weight: 700; text-overflow: ellipsis; white-space: nowrap; }
.mobile-nav { position: fixed; z-index: 30; right: 0; bottom: 0; left: 0; min-height: calc(60px + env(safe-area-inset-bottom)); padding: 4px 8px calc(4px + env(safe-area-inset-bottom)); border-top: 1px solid rgba(255,255,255,.14); background: #112d38; box-shadow: 0 -6px 24px rgba(17,45,56,.14); }
.mobile-nav__item { align-items: center; justify-content: center; flex: 1 1 25%; flex-direction: column; width: 25%; min-width: 0; min-height: 52px; gap: 1px; color: #a9bec5; border-radius: 10px; font-size: .65rem; font-weight: 600; text-decoration: none; }
.mobile-nav__item.router-link-exact-active { color: #112d38; background: #d9ef56; }
@media (max-width: 959px) { .mobile-nav, .mobile-nav__item { display: flex !important; } }
@media (min-width: 960px) { .app-main { padding-left: 260px; } .mobile-nav { display: none !important; } }
@media (max-width: 380px) { .mobile-nav { padding-inline: 4px; } .mobile-nav__item { font-size: .6rem; } }
</style>
