const GIS_SRC = 'https://accounts.google.com/gsi/client'
const SHEETS_API = 'https://sheets.googleapis.com/v4/spreadsheets'
const DRIVE_FILE_SCOPE = 'https://www.googleapis.com/auth/drive.file'

let gisPromise
let accessToken = ''
let tokenClient

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
      ['Como funciona', 'Cada fecho cria ou atualiza uma aba com a data do dia.'],
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

export async function syncDailyReport(spreadsheetId, report) {
  const title = report.date
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
}

export function disconnectGoogleSheets() {
  if (accessToken && window.google?.accounts?.oauth2) window.google.accounts.oauth2.revoke(accessToken, () => {})
  accessToken = ''
  tokenClient = null
}
