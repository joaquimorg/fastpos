<template>
  <v-card class="surface-card sheets-card" elevation="0">
    <v-card-text class="pa-5 pa-md-6">
      <div class="sheets-heading">
        <span class="sheets-icon" aria-hidden="true"><v-icon icon="mdi-google-spreadsheet" /></span>
        <div><h2>Relatórios Google Sheets</h2><p>Um relatório diário guardado na sua conta Google</p></div>
        <span v-if="isConnected" class="connection-badge"><i></i> Ligado</span>
      </div>

      <v-alert v-if="!available" type="warning" variant="tonal" density="compact" class="mb-4">
        Os relatórios Google ainda não estão disponíveis nesta instalação.
      </v-alert>

      <template v-else-if="!isConnected">
        <div class="privacy-note">
          <v-icon icon="mdi-shield-check-outline" size="22" />
          <p><strong>O ficheiro fica no seu Google Drive.</strong><span>O fastPOS só pode utilizar o relatório criado por esta aplicação.</span></p>
        </div>
        <v-btn color="primary" size="large" block prepend-icon="mdi-google" :loading="working" @click="connect">Ligar conta Google</v-btn>
        <p v-if="pendingCount" class="pending-copy"><v-icon icon="mdi-cloud-upload-outline" size="18" /> {{ pendingCount }} {{ pendingCount === 1 ? 'dia será sincronizado' : 'dias serão sincronizados' }} depois da ligação.</p>
      </template>

      <template v-else>
        <a class="report-link" :href="settings.spreadsheetUrl" target="_blank" rel="noopener noreferrer">
          <span><v-icon icon="mdi-file-table-outline" /></span>
          <div><strong>{{ settings.spreadsheetName || 'Relatório de vendas fastPOS' }}</strong><small>{{ lastSyncLabel }}</small></div>
          <v-icon icon="mdi-open-in-new" size="20" />
        </a>
        <div v-if="pendingCount" class="sync-status sync-status--pending">
          <span><v-icon icon="mdi-cloud-clock-outline" /></span>
          <div><strong>{{ pendingCount }} {{ pendingCount === 1 ? 'dia pendente' : 'dias pendentes' }}</strong><small>Os dados estão guardados neste dispositivo.</small></div>
        </div>
        <div v-else class="sync-status">
          <span><v-icon icon="mdi-cloud-check-outline" /></span>
          <div><strong>Tudo sincronizado</strong><small>Não existem relatórios por enviar.</small></div>
        </div>
        <div class="sheets-actions">
          <v-btn v-if="pendingCount" color="primary" prepend-icon="mdi-sync" :loading="working" @click="sync">Sincronizar agora</v-btn>
          <v-btn variant="text" color="secondary" @click="disconnectDialog = true">Desligar</v-btn>
        </div>
      </template>

      <v-alert v-if="feedback" :type="feedback.type" variant="tonal" density="compact" class="mt-4" closable @click:close="feedback = null">{{ feedback.message }}</v-alert>
    </v-card-text>
  </v-card>

  <v-dialog v-model="disconnectDialog" max-width="430">
    <v-card rounded="xl">
      <v-card-text class="pa-6"><span class="dialog-icon"><v-icon icon="mdi-link-off" /></span><h2>Desligar o Google Sheets?</h2><p>O relatório existente permanece no seu Google Drive. Os próximos dias ficam guardados no dispositivo até ligar uma conta.</p></v-card-text>
      <v-card-actions class="pa-4 pt-0"><v-spacer /><v-btn variant="text" @click="disconnectDialog = false">Cancelar</v-btn><v-btn color="error" variant="tonal" @click="disconnect">Desligar</v-btn></v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, inject, ref } from 'vue'

const settings = inject('googleSheetsSettings')
const pendingReportsCount = inject('pendingReportsCount')
const available = inject('googleSheetsAvailable', false)
const connectGoogleSheets = inject('connectGoogleSheets')
const syncPendingReports = inject('syncPendingReports')
const disconnectGoogleSheets = inject('disconnectGoogleSheets')
const working = ref(false); const feedback = ref(null); const disconnectDialog = ref(false)
const isConnected = computed(() => Boolean(settings.value.spreadsheetId))
const pendingCount = computed(() => pendingReportsCount.value)
const lastSyncLabel = computed(() => settings.value.lastSync ? `Última sincronização: ${new Intl.DateTimeFormat('pt-PT', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(settings.value.lastSync))}` : 'Relatório pronto a receber o primeiro dia')

async function connect() {
  working.value = true; feedback.value = null
  try {
    const result = await connectGoogleSheets()
    feedback.value = { type: 'success', message: result.synced ? `Conta ligada e ${result.synced} ${result.synced === 1 ? 'dia sincronizado' : 'dias sincronizados'}.` : 'Conta ligada e relatório criado no seu Google Drive.' }
  } catch (error) { feedback.value = { type: 'error', message: error.message } }
  finally { working.value = false }
}
async function sync() {
  working.value = true; feedback.value = null
  try {
    const count = await syncPendingReports()
    feedback.value = { type: 'success', message: count ? `${count} ${count === 1 ? 'dia sincronizado' : 'dias sincronizados'} com sucesso.` : 'O relatório já estava atualizado.' }
  } catch (error) { feedback.value = { type: 'error', message: `${error.message} Os dados continuam guardados neste dispositivo.` } }
  finally { working.value = false }
}
function disconnect() {
  disconnectGoogleSheets(); disconnectDialog.value = false
  feedback.value = { type: 'info', message: 'Conta desligada. O ficheiro não foi eliminado do Google Drive.' }
}
</script>

<style scoped>
.sheets-card { grid-column: 1 / -1; overflow: hidden; }
.sheets-heading { display: grid; grid-template-columns: 48px minmax(0, 1fr) auto; align-items: center; gap: 14px; margin-bottom: 22px; }
.sheets-heading h2, .sheets-heading p { margin: 0; }
.sheets-heading h2 { color: var(--pos-navy); font: 700 1.15rem 'Outfit', sans-serif; }
.sheets-heading p { margin-top: 2px; color: var(--pos-muted); font-size: .82rem; }
.sheets-icon { display: grid; place-items: center; width: 48px; height: 48px; color: white; background: #188038; border-radius: 14px; box-shadow: 0 8px 18px rgba(24,128,56,.18); }
.connection-badge { display: inline-flex; align-items: center; gap: 7px; padding: 7px 10px; color: #176b34; background: #e9f6ed; border-radius: 999px; font-size: .72rem; font-weight: 700; }
.connection-badge i { width: 7px; height: 7px; background: #22a447; border-radius: 50%; }
.privacy-note { display: flex; gap: 12px; margin-bottom: 18px; padding: 15px; color: #176b34; background: #f1f8f3; border: 1px solid #d9ecdf; border-radius: 14px; }
.privacy-note p, .privacy-note strong, .privacy-note span { display: block; margin: 0; }
.privacy-note span { margin-top: 2px; color: var(--pos-muted); font-size: .78rem; line-height: 1.4; }
.pending-copy { display: flex; align-items: center; justify-content: center; gap: 6px; margin: 12px 0 0; color: #86601c; font-size: .78rem; }
.report-link { display: grid; grid-template-columns: 44px minmax(0, 1fr) auto; align-items: center; gap: 12px; padding: 13px; color: inherit; border: 1px solid var(--pos-line); border-radius: 15px; text-decoration: none; transition: 160ms ease; }
.report-link:hover { border-color: #8bc79d; background: #fbfefc; transform: translateY(-1px); }
.report-link > span { display: grid; place-items: center; width: 44px; height: 44px; color: #188038; background: #e9f6ed; border-radius: 12px; }
.report-link strong, .report-link small { display: block; }
.report-link strong { overflow: hidden; color: var(--pos-navy); text-overflow: ellipsis; white-space: nowrap; }
.report-link small { margin-top: 2px; color: var(--pos-muted); font-size: .72rem; }
.sync-status { display: flex; align-items: center; gap: 11px; margin-top: 12px; padding: 12px 14px; color: #176b34; background: #f4faf6; border-radius: 13px; }
.sync-status--pending { color: #895d0b; background: #fff8e9; }
.sync-status > span { display: grid; place-items: center; width: 34px; height: 34px; background: rgba(255,255,255,.72); border-radius: 10px; }
.sync-status strong, .sync-status small { display: block; }
.sync-status strong { color: var(--pos-navy); font-size: .85rem; }
.sync-status small { margin-top: 1px; color: var(--pos-muted); font-size: .72rem; }
.sheets-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
.dialog-icon { display: grid; place-items: center; width: 48px; height: 48px; color: var(--pos-danger); background: #fbeaec; border-radius: 14px; }
.dialog-icon + h2 { margin: 16px 0 6px; color: var(--pos-navy); font: 700 1.3rem 'Outfit', sans-serif; }
.dialog-icon ~ p { margin: 0; color: var(--pos-muted); line-height: 1.5; }
@media (max-width: 599px) {
  .sheets-heading { grid-template-columns: 44px 1fr; }
  .connection-badge { grid-column: 1 / -1; justify-self: start; }
  .sheets-actions { align-items: stretch; flex-direction: column; }
  .sheets-actions .v-btn { width: 100%; }
}
</style>
