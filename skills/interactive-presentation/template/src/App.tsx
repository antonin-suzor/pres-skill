// Generic page: it renders data.ts. Edit it only for something specific to your presentation
// (an extra section, a different layout). Sections with no data are hidden.
import { useEffect, useState } from 'react'
import Diagram from './Diagram'
import type { Opt, Status, StatusDef } from './data'
import { CONFIG, DETAILS, NOTES, OPEN_QUESTIONS, OPTIONS, PROBLEMS, SCENARIOS, STATUSES, VARIANT } from './data'
import { DASHED_LEGEND, NODES, TAGS } from './diagramSpec'

function Chip({ s, text }: { s: Status; text?: string }) {
  return <span className={`inline-block rounded-md border px-2 py-0.5 text-xs font-medium ${STATUSES[s].chip}`}>{text ?? STATUSES[s].label}</span>
}

function Pill({ pill, selected }: { pill: { text: string; tone: 'good' | 'info' }; selected: boolean }) {
  const cls =
    pill.tone === 'good'
      ? selected ? 'bg-white text-emerald-700' : 'bg-emerald-600 text-white'
      : selected ? 'bg-white text-indigo-700' : 'bg-indigo-600 text-white'
  return <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${cls}`}>{pill.text}</span>
}

const variantLabel = (choice: { label: string | ((o: Opt) => string) }, o: Opt) => (typeof choice.label === 'function' ? choice.label(o) : choice.label)

export default function App() {
  // The selection is kept in the URL hash (#opt=outbox&v=fixed): a link opens a given option, and
  // scripts/screenshot.mjs uses it to take one screenshot per option.
  const [opt, setOpt] = useState<Opt>(() => OPTIONS.find((o) => o.id === new URLSearchParams(location.hash.slice(1)).get('opt'))?.id ?? OPTIONS[0].id)
  const [variant, setVariant] = useState<string>(() => {
    const v = new URLSearchParams(location.hash.slice(1)).get('v')
    return VARIANT?.choices.find((x) => x.id === v)?.id ?? VARIANT?.choices[0].id ?? ''
  })

  useEffect(() => {
    history.replaceState(null, '', `#opt=${opt}${VARIANT ? `&v=${variant}` : ''}`)
  }, [opt, variant])

  useEffect(() => {
    document.title = CONFIG.title
  }, [])

  // Keys: 1-9 or left/right arrows switch options, Q cycles the variant. Handy while presenting.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      const ids = OPTIONS.map((o) => o.id)
      const digit = '123456789'.indexOf(e.key)
      if (digit >= 0 && digit < ids.length) setOpt(ids[digit])
      if (e.key === 'ArrowRight') setOpt((o) => ids[Math.min(ids.indexOf(o) + 1, ids.length - 1)])
      if (e.key === 'ArrowLeft') setOpt((o) => ids[Math.max(ids.indexOf(o) - 1, 0)])
      if ((e.key === 'q' || e.key === 'Q') && VARIANT) {
        const cs = VARIANT.choices
        setVariant((v) => cs[(cs.findIndex((x) => x.id === v) + 1) % cs.length].id)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const current = OPTIONS.find((o) => o.id === opt)!
  const d = DETAILS[opt]
  const variantShown = VARIANT && !VARIANT.hideFor.includes(opt)
  const variantNote = variantShown ? d.variantNotes?.[variant] : undefined

  // The legend lists only the statuses that are used somewhere.
  const used = new Set<Status>([...PROBLEMS.flatMap((p) => Object.values(p.status)), ...SCENARIOS.flatMap((s) => Object.values(s.cells).map(([st]) => st))])
  const legendStatuses = (Object.keys(STATUSES) as Status[]).filter((s) => used.has(s) && 'legend' in STATUSES[s])
  const h = CONFIG.headings

  return (
    <div className="mx-auto max-w-[1400px] p-6 text-slate-800">
      <header className="mb-4">
        <h1 className="text-3xl font-bold">{CONFIG.title}</h1>
        <p className="text-slate-600">{CONFIG.subtitle}</p>
      </header>

      <nav className="sticky top-0 z-10 -mx-6 mb-4 flex flex-wrap gap-2 bg-slate-50/95 px-6 py-3 backdrop-blur">
        {OPTIONS.map((o) => (
          <button
            key={o.id}
            onClick={() => setOpt(o.id)}
            className={`rounded-xl border-2 px-5 py-2 text-left transition ${
              opt === o.id ? 'border-emerald-600 bg-emerald-600 text-white shadow' : 'border-slate-300 bg-white hover:border-emerald-500'
            }`}
          >
            <div className="flex items-center gap-2 text-lg font-semibold">
              {o.name}
              {o.pill && <Pill pill={o.pill} selected={opt === o.id} />}
            </div>
            <div className={`text-xs ${opt === o.id ? 'text-emerald-50' : 'text-slate-500'}`}>{o.short}</div>
          </button>
        ))}
        {VARIANT && variantShown && (
          <div className="ml-auto flex items-center gap-1 rounded-xl border-2 border-slate-300 bg-white p-1 text-sm">
            <span className="px-2 font-semibold text-slate-600">{VARIANT.label}:</span>
            {VARIANT.choices.map((v) => (
              <button
                key={v.id}
                onClick={() => setVariant(v.id)}
                className={`rounded-lg px-3 py-1.5 ${variant === v.id ? 'bg-emerald-600 text-white' : 'hover:bg-slate-100'}`}
              >
                {variantLabel(v, opt)}
              </button>
            ))}
          </div>
        )}
      </nav>

      {NODES.length > 0 && (
        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <Diagram opt={opt} variant={variant} />
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-600">
            {legendStatuses.length > 0 && <span className="font-semibold">Badges:</span>}
            {legendStatuses.map((s) => (
              <span key={s}>
                <span className="inline-block h-3 w-3 rounded-full align-middle" style={{ background: STATUSES[s].color }} />{' '}
                {(STATUSES[s] as StatusDef).legend}
              </span>
            ))}
            <span className="ml-4 font-semibold">Boxes:</span>
            <span><span className="inline-block h-3 w-6 rounded border border-slate-400 bg-slate-100 align-middle" /> unchanged</span>
            {(Object.keys(TAGS) as (keyof typeof TAGS)[]).map((t) => (
              <span key={t}>
                <span className="inline-block h-3 w-6 rounded border-2 align-middle" style={{ background: TAGS[t].fill, borderColor: TAGS[t].stroke }} /> {TAGS[t].legend}
              </span>
            ))}
            {DASHED_LEGEND && <span><span className="inline-block h-3 w-6 rounded border-2 border-dashed border-slate-400 align-middle" /> {DASHED_LEGEND}</span>}
          </div>
        </section>
      )}

      <section className="mb-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-2">
          <h2 className="mb-2 flex items-center gap-2 text-xl font-semibold">
            {h.how}: {current.name}
            {current.pill && <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-bold text-white">{current.pill.text}</span>}
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            {d.how.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
          {variantNote && (
            <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm">
              <div className="font-semibold text-emerald-900">{variantNote.title}</div>
              <p>{variantNote.text}</p>
            </div>
          )}
        </div>
        <div className="space-y-4">
          <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
            <h3 className="mb-1 font-semibold text-green-900">{h.pros}</h3>
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {d.pros.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
            <h3 className="mb-1 font-semibold text-red-900">{h.cons}</h3>
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {d.cons.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {PROBLEMS.length > 0 && (
        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-xl font-semibold">{h.problems}</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {PROBLEMS.map((p) => (
              <div key={p.n} className="rounded-xl border border-slate-200 p-3">
                <div className="mb-1 flex items-center gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-white">{p.n}</span>
                  <span className="rounded bg-slate-100 px-1.5 font-mono text-xs">{p.who}</span>
                  <span className="font-semibold">{p.title}</span>
                </div>
                <p className="text-sm text-slate-600">{p.detail}</p>
                <div className="mt-2 flex flex-wrap items-start gap-2">
                  <Chip s={p.status[opt]} />
                  {p.note?.[opt] && <span className="text-sm text-slate-700">{p.note[opt]}</span>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {SCENARIOS.length > 0 && (
        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-xl font-semibold">{h.scenarios}</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="border-b p-2 text-left">Scenario</th>
                  {OPTIONS.map((o) => (
                    <th key={o.id} onClick={() => setOpt(o.id)} className={`cursor-pointer border-b p-2 text-left ${opt === o.id ? 'bg-emerald-50 text-emerald-900' : ''}`}>
                      {o.name}
                      {o.pill && <span className={`ml-1 ${o.pill.tone === 'good' ? 'text-emerald-700' : 'text-indigo-700'}`}>{o.pill.tone === 'good' ? '✓' : '(planned)'}</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SCENARIOS.map((s) => (
                  <tr key={s.title} className="align-top">
                    <td className="border-b p-2 font-medium">{s.title}</td>
                    {OPTIONS.map((o) => {
                      const [st, text] = s.cells[o.id]
                      return (
                        <td key={o.id} className={`border-b p-2 ${opt === o.id ? 'bg-emerald-50' : ''}`}>
                          <Chip s={st} text={text} />
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {(NOTES.length > 0 || OPEN_QUESTIONS.length > 0) && (
        <section className="mb-6 grid gap-4 md:grid-cols-2">
          {NOTES.length > 0 && (
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
              <h2 className="mb-2 text-xl font-semibold text-blue-900">{h.notes}</h2>
              {NOTES.map((f) => (
                <div key={f.title} className="mb-2">
                  <div className="font-semibold">{f.title}</div>
                  <p className="text-sm">{f.text}</p>
                </div>
              ))}
            </div>
          )}
          {OPEN_QUESTIONS.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="mb-2 text-xl font-semibold">{h.questions}</h2>
              <ul className="list-disc space-y-1 pl-5 text-sm">
                {OPEN_QUESTIONS.map((q) => (
                  <li key={q}>{q}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      <footer className="pb-8 text-xs text-slate-500">
        Keys 1–{OPTIONS.length} or ← → switch between the options{VARIANT ? `; Q switches the ${VARIANT.label.toLowerCase()}` : ''}.
      </footer>
    </div>
  )
}
