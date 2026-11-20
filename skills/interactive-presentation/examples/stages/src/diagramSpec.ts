// STAGES example diagram. The layout is the same for the three stages: a box never moves, so flipping
// between stages shows what changed. Boxes added by a stage sit in spots that are empty before it.
// Grid: columns x10 w170 | x300 w200 | x620 w200; rows (h 80) y40 | y200 | y360.

import type { Opt } from './data'

export const VIEWBOX: [number, number] = [1160, 480]

export const TAGS = {
  NEW: { fill: '#ecfdf5', stroke: '#059669', legend: 'new in this stage' },
  CHANGED: { fill: '#f0f9ff', stroke: '#0284c7', legend: 'changed in this stage' },
} as const
export type Tag = keyof typeof TAGS

export const DASHED_LEGEND: string | null = 'exists, but is only a fallback'

export type Ctx = { o: Opt; v: string }
type Fn<T> = (c: Ctx) => T

export type Node = {
  id: string
  x: number
  y: number
  w: number
  h: number
  title: Fn<string> | string
  sub?: Fn<string>
  show?: Fn<boolean>
  tag?: Fn<Tag | null>
  dashed?: Fn<boolean>
}

export type Edge = {
  id: string
  from: [number, number]
  to: [number, number]
  label?: Fn<string>
  labelAt?: [number, number]
  show?: Fn<boolean>
  dashed?: boolean | Fn<boolean>
  highlight?: Fn<boolean>
}

const today = (c: Ctx) => c.o === 'today'
const admin = (c: Ctx) => c.o === 'admin'

export const NODES: Node[] = [
  {
    id: 'app',
    x: 10, y: 200, w: 170, h: 80,
    title: 'Client app',
    sub: (c) => (today(c) ? 'reads flags at startup' : 'asks, caches 30 s'),
    tag: (c) => (today(c) ? null : 'CHANGED'),
  },
  {
    id: 'cfg',
    x: 300, y: 40, w: 200, h: 80,
    title: 'flags.json',
    sub: (c) => (today(c) ? 'in the repo · needs a deploy' : 'fallback if the service is down'),
    dashed: (c) => !today(c),
  },
  {
    id: 'svc',
    x: 300, y: 200, w: 200, h: 80,
    title: 'Flag service',
    sub: (c) => (admin(c) ? 'rules · audit · last-seen' : 'rules per customer'),
    show: (c) => !today(c),
    tag: (c) => (admin(c) ? 'CHANGED' : 'NEW'),
  },
  {
    id: 'store',
    x: 620, y: 200, w: 200, h: 80,
    title: 'Flag store',
    sub: () => 'flags + rules',
    show: (c) => !today(c),
    tag: (c) => (admin(c) ? null : 'NEW'),
  },
  { id: 'ui', x: 300, y: 360, w: 200, h: 80, title: 'Admin UI', sub: () => 'toggle, rules, stale flags', show: admin, tag: () => 'NEW' },
  { id: 'audit', x: 620, y: 360, w: 200, h: 80, title: 'Audit log', sub: () => 'who · what · when · previous', show: admin, tag: () => 'NEW' },
]

export const EDGES: Edge[] = [
  { id: 'e-file', from: [150, 200], to: [300, 90], label: () => 'read at start', labelAt: [225, 145], show: today },
  { id: 'e-ask', from: [180, 240], to: [300, 240], label: () => 'evaluate', labelAt: [240, 240], show: (c) => !today(c), highlight: () => true },
  { id: 'e-store', from: [500, 240], to: [620, 240], label: () => 'rules', labelAt: [560, 240], show: (c) => !today(c) },
  { id: 'e-write', from: [400, 360], to: [400, 280], label: () => 'write flags', labelAt: [400, 320], show: admin, highlight: () => true },
  { id: 'e-audit', from: [500, 270], to: [640, 360], label: () => 'every change', labelAt: [555, 328], show: admin, highlight: () => true },
]

export const BADGES: Record<number, [number, number]> = {
  1: [518, 56],
  2: [196, 214],
  3: [270, 350],
  4: [838, 214],
}

export const labelWidth = (s: string) => s.length * 6.4 + 12
