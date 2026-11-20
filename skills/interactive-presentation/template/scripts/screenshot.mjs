// One PNG per option (and per variant), so you can LOOK at the page, e.g. to find overlaps in the diagram.
//   node scripts/screenshot.mjs [page] [outDir] [--height=2600]
// `page` is a URL or an HTML file: default http://localhost:5173/ (npm run dev) or ./presentation.html.
// Needs a headless Chrome/Chromium: set CHROME_BIN, or have chromium / google-chrome / a Playwright
// download (~/.cache/ms-playwright) on the machine. No npm dependency.
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { createServer } from 'vite'

const args = process.argv.slice(2)
const height = (args.find((a) => a.startsWith('--height=')) ?? '--height=2600').split('=')[1]
const [pageArg, outDir = 'screens'] = args.filter((a) => !a.startsWith('--'))
const page = pageArg ?? (existsSync('presentation.html') ? 'presentation.html' : 'http://localhost:5173/')
const base = /^https?:\/\//.test(page) ? page : pathToFileURL(resolve(page)).href

function findChrome() {
  if (process.env.CHROME_BIN) return process.env.CHROME_BIN
  for (const name of ['chrome-headless-shell', 'chromium', 'chromium-browser', 'google-chrome', 'google-chrome-stable']) {
    try {
      return execFileSync('which', [name], { encoding: 'utf8' }).trim()
    } catch {}
  }
  const pw = join(homedir(), '.cache', 'ms-playwright')
  if (existsSync(pw)) {
    for (const d of readdirSync(pw).sort().reverse()) {
      for (const sub of ['chrome-headless-shell-linux64/chrome-headless-shell', 'chrome-linux/chrome', 'chrome-linux64/chrome']) {
        const p = join(pw, d, sub)
        if (existsSync(p)) return p
      }
    }
  }
  return null
}

const chrome = findChrome()
if (!chrome) {
  console.error('No headless Chrome found. Set CHROME_BIN, or install chromium / run `npx playwright install chromium`.')
  process.exit(2)
}

const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' })
const { OPTIONS, VARIANT } = await vite.ssrLoadModule('/src/data.ts')
await vite.close()

mkdirSync(outDir, { recursive: true })
const headless = chrome.includes('headless-shell') ? [] : ['--headless=new']
for (const o of OPTIONS) {
  const variants = VARIANT && !VARIANT.hideFor.includes(o.id) ? VARIANT.choices.map((v) => v.id) : [null]
  for (const v of variants) {
    const out = join(outDir, `${o.id}${v ? `-${v}` : ''}.png`)
    const url = `${base.split('#')[0]}#opt=${o.id}${v ? `&v=${v}` : ''}`
    execFileSync(chrome, [...headless, '--no-sandbox', '--disable-gpu', '--hide-scrollbars', '--virtual-time-budget=3000', `--window-size=1500,${height}`, `--screenshot=${resolve(out)}`, url], { stdio: 'ignore' })
    console.log(out)
  }
}
