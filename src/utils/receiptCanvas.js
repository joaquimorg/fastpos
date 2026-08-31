// Geração de talões como imagem (canvas), com aspeto de recibo impresso:
// papel com cantos arredondados, borda inferior serrilhada e sombra suave.
// Partilhado entre o talão de venda e o talão de resumo do dia.

const MUTED = '#7c8a8f'
const NAVY = '#112d38'
const DANGER = '#bd3b43'
const ACCENT = '#d9ef56'

const FONT = {
  brand: "700 10px 'Work Sans', sans-serif",
  title: "700 20px 'Outfit', 'Work Sans', sans-serif",
  meta: "12px 'Work Sans', sans-serif",
  label: "700 11px 'Work Sans', sans-serif",
  itemName: "700 13.5px 'Work Sans', sans-serif",
  itemSub: "12px 'Work Sans', sans-serif",
  amount: "700 14px 'Work Sans', sans-serif",
  totalLabel: "700 11px 'Work Sans', sans-serif",
  totalAmount: "700 22px 'Outfit', 'Work Sans', sans-serif",
  thanks: "700 13px 'Work Sans', sans-serif",
  legal: "italic 10.5px 'Work Sans', sans-serif",
}

function fontSize(font) {
  return Number(font.match(/(\d+(?:\.\d+)?)px/)[1])
}

function loadIcon(src) {
  return new Promise(resolve => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = src
  })
}

function fitText(ctx, text, maxWidth) {
  if (ctx.measureText(text).width <= maxWidth) return text
  let t = text
  while (t.length > 1 && ctx.measureText(`${t}…`).width > maxWidth) t = t.slice(0, -1)
  return `${t}…`
}

function paperPath(ctx, x, y, w, h, radius, tooth, toothH) {
  const teeth = Math.max(4, Math.round(w / tooth))
  const step = w / teeth
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + w - radius, y)
  ctx.arcTo(x + w, y, x + w, y + radius, radius)
  ctx.lineTo(x + w, y + h - toothH)
  for (let i = 0; i < teeth; i++) {
    const startX = x + w - i * step
    ctx.lineTo(startX - step / 2, y + h)
    ctx.lineTo(startX - step, y + h - toothH)
  }
  ctx.lineTo(x, y + radius)
  ctx.arcTo(x, y, x + radius, y, radius)
  ctx.closePath()
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

// blocks: array of { type, ... } — ver tipos suportados abaixo.
// currency: 'scarf' (ícone do lenço) ou 'euro' (símbolo €).
export async function openReceiptImage(blocks, { currency = 'scarf' } = {}) {
  const useIcon = currency === 'scarf'
  const icon = useIcon ? await loadIcon('/lenco.png') : null
  try { await document.fonts?.ready } catch { /* fontes indisponíveis, segue com a fallback do sistema */ }
  const formatAmount = value => useIcon ? Number(value).toFixed(2) : `€ ${Number(value).toFixed(2)}`

  const measureCanvas = document.createElement('canvas'); const mctx = measureCanvas.getContext('2d')
  const PAPER_W = 300; const PAD_X = 22; const CONTENT_W = PAPER_W - PAD_X * 2
  const OUTER_PAD = 22; const RADIUS = 12; const TOOTH = 11; const TOOTH_H = 7

  let y = 30
  const ops = []
  const centerLine = (text, font, color, gap = 0) => { ops.push({ t: 'center', text, font, color, y }); y += fontSize(font) + gap }
  const dashed = (gap = 26) => { y += gap / 2; ops.push({ t: 'dashed', y }); y += gap / 2 }

  blocks.forEach(block => {
    if (block.type === 'brand') centerLine('F A S T P O S', FONT.brand, MUTED, 6)
    else if (block.type === 'title') centerLine(block.text, FONT.title, NAVY, 4)
    else if (block.type === 'meta') centerLine(block.text, FONT.meta, MUTED, 14)
    else if (block.type === 'thanks') centerLine(block.text || 'Obrigado pela preferência!', FONT.thanks, NAVY, 5)
    else if (block.type === 'legal') centerLine(block.text || 'Este talão não tem valor legal.', FONT.legal, MUTED, 0)
    else if (block.type === 'divider') dashed()
    else if (block.type === 'label') { ops.push({ t: 'label', text: block.text, y, color: MUTED }); y += 20 }
    else if (block.type === 'item') {
      mctx.font = FONT.itemName
      const name = fitText(mctx, block.name, CONTENT_W)
      ops.push({ t: 'item-name', text: name, y, color: NAVY }); y += 18
      ops.push({
        t: 'item-sub', text: block.sub, y,
        color: block.negative ? DANGER : MUTED,
        amountText: formatAmount(Math.abs(block.amount)),
        amountColor: block.negative ? DANGER : NAVY,
        negative: block.negative,
      })
      y += 22
    } else if (block.type === 'kv') {
      ops.push({
        t: 'kv', y, label: block.label,
        amountText: formatAmount(Math.abs(block.amount)),
        negative: block.negative,
        amountColor: block.negative ? DANGER : NAVY,
      })
      y += 22
    } else if (block.type === 'total') {
      const height = block.tone === 'accent' ? 42 : 46
      ops.push({ t: 'total-bar', y, height, label: block.label, amountText: formatAmount(Math.abs(block.amount)), tone: block.tone || 'navy' })
      y += height + 12
    }
  })
  y += 6

  const contentHeight = y
  const paperH = contentHeight + TOOTH_H
  const canvasW = PAPER_W + OUTER_PAD * 2
  const canvasH = paperH + OUTER_PAD * 2
  const scale = Math.min(3, Math.max(2, window.devicePixelRatio || 2))
  const canvas = document.createElement('canvas')
  canvas.width = canvasW * scale; canvas.height = canvasH * scale
  const ctx = canvas.getContext('2d')
  ctx.scale(scale, scale)

  ctx.fillStyle = '#eef1ef'; ctx.fillRect(0, 0, canvasW, canvasH)

  const px = OUTER_PAD; const py = OUTER_PAD
  ctx.save()
  ctx.shadowColor = 'rgba(17,45,56,.22)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 8
  paperPath(ctx, px, py, PAPER_W, paperH, RADIUS, TOOTH, TOOTH_H)
  ctx.fillStyle = '#fffdf8'; ctx.fill()
  ctx.restore()
  paperPath(ctx, px, py, PAPER_W, paperH, RADIUS, TOOTH, TOOTH_H)
  ctx.save(); ctx.clip()

  const cx = px + PAPER_W / 2; const left = px + PAD_X; const right = px + PAPER_W - PAD_X
  ctx.textBaseline = 'alphabetic'
  const drawAmount = (text, xRight, yBase, font, color, withIcon) => {
    ctx.font = font; ctx.fillStyle = color; ctx.textAlign = 'right'
    ctx.fillText(text, xRight, yBase)
    if (withIcon && icon) {
      const w = ctx.measureText(text).width
      ctx.drawImage(icon, xRight - w - 18, yBase - 12, 14, 14)
    }
  }

  ops.forEach(op => {
    const oy = py + op.y
    if (op.t === 'center') {
      ctx.font = op.font; ctx.fillStyle = op.color; ctx.textAlign = 'center'
      ctx.fillText(op.text, cx, oy)
    } else if (op.t === 'label') {
      ctx.font = FONT.label; ctx.fillStyle = op.color; ctx.textAlign = 'left'
      ctx.fillText(op.text.toUpperCase(), left, oy)
    } else if (op.t === 'dashed') {
      ctx.save(); ctx.strokeStyle = '#d7ddd6'; ctx.lineWidth = 1.4; ctx.setLineDash([4, 4])
      ctx.beginPath(); ctx.moveTo(left, py + op.y); ctx.lineTo(right, py + op.y); ctx.stroke(); ctx.restore()
    } else if (op.t === 'item-name') {
      ctx.font = FONT.itemName; ctx.fillStyle = op.color; ctx.textAlign = 'left'
      ctx.fillText(op.text, left, oy)
    } else if (op.t === 'item-sub') {
      ctx.font = FONT.itemSub; ctx.fillStyle = op.color; ctx.textAlign = 'left'
      ctx.fillText(op.text, left, oy)
      drawAmount(`${op.negative ? '−' : ''}${op.amountText}`, right, oy, FONT.amount, op.amountColor, useIcon)
    } else if (op.t === 'kv') {
      ctx.font = FONT.meta; ctx.fillStyle = MUTED; ctx.textAlign = 'left'; ctx.fillText(op.label, left, oy)
      drawAmount(`${op.negative ? '−' : ''}${op.amountText}`, right, oy, FONT.amount, op.amountColor, useIcon)
    } else if (op.t === 'total-bar') {
      const isAccent = op.tone === 'accent'
      ctx.fillStyle = isAccent ? ACCENT : NAVY
      roundRect(ctx, left - 2, oy, right - left + 4, op.height, 10); ctx.fill()
      ctx.font = FONT.totalLabel; ctx.fillStyle = isAccent ? 'rgba(17,45,56,.65)' : 'rgba(255,255,255,.72)'; ctx.textAlign = 'left'
      ctx.fillText(op.label.toUpperCase(), left + 12, oy + 16)
      drawAmount(op.amountText, right - 12, oy + op.height - 10, FONT.totalAmount, isAccent ? NAVY : '#ffffff', useIcon)
    }
  })
  ctx.restore()

  return new Promise(resolve => {
    canvas.toBlob(blob => { window.open(URL.createObjectURL(blob), '_blank'); resolve() }, 'image/png')
  })
}
