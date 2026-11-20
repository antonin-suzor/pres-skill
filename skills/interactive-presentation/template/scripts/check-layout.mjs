// Checks src/diagramSpec.ts for geometry problems, for EVERY option x variant, because the visible
// boxes, arrows and labels change with them. Run it after each change to the diagram:
//   npm run check:layout
// Errors (exit code 1): overlapping boxes, a label over a box or over another label, an arrow
// crossing a box it does not connect, a box outside the viewBox, a box title or subtitle wider
// than its box (estimated: about 8.2 px per character for the title, 6 px for the subtitle).
// Warnings: an arrow end that touches no box, a label sitting on another arrow, a badge on a box.
import { createServer } from 'vite'

const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' })
let spec, data
try {
  spec = await vite.ssrLoadModule('/src/diagramSpec.ts')
  data = await vite.ssrLoadModule('/src/data.ts')
} finally {
  await vite.close()
}

const { NODES, EDGES, BADGES, VIEWBOX, labelWidth } = spec
const { OPTIONS, VARIANT, PROBLEMS } = data

const overlap = (a, b, pad = 0) => a.x < b.x + b.w + pad && b.x < a.x + a.w + pad && a.y < b.y + b.h + pad && b.y < a.y + a.h + pad
const inside = (p, r, m = 0) => p[0] > r.x + m && p[0] < r.x + r.w - m && p[1] > r.y + m && p[1] < r.y + r.h - m
const touches = (p, r, tol = 4) => p[0] >= r.x - tol && p[0] <= r.x + r.w + tol && p[1] >= r.y - tol && p[1] <= r.y + r.h + tol

function segmentHits(from, to, r, margin = 3) {
  const len = Math.hypot(to[0] - from[0], to[1] - from[1])
  const steps = Math.max(2, Math.ceil(len / 2))
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    if (inside([from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t], r, margin)) return true
  }
  return false
}

const problems = { error: new Set(), warn: new Set() }
const report = (level, ctxName, msg) => problems[level].add(`${ctxName}: ${msg}`)

const variants = VARIANT ? VARIANT.choices.map((v) => v.id) : ['']
for (const o of OPTIONS) {
  for (const v of variants) {
    if (VARIANT && VARIANT.hideFor.includes(o.id) && v !== variants[0]) continue
    const c = { o: o.id, v }
    const name = `option "${o.id}"${v && !VARIANT.hideFor.includes(o.id) ? `, variant "${v}"` : ''}`
    const nodes = NODES.filter((n) => !n.show || n.show(c)).map((n) => ({ ...n, r: { x: n.x, y: n.y, w: n.w, h: n.h } }))
    const edges = EDGES.filter((e) => !e.show || e.show(c))
    const labels = edges
      .filter((e) => e.label)
      .map((e) => {
        const text = e.label(c)
        const [lx, ly] = e.labelAt ?? [(e.from[0] + e.to[0]) / 2, (e.from[1] + e.to[1]) / 2]
        const w = labelWidth(text)
        return { e, text, r: { x: lx - w / 2, y: ly - 11, w, h: 18 } }
      })
    const badges = PROBLEMS.filter((p) => BADGES[p.n]).map((p) => {
      const [x, y] = BADGES[p.n]
      const withText = p.status[o.id] !== 'bad' // the badge then shows "#n" to its right
      return { p, r: { x: x - 11, y: y - 11, w: withText ? 40 : 22, h: 22 } }
    })

    for (const a of nodes) {
      const id = `box "${a.id}"`
      const title = typeof a.title === 'string' ? a.title : a.title(c)
      const sub = a.sub?.(c) ?? ''
      for (const [what, text, px] of [['title', title, 8.2], ['subtitle', sub, 6]]) {
        if (text.length * px > a.w - 12) report('error', name, `${id}: ${what} "${text}" is about ${Math.round(text.length * px)} px wide, the box is ${a.w}`)
      }
      if (a.x < 0 || a.y < 0 || a.x + a.w > VIEWBOX[0] || a.y + a.h > VIEWBOX[1]) report('error', name, `${id} is outside the viewBox`)
      for (const b of nodes) if (a.id < b.id && overlap(a.r, b.r)) report('error', name, `${id} overlaps box "${b.id}"`)
    }
    for (const l of labels) {
      const id = `label "${l.text}" (edge ${l.e.id})`
      if (l.r.x < 0 || l.r.y < 0 || l.r.x + l.r.w > VIEWBOX[0] || l.r.y + l.r.h > VIEWBOX[1]) report('error', name, `${id} is outside the viewBox`)
      for (const n of nodes) if (overlap(l.r, n.r)) report('error', name, `${id} covers box "${n.id}"`)
      for (const m of labels) if (l.e.id < m.e.id && overlap(l.r, m.r)) report('error', name, `${id} overlaps label "${m.text}"`)
      for (const e of edges) if (e.id !== l.e.id && segmentHits(e.from, e.to, l.r, 0)) report('warn', name, `${id} sits on arrow ${e.id}`)
    }
    for (const e of edges) {
      const ends = [e.from, e.to]
      for (const p of ends) if (!nodes.some((n) => touches(p, n.r))) report('warn', name, `arrow ${e.id} has an end that touches no box`)
      for (const n of nodes) {
        if (ends.some((p) => touches(p, n.r))) continue
        if (segmentHits(e.from, e.to, n.r)) report('error', name, `arrow ${e.id} crosses box "${n.id}"`)
      }
    }
    for (const b of badges) {
      const id = `badge #${b.p.n}`
      for (const n of nodes) if (overlap(b.r, n.r)) report('warn', name, `${id} sits on box "${n.id}"`)
      for (const l of labels) if (overlap(b.r, l.r)) report('error', name, `${id} overlaps label "${l.text}"`)
      for (const m of badges) if (b.p.n < m.p.n && overlap(b.r, m.r)) report('error', name, `${id} overlaps badge #${m.p.n}`)
    }
  }
}

for (const m of problems.warn) console.warn(`warn  ${m}`)
for (const m of problems.error) console.error(`ERROR ${m}`)
const n = OPTIONS.length * variants.length
console.log(`checked ${OPTIONS.length} options x ${variants.length} variants (${n} combinations): ${problems.error.size} errors, ${problems.warn.size} warnings`)
process.exit(problems.error.size ? 1 : 0)
