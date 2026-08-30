<template>
  <div class="app-page help-page">
    <header class="page-heading"><div><p class="page-eyebrow">Suporte</p><h1 class="page-title">Ajuda rápida</h1><p class="page-subtitle">Tudo o que precisa para operar o fastPOS com confiança.</p></div></header>
    <div class="help-grid">
      <v-card v-for="section in sections" :key="section.title" class="surface-card help-card" elevation="0">
        <v-card-text class="pa-5 pa-md-6"><span class="help-icon"><v-icon :icon="section.icon" size="25" /></span><h2>{{ section.title }}</h2><ul><li v-for="item in section.items" :key="item">{{ item }}</li></ul></v-card-text>
      </v-card>
      <v-card class="surface-card google-help-card" elevation="0">
        <v-card-text class="pa-5 pa-md-6">
          <div class="google-help-heading">
            <span class="google-help-icon"><v-icon icon="mdi-google-spreadsheet" size="27" /></span>
            <div><p>Relatórios na sua conta</p><h2>Ligar ao Google Sheets</h2></div>
            <v-btn to="/produtos" color="primary" variant="tonal" append-icon="mdi-arrow-right">Abrir definições</v-btn>
          </div>
          <ol class="connection-steps">
            <li><span>1</span><div><strong>Abra Produtos</strong><p>Entre em “Produtos e evento” e procure “Relatórios Google Sheets”.</p></div></li>
            <li><span>2</span><div><strong>Ligue a conta</strong><p>Carregue em “Ligar conta Google” e escolha a conta onde quer guardar o relatório.</p></div></li>
            <li><span>3</span><div><strong>Autorize o fastPOS</strong><p>Aceite a criação e atualização apenas do ficheiro utilizado pela aplicação.</p></div></li>
            <li><span>4</span><div><strong>Feche o dia</strong><p>O fastPOS cria o relatório no seu Drive e uma aba com a data de cada dia fechado.</p></div></li>
          </ol>
          <div class="google-help-note"><v-icon icon="mdi-cloud-sync-outline" size="22" /><p><strong>Sem internet?</strong> O dia fica guardado no dispositivo. Quando voltar a ter ligação, use “Sincronizar agora” nas definições.</p></div>
        </v-card-text>
      </v-card>
      <v-card class="surface-card offline-card" elevation="0"><v-card-text class="d-flex align-center ga-4 pa-5"><v-icon icon="mdi-cloud-check-outline" size="32" /><div><strong>Funciona offline</strong><p>As vendas continuam disponíveis sem internet. Se ligar o Google Sheets, os dias pendentes serão sincronizados mais tarde.</p></div></v-card-text></v-card>
    </div>
    <footer class="mobile-legal d-md-none">
      <p>© {{ currentYear }} fastPOS <span>a product by <a href="https://joaquim.org" target="_blank" rel="noopener noreferrer">joaquim.org</a></span></p>
      <nav aria-label="Informação legal"><router-link to="/privacidade">Privacidade</router-link><router-link to="/termos">Termos</router-link></nav>
    </footer>
  </div>
</template>
<script setup>
const sections = [
  { title: 'Registar venda', icon: 'mdi-cash-register', items: ['Use + e − para ajustar quantidades.', 'Quantidades negativas registam devoluções.', 'Indique o valor recebido para calcular o troco.', 'No final pode gerar um talão em imagem.'] },
  { title: 'Produtos e evento', icon: 'mdi-package-variant-closed', items: ['Defina o nome do evento e a moeda.', 'Crie produtos com nome e preço.', 'Produtos já vendidos ficam protegidos contra alterações.'] },
  { title: 'Resumo do dia', icon: 'mdi-chart-box-outline', items: ['Consulte totais por produto.', 'Veja vendas, devoluções e valor líquido.', 'Ao fechar, o dia é arquivado antes de iniciar uma nova operação.'] },
]
const currentYear = new Date().getFullYear()
</script>
<style scoped>
.help-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.help-card h2 { margin: 16px 0 12px; color: var(--pos-navy); font: 700 1.12rem 'Outfit', sans-serif; }
.help-card ul { margin: 0; padding-left: 19px; color: var(--pos-muted); font-size: .9rem; line-height: 1.6; }
.help-card li + li { margin-top: 7px; }
.help-icon { display: grid; place-items: center; width: 48px; height: 48px; color: var(--pos-primary); background: #e8f5f7; border-radius: 14px; }
.google-help-card { grid-column: 1 / -1; }
.google-help-heading { display: grid; grid-template-columns: 52px minmax(0, 1fr) auto; align-items: center; gap: 14px; margin-bottom: 24px; }
.google-help-heading h2, .google-help-heading p { margin: 0; }
.google-help-heading h2 { color: var(--pos-navy); font: 700 1.25rem 'Outfit', sans-serif; }
.google-help-heading p { margin-bottom: 2px; color: #188038; font-size: .7rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
.google-help-icon { display: grid; place-items: center; width: 52px; height: 52px; color: white; background: #188038; border-radius: 15px; box-shadow: 0 8px 20px rgba(24,128,56,.18); }
.connection-steps { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; margin: 0; padding: 0; list-style: none; counter-reset: none; }
.connection-steps li { display: flex; align-items: flex-start; gap: 10px; min-width: 0; padding: 14px; background: #f7faf8; border: 1px solid #e1eae4; border-radius: 14px; }
.connection-steps li > span { display: grid; flex: 0 0 28px; place-items: center; width: 28px; height: 28px; color: #176b34; background: #e4f3e8; border-radius: 9px; font-size: .75rem; font-weight: 800; }
.connection-steps strong, .connection-steps p { display: block; margin: 0; }
.connection-steps strong { color: var(--pos-navy); font-size: .82rem; }
.connection-steps p { margin-top: 4px; color: var(--pos-muted); font-size: .74rem; line-height: 1.45; }
.google-help-note { display: flex; align-items: flex-start; gap: 10px; margin-top: 12px; padding: 12px 14px; color: #176b34; background: #eef8f1; border-radius: 12px; }
.google-help-note p { margin: 0; color: #526a5a; font-size: .78rem; line-height: 1.45; }
.google-help-note strong { color: #176b34; }
.offline-card { grid-column: 1 / -1; color: white; background: var(--pos-navy) !important; }
.offline-card p { margin: 3px 0 0; color: #b9cbd0; font-size: .86rem; }
.mobile-legal { margin-top: 22px; padding: 18px 4px 0; color: var(--pos-muted); border-top: 1px solid var(--pos-line); font-size: .72rem; }
.mobile-legal p { margin: 0; }
.mobile-legal p span { display: block; margin-top: 2px; }
.mobile-legal nav { display: flex; gap: 18px; margin-top: 12px; }
.mobile-legal a { color: var(--pos-primary-dark); font-weight: 700; text-decoration: none; }
@media (max-width: 959px) { .help-grid { grid-template-columns: 1fr; } .connection-steps { grid-template-columns: 1fr 1fr; } }
@media (max-width: 599px) { .google-help-heading { grid-template-columns: 48px 1fr; } .google-help-heading .v-btn { grid-column: 1 / -1; width: 100%; } .connection-steps { grid-template-columns: 1fr; } }
</style>
