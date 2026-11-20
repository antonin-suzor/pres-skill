// Generic SVG renderer for diagramSpec.ts. Edit it only to change how things are drawn.
import type { Opt } from './data'
import { PROBLEMS, STATUSES } from './data'
import { BADGES, EDGES, NODES, TAGS, VIEWBOX, labelWidth } from './diagramSpec'

// A box is grey unless the selected option adds (NEW) or changes (CHANGED) it.
const SAME = { fill: '#f1f5f9', stroke: '#94a3b8' }
import type { Ctx } from './diagramSpec'

export default function Diagram({ opt, variant }: { opt: Opt; variant: string }) {
  const c: Ctx = { o: opt, v: variant }
  return (
    <svg viewBox={`0 0 ${VIEWBOX[0]} ${VIEWBOX[1]}`} className="h-auto w-full select-none">
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#475569" />
        </marker>
        <marker id="arrow-hl" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#059669" />
        </marker>
      </defs>

      {EDGES.filter((e) => !e.show || e.show(c)).map((e) => {
        const hl = e.highlight?.(c) ?? false
        const dashed = typeof e.dashed === 'function' ? e.dashed(c) : e.dashed
        return (
          <line
            key={e.id}
            x1={e.from[0]}
            y1={e.from[1]}
            x2={e.to[0]}
            y2={e.to[1]}
            stroke={hl ? '#059669' : '#475569'}
            strokeWidth={hl ? 2.5 : 1.6}
            strokeDasharray={dashed ? '6 5' : undefined}
            markerEnd={`url(#${hl ? 'arrow-hl' : 'arrow'})`}
          />
        )
      })}

      {NODES.filter((n) => !n.show || n.show(c)).map((n) => {
        const tag = n.tag?.(c) ?? null
        const sub = n.sub?.(c)
        const title = typeof n.title === 'string' ? n.title : n.title(c)
        const style = tag ? TAGS[tag] : SAME
        return (
          <g key={n.id}>
            <rect
              x={n.x}
              y={n.y}
              width={n.w}
              height={n.h}
              rx={10}
              fill={style.fill}
              stroke={style.stroke}
              strokeWidth={tag ? 3 : 1.5}
              strokeDasharray={n.dashed?.(c) ? '8 5' : undefined}
            />
            <text x={n.x + n.w / 2} y={n.y + n.h / 2 - (sub ? 6 : -4)} textAnchor="middle" fontSize={14} fontWeight={600} fill="#0f172a">
              {title}
            </text>
            {sub && (
              <text x={n.x + n.w / 2} y={n.y + n.h / 2 + 14} textAnchor="middle" fontSize={11} fill="#475569">
                {sub}
              </text>
            )}
            {tag && (
              <g>
                <rect x={n.x + n.w - 62} y={n.y - 9} width={58} height={17} rx={8} fill={TAGS[tag].stroke} />
                <text x={n.x + n.w - 33} y={n.y + 3} textAnchor="middle" fontSize={10} fill="white" fontWeight={600}>
                  {tag}
                </text>
              </g>
            )}
          </g>
        )
      })}

      {/* Edge labels are drawn after the nodes, so no node can hide them */}
      {EDGES.filter((e) => e.label && (!e.show || e.show(c))).map((e) => {
        const hl = e.highlight?.(c) ?? false
        const label = e.label!(c)
        const [lx, ly] = e.labelAt ?? [(e.from[0] + e.to[0]) / 2, (e.from[1] + e.to[1]) / 2]
        return (
          <g key={`${e.id}-label`}>
            <rect x={lx - labelWidth(label) / 2} y={ly - 11} width={labelWidth(label)} height={18} rx={4} fill="white" stroke={hl ? '#059669' : '#cbd5e1'} />
            <text x={lx} y={ly + 2} textAnchor="middle" fontSize={11} fill={hl ? '#065f46' : '#334155'} fontFamily="ui-monospace, monospace">
              {label}
            </text>
          </g>
        )
      })}

      {PROBLEMS.filter((p) => BADGES[p.n]).map((p) => {
        const [x, y] = BADGES[p.n]
        const s = STATUSES[p.status[opt]]
        return (
          <g key={p.n}>
            <title>{`#${p.n} ${p.title}`}</title>
            <circle cx={x} cy={y} r={11} fill={s.color} stroke="white" strokeWidth={2} />
            <text x={x} y={y + 4} textAnchor="middle" fontSize={12} fontWeight={700} fill="white">
              {s.symbol || String(p.n)}
            </text>
            {s.symbol && (
              <text x={x + 14} y={y + 4} fontSize={10} fill={s.color} fontWeight={600}>
                #{p.n}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}
