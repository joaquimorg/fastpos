<template>
  <div class="app-page legal-page">
    <header class="legal-hero">
      <router-link to="/" class="back-link"><v-icon icon="mdi-arrow-left" size="19" />Voltar ao fastPOS</router-link>
      <p class="page-eyebrow">{{ eyebrow }}</p>
      <h1 class="page-title">{{ title }}</h1>
      <p class="legal-intro">{{ intro }}</p>
      <div class="legal-meta"><v-icon icon="mdi-calendar-blank-outline" size="18" /><span>Última atualização: {{ updated }}</span></div>
    </header>

    <div class="legal-layout">
      <aside class="legal-index" aria-label="Nesta página">
        <strong>Nesta página</strong>
        <a v-for="item in sections" :key="item.id" :href="`#${item.id}`">{{ item.label }}</a>
      </aside>
      <article class="legal-document surface-card"><slot /></article>
    </div>
  </div>
</template>

<script setup>
defineProps({
  eyebrow: { type: String, required: true },
  title: { type: String, required: true },
  intro: { type: String, required: true },
  updated: { type: String, default: '31 de agosto de 2026' },
  sections: { type: Array, required: true },
})
</script>

<style scoped>
.legal-page { max-width: 1080px; }
.legal-hero { position: relative; padding: 14px 0 32px; }
.back-link { display: inline-flex; align-items: center; gap: 7px; margin-bottom: 34px; color: var(--pos-primary-dark); font-size: .82rem; font-weight: 700; text-decoration: none; }
.back-link:hover { text-decoration: underline; }
.legal-hero .page-title { max-width: 760px; font-size: clamp(2rem, 5vw, 3.35rem); }
.legal-intro { max-width: 720px; margin: 16px 0 0; color: var(--pos-muted); font-size: 1.04rem; line-height: 1.7; }
.legal-meta { display: inline-flex; align-items: center; gap: 7px; margin-top: 20px; padding: 8px 11px; color: #52666d; background: rgba(255,255,255,.72); border: 1px solid var(--pos-line); border-radius: 999px; font-size: .74rem; font-weight: 600; }
.legal-layout { display: grid; grid-template-columns: 210px minmax(0, 1fr); align-items: start; gap: 28px; }
.legal-index { position: sticky; top: 24px; display: grid; gap: 2px; padding: 8px 0; }
.legal-index strong { margin-bottom: 8px; color: var(--pos-navy); font-size: .78rem; letter-spacing: .04em; text-transform: uppercase; }
.legal-index a { padding: 8px 10px; color: var(--pos-muted); border-left: 2px solid var(--pos-line); font-size: .78rem; line-height: 1.35; text-decoration: none; transition: 150ms ease; }
.legal-index a:hover { color: var(--pos-primary-dark); border-left-color: var(--pos-primary); background: rgba(8,126,156,.04); }
.legal-document { padding: 8px 34px 34px; background: white; }
.legal-document :deep(section) { padding-top: 28px; scroll-margin-top: 24px; }
.legal-document :deep(section + section) { margin-top: 8px; border-top: 1px solid #e8eeea; }
.legal-document :deep(h2) { margin: 0 0 12px; color: var(--pos-navy); font: 700 1.28rem/1.25 'Outfit', sans-serif !important; }
.legal-document :deep(h3) { margin: 22px 0 8px; color: var(--pos-navy); font-size: .98rem; }
.legal-document :deep(p), .legal-document :deep(li) { color: #53656b; font-size: .92rem; line-height: 1.72; }
.legal-document :deep(p) { margin: 0 0 12px; }
.legal-document :deep(ul) { margin: 10px 0 16px; padding-left: 21px; }
.legal-document :deep(li + li) { margin-top: 7px; }
.legal-document :deep(a) { color: var(--pos-primary-dark); font-weight: 600; }
.legal-document :deep(.legal-highlight) { display: flex; gap: 11px; margin: 16px 0; padding: 15px 16px; color: var(--pos-navy); background: #f2f8f9; border: 1px solid #d7e9ec; border-radius: 14px; }
.legal-document :deep(.legal-highlight p) { margin: 0; color: #40565e; }
@media (max-width: 767px) {
  .legal-hero { padding-top: 4px; }
  .back-link { margin-bottom: 26px; }
  .legal-layout { grid-template-columns: 1fr; gap: 14px; }
  .legal-index { position: static; grid-template-columns: repeat(2, minmax(0, 1fr)); padding: 14px; background: rgba(255,255,255,.72); border: 1px solid var(--pos-line); border-radius: 16px; }
  .legal-index strong { grid-column: 1 / -1; }
  .legal-index a { padding: 6px 8px; }
  .legal-document { padding: 4px 18px 24px; }
}
</style>
