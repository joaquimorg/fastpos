const GIS_SRC = 'https://accounts.google.com/gsi/client'
const GAPI_SRC = 'https://apis.google.com/js/api.js'
const SHEETS_API = 'https://sheets.googleapis.com/v4/spreadsheets'
const DRIVE_FILE_SCOPE = 'https://www.googleapis.com/auth/drive.file'
const DEVICE_ID_KEY = 'fastpos_device_id'
const DEVICE_LABEL_KEY = 'fastpos_device_label'

let gisPromise
let gapiPickerPromise
let accessToken = ''
let tokenClient

function detectDeviceLabel() {
  const ua = navigator.userAgent || ''
  const platform = /iPhone|iPad|iPod/.test(ua) ? 'iOS' : /Android/.test(ua) ? 'Android' : /Mac OS X/.test(ua) ? 'Mac' : /Windows/.test(ua) ? 'Windows' : /Linux/.test(ua) ? 'Linux' : ''
  const browser = /Edg\//.test(ua) ? 'Edge' : /OPR\//.test(ua) ? 'Opera' : /Chrome\//.test(ua) ? 'Chrome' : /Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : 'Navegador'
  return [browser, platform].filter(Boolean).join(' · ') || 'Dispositivo'
}

// Identifica este dispositivo/navegador de forma estável, para distinguir
// as abas criadas por cada um quando a mesma conta Google é usada em vários
// dispositivos.
export function getDeviceId() {
  let id = ''
  try { id = localStorage.getItem(DEVICE_ID_KEY) || '' } catch { /* localStorage indisponível */ }
  if (!id) {
    id = window.crypto?.randomUUID?.() || `dev-${Date.now()}-${Math.random().toString(16).slice(2)}`
    try { localStorage.setItem(DEVICE_ID_KEY, id) } catch { /* localStorage indisponível */ }
  }
  return id
}

// Etiqueta gerada por omissão: browser + SO detetados não chegam para
// distinguir dois dispositivos parecidos (ex. dois PCs com o mesmo Chrome/
// Windows), por isso junta-se sempre um sufixo curto e único por dispositivo.
function defaultDeviceLabel() {
  return `${detectDeviceLabel()} (${getDeviceId().replace(/[^a-z0-9]/gi, '').slice(0, 4) || '0000'})`
}

// Nome legível deste dispositivo, usado nas abas do relatório (ex.: "Chrome · Windows (a1b2)").
// O utilizador pode personalizá-lo em qualquer altura.
export function getDeviceLabel() {
  let label = ''
  try { label = localStorage.getItem(DEVICE_LABEL_KEY) || '' } catch { /* localStorage indisponível */ }
  if (!label) {
    label = defaultDeviceLabel()
    try { localStorage.setItem(DEVICE_LABEL_KEY, label) } catch { /* localStorage indisponível */ }
  }
  return label
}

export function setDeviceLabel(label) {
  const clean = String(label || '').trim().slice(0, 40) || defaultDeviceLabel()
  try { localStorage.setItem(DEVICE_LABEL_KEY, clean) } catch { /* localStorage indisponível */ }
  return clean
}

function loadGoogleIdentity() {
  if (window.google?.accounts?.oauth2) return Promise.resolve()
  if (gisPromise) return gisPromise
  gisPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${GIS_SRC}"]`)
    const script = existing || document.createElement('script')
    const onLoad = () => window.google?.accounts?.oauth2 ? resolve() : reject(new Error('Não foi possível iniciar a ligação à Google.'))
    const onError = () => reject(new Error('Não foi possível carregar a ligação à Google. Verifique a internet.'))
    script.addEventListener('load', onLoad, { once: true })
    script.addEventListener('error', onError, { once: true })
    if (!existing) {
      script.src = GIS_SRC
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    }
  })
  return gisPromise
}

export function isGoogleSheetsAvailable() {
  return Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID)
}

export function isSpreadsheetPickerAvailable() {
  return Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID && import.meta.env.VITE_GOOGLE_API_KEY)
}

function loadPicker() {
  if (window.google?.picker) return Promise.resolve()
  if (gapiPickerPromise) return gapiPickerPromise
  gapiPickerPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${GAPI_SRC}"]`)
    const script = existing || document.createElement('script')
    const onLoad = () => window.gapi.load('picker', { callback: resolve, onerror: () => reject(new Error('Não foi possível carregar o seletor de ficheiros da Google.')) })
    const onError = () => reject(new Error('Não foi possível carregar o seletor de ficheiros da Google. Verifique a internet.'))
    script.addEventListener('load', onLoad, { once: true })
    script.addEventListener('error', onError, { once: true })
    if (!existing) {
      script.src = GAPI_SRC
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    } else if (window.gapi?.picker) {
      resolve()
    }
  })
  return gapiPickerPromise
}

// Abre o seletor de ficheiros da Google para o utilizador escolher uma folha
// já existente (por exemplo, criada noutro dispositivo com a mesma conta) e
// ligar-se a ela. Devolve null se o utilizador cancelar.
export async function pickExistingSpreadsheet() {
  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY
  if (!apiKey) throw new Error('A seleção de folhas existentes ainda não está configurada nesta instalação.')
  if (!accessToken) throw new Error('É necessário voltar a autorizar a conta Google.')
  await loadPicker()

  return new Promise((resolve, reject) => {
    try {
      const view = new window.google.picker.DocsView(window.google.picker.ViewId.SPREADSHEETS)
        .setMode(window.google.picker.DocsViewMode.LIST)
        .setIncludeFolders(false)
      const picker = new window.google.picker.PickerBuilder()
        .setOAuthToken(accessToken)
        .setDeveloperKey(apiKey)
        .addView(view)
        .setTitle('Escolha o relatório fastPOS já criado noutro dispositivo')
        .setCallback(data => {
          if (data.action === window.google.picker.Action.PICKED) {
            const doc = data.docs?.[0]
            if (!doc) { resolve(null); return }
            resolve({
              spreadsheetId: doc.id,
              spreadsheetName: doc.name,
              spreadsheetUrl: doc.url || `https://docs.google.com/spreadsheets/d/${doc.id}/edit`,
            })
          } else if (data.action === window.google.picker.Action.CANCEL) {
            resolve(null)
          }
        })
        .build()
      picker.setVisible(true)
    } catch {
      reject(new Error('Não foi possível abrir o seletor de ficheiros da Google.'))
    }
  })
}

export async function authorizeGoogleSheets() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  if (!clientId) throw new Error('A ligação ao Google Sheets ainda não está configurada nesta instalação.')
  await loadGoogleIdentity()

  return new Promise((resolve, reject) => {
    let settled = false
    const finish = (handler, value) => {
      if (settled) return
      settled = true
      window.clearTimeout(timeout)
      handler(value)
    }
    const timeout = window.setTimeout(() => finish(reject, new Error('A autorização não foi concluída. O relatório ficou guardado no dispositivo.')), 45000)
    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: DRIVE_FILE_SCOPE,
      callback: response => {
        if (response?.error || !response?.access_token) {
          finish(reject, new Error('A conta Google não foi autorizada.'))
          return
        }
        accessToken = response.access_token
        finish(resolve, accessToken)
      },
      error_callback: () => finish(reject, new Error('A janela de autorização foi fechada.')),
    })
    tokenClient.requestAccessToken({ prompt: accessToken ? '' : 'select_account' })
  })
}

async function googleFetch(url, options = {}) {
  if (!accessToken) throw new Error('É necessário voltar a autorizar a conta Google.')
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  if (response.status === 401) accessToken = ''
  const body = response.status === 204 ? null : await response.json().catch(() => null)
  if (!response.ok) {
    const message = body?.error?.message || 'Não foi possível atualizar o Google Sheets.'
    throw new Error(message)
  }
  return body
}

export async function spreadsheetExists(spreadsheetId) {
  if (!spreadsheetId || !accessToken) return false
  const response = await fetch(`${SHEETS_API}/${spreadsheetId}?fields=spreadsheetId`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (response.status === 401) accessToken = ''
  if (response.status === 404 || response.status === 403) return false
  if (!response.ok) throw new Error('Não foi possível confirmar o relatório no Google Sheets.')
  return true
}

export async function createSalesSpreadsheet() {
  const title = `fastPOS — Relatório de vendas`
  const spreadsheet = await googleFetch(SHEETS_API, {
    method: 'POST',
    body: JSON.stringify({
      properties: { title, locale: 'pt_PT', timeZone: 'Europe/Lisbon' },
      sheets: [{ properties: { title: 'Início', gridProperties: { rowCount: 30, columnCount: 6 } } }],
    }),
  })
  await googleFetch(`${SHEETS_API}/${spreadsheet.spreadsheetId}/values/${encodeURIComponent("'Início'!A1:B7")}?valueInputOption=RAW`, {
    method: 'PUT',
    body: JSON.stringify({ values: [
      ['fastPOS', 'Relatório de vendas'],
      ['', ''],
      ['Como funciona', 'Cada dispositivo tem a sua aba (data + dispositivo). Fechar o mesmo dia no mesmo dispositivo atualiza essa aba; noutro dispositivo, cria uma aba própria.'],
      ['Privacidade', 'O ficheiro pertence a esta conta Google.'],
      ['Sincronização', 'Os dados são enviados apenas quando fecha ou sincroniza um dia.'],
    ] }),
  })
  return {
    spreadsheetId: spreadsheet.spreadsheetId,
    spreadsheetName: title,
    spreadsheetUrl: spreadsheet.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheet.spreadsheetId}/edit`,
  }
}

function escapeSheetTitle(title) {
  return `'${String(title).replaceAll("'", "''")}'`
}

function reportRows(report) {
  const rows = [
    ['fastPOS — Relatório diário'],
    ['Evento', report.eventName || 'Sem nome'],
    ['Data', report.displayDate],
    ['Abertura', report.openedAtLabel],
    ['Fecho', report.closedAtLabel],
    ['Operações', report.saleCount],
    [],
    ['Produto', 'Qtd. vendida', 'Vendas', 'Qtd. devolvida', 'Devoluções', 'Total líquido'],
  ]
  report.products.forEach(product => rows.push([
    product.product,
    product.soldQuantity,
    product.salesTotal,
    product.returnedQuantity,
    product.returnsTotal,
    product.netTotal,
  ]))
  rows.push(
    [],
    ['', '', '', '', 'Total de vendas', report.totalSales],
    ['', '', '', '', 'Total de devoluções', report.totalReturns],
    ['', '', '', '', 'Total líquido', report.totalNet],
    ['', '', '', '', 'Valor recebido', report.totalReceived],
    ['', '', '', '', 'Troco entregue', report.totalChange],
  )
  return rows
}

async function ensureDailySheet(spreadsheetId, title) {
  const spreadsheet = await googleFetch(`${SHEETS_API}/${spreadsheetId}?fields=sheets.properties`)
  const existing = spreadsheet.sheets?.find(sheet => sheet.properties?.title === title)
  if (existing) return existing.properties.sheetId
  const result = await googleFetch(`${SHEETS_API}/${spreadsheetId}:batchUpdate`, {
    method: 'POST',
    body: JSON.stringify({ requests: [{ addSheet: { properties: { title, gridProperties: { rowCount: 200, columnCount: 6, frozenRowCount: 8 } } } }] }),
  })
  return result.replies?.[0]?.addSheet?.properties?.sheetId
}

const SHEET_TITLE_LIMIT = 100

// Nome de aba inválido em Sheets não pode conter : \ / ? * [ ]
function sanitizeSheetTitle(title) {
  return String(title).replace(/[:\\/?*[\]]/g, '-').trim().slice(0, SHEET_TITLE_LIMIT)
}

// Cada dispositivo escreve sempre na mesma aba (data + identificação do
// dispositivo): reabrir o dia no mesmo dispositivo atualiza essa aba; um
// dispositivo diferente, com o mesmo dia, escreve numa aba própria, sem
// sobrepor os dados já guardados.
function dailySheetTitle(date, deviceLabel) {
  return sanitizeSheetTitle(`${date} · ${deviceLabel || getDeviceLabel()}`)
}

export async function syncDailyReport(spreadsheetId, report, options = {}) {
  const { deviceLabel = getDeviceLabel() } = options
  const title = dailySheetTitle(report.date, deviceLabel)
  const sheetId = await ensureDailySheet(spreadsheetId, title)
  const rangeTitle = escapeSheetTitle(title)
  await googleFetch(`${SHEETS_API}/${spreadsheetId}/values/${encodeURIComponent(`${rangeTitle}!A1:F500`)}:clear`, { method: 'POST', body: '{}' })
  await googleFetch(`${SHEETS_API}/${spreadsheetId}/values/${encodeURIComponent(`${rangeTitle}!A1`)}?valueInputOption=RAW`, {
    method: 'PUT',
    body: JSON.stringify({ values: reportRows(report) }),
  })

  const lastRow = 14 + report.products.length
  const moneyPattern = report.currency === 'euro' ? '#,##0.00 "€"' : '0.00 "lenços"'
  await googleFetch(`${SHEETS_API}/${spreadsheetId}:batchUpdate`, {
    method: 'POST',
    body: JSON.stringify({ requests: [
      { updateSheetProperties: { properties: { sheetId, gridProperties: { frozenRowCount: 8 } }, fields: 'gridProperties.frozenRowCount' } },
      { unmergeCells: { range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: 6 } } },
      { mergeCells: { range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: 6 }, mergeType: 'MERGE_ALL' } },
      { repeatCell: { range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: 6 }, cell: { userEnteredFormat: { backgroundColor: { red: .067, green: .176, blue: .22 }, textFormat: { foregroundColor: { red: 1, green: 1, blue: 1 }, bold: true, fontSize: 16 }, horizontalAlignment: 'CENTER', verticalAlignment: 'MIDDLE' } }, fields: 'userEnteredFormat' } },
      { repeatCell: { range: { sheetId, startRowIndex: 7, endRowIndex: 8, startColumnIndex: 0, endColumnIndex: 6 }, cell: { userEnteredFormat: { backgroundColor: { red: .851, green: .937, blue: .337 }, textFormat: { foregroundColor: { red: .067, green: .176, blue: .22 }, bold: true }, horizontalAlignment: 'CENTER' } }, fields: 'userEnteredFormat' } },
      { repeatCell: { range: { sheetId, startRowIndex: 8, endRowIndex: 8 + report.products.length, startColumnIndex: 2, endColumnIndex: 3 }, cell: { userEnteredFormat: { numberFormat: { type: 'NUMBER', pattern: moneyPattern } } }, fields: 'userEnteredFormat.numberFormat' } },
      { repeatCell: { range: { sheetId, startRowIndex: 8, endRowIndex: 8 + report.products.length, startColumnIndex: 4, endColumnIndex: 6 }, cell: { userEnteredFormat: { numberFormat: { type: 'NUMBER', pattern: moneyPattern } } }, fields: 'userEnteredFormat.numberFormat' } },
      { repeatCell: { range: { sheetId, startRowIndex: lastRow - 5, endRowIndex: lastRow, startColumnIndex: 5, endColumnIndex: 6 }, cell: { userEnteredFormat: { numberFormat: { type: 'NUMBER', pattern: moneyPattern } } }, fields: 'userEnteredFormat.numberFormat' } },
      { repeatCell: { range: { sheetId, startRowIndex: lastRow - 5, endRowIndex: lastRow, startColumnIndex: 4, endColumnIndex: 6 }, cell: { userEnteredFormat: { textFormat: { bold: true }, backgroundColor: { red: .95, green: .97, blue: .95 } } }, fields: 'userEnteredFormat' } },
      { autoResizeDimensions: { dimensions: { sheetId, dimension: 'COLUMNS', startIndex: 0, endIndex: 6 } } },
    ] }),
  })
  return title
}

export function disconnectGoogleSheets() {
  if (accessToken && window.google?.accounts?.oauth2) window.google.accounts.oauth2.revoke(accessToken, () => {})
  accessToken = ''
  tokenClient = null
}
