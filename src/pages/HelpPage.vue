<template>
  <div class="app-page help-page">
    <header class="page-heading"><div><p class="page-eyebrow">Suporte</p><h1 class="page-title">Ajuda rápida</h1><p class="page-subtitle">Tudo o que precisa para operar o fastPOS com confiança.</p></div></header>
    <div class="help-grid">
      <v-card v-for="section in sections" :key="section.title" class="surface-card help-card" elevation="0">
        <v-card-text class="pa-5 pa-md-6"><span class="help-icon"><v-icon :icon="section.icon" size="25" /></span><h2>{{ section.title }}</h2><ul><li v-for="item in section.items" :key="item">{{ item }}</li></ul></v-card-text>
      </v-card>
      <v-card class="surface-card offline-card" elevation="0"><v-card-text class="d-flex align-center ga-4 pa-5"><v-icon icon="mdi-cloud-check-outline" size="32" /><div><strong>Funciona offline</strong><p>Os dados ficam guardados apenas neste dispositivo e continuam disponíveis sem internet.</p></div></v-card-text></v-card>
    </div>
  </div>
</template>
<script setup>
const sections = [
  { title: 'Registar venda', icon: 'mdi-cash-register', items: ['Use + e − para ajustar quantidades.', 'Quantidades negativas registam devoluções.', 'Indique o valor recebido para calcular o troco.', 'No final pode gerar um talão em imagem.'] },
  { title: 'Produtos e evento', icon: 'mdi-package-variant-closed', items: ['Defina o nome do evento e a moeda.', 'Crie produtos com nome e preço.', 'Produtos já vendidos ficam protegidos contra alterações.'] },
  { title: 'Resumo do dia', icon: 'mdi-chart-box-outline', items: ['Consulte totais por produto.', 'Veja vendas, devoluções e valor líquido.', 'Gere um talão resumo antes de fechar o dia.'] },
]
</script>
<style scoped>
.help-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.help-card h2 { margin: 16px 0 12px; color: var(--pos-navy); font: 700 1.12rem 'Outfit', sans-serif; }
.help-card ul { margin: 0; padding-left: 19px; color: var(--pos-muted); font-size: .9rem; line-height: 1.6; }
.help-card li + li { margin-top: 7px; }
.help-icon { display: grid; place-items: center; width: 48px; height: 48px; color: var(--pos-primary); background: #e8f5f7; border-radius: 14px; }
.offline-card { grid-column: 1 / -1; color: white; background: var(--pos-navy) !important; }
.offline-card p { margin: 3px 0 0; color: #b9cbd0; font-size: .86rem; }
@media (max-width: 959px) { .help-grid { grid-template-columns: 1fr; } }
</style>
