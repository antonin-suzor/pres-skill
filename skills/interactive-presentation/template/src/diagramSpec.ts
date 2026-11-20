// The diagram, as data. Edit this file for your presentation; Diagram.tsx draws it.
//
// One layout for ALL options: a component keeps its place from one option to the next, so the
// options can be compared by flipping between them. Only its text, tag and visibility change.
// Put a component that exists in one option only in a spot that is empty in the others.
//
// Run `npm run check:layout` after every change: it reports overlaps for every option and variant.

import type { Opt } from './data'

export const VIEWBOX: [number, number] = [1160, 480]

// Box tags. A tagged box gets a thick coloured border and a small pill; every other box is grey.
// Keep it that way: colour means "changed here", never "kind of component".
export const TAGS = {
  NEW: { fill: '#ecfdf5', stroke: '#059669', legend: 'new in this option' },
  CHANGED: { fill: '#f0f9ff', stroke: '#0284c7', legend: 'changed in this option' },
} as const
export type Tag = keyof typeof TAGS

// Legend text for dashed boxes and arrows ("exists but does nothing", "optional"). null = no legend entry.
export const DASHED_LEGEND: string | null = 'optional or not active'

// Context passed to every function below: c.o = the selected option, c.v = the selected variant id
// ('' if VARIANT is null in data.ts).
export type Ctx = { o: Opt; v: string }
type Fn<T> = (c: Ctx) => T

export type Node = {
  id: string
  x: number
  y: number
  w: number
  h: number
  title: Fn<string> | string
  sub?: Fn<string> // second line, font size 11
  show?: Fn<boolean>
  tag?: Fn<Tag | null>
  dashed?: Fn<boolean>
}

// Edges are straight lines. Give both points by hand ON the border of the boxes they join.
export type Edge = {
  id: string
  from: [number, number]
  to: [number, number]
  label?: Fn<string>
  labelAt?: [number, number] // centre of the label box; default = middle of the edge
  show?: Fn<boolean>
  dashed?: boolean | Fn<boolean>
  highlight?: Fn<boolean> // green: the new or changed flow
}

const isToday = (c: Ctx) => c.o === 'today'
const isQueue = (c: Ctx) => c.o === 'queue'
const isOutbox = (c: Ctx) => c.o === 'outbox'

// Grid used here: columns x10 w170 | x260 w190 | x530 w200 | x830 w190; rows (h 80) y40 | y200 | y360.
export const NODES: Node[] = [
  {
    id: 'web',
    x: 10, y: 200, w: 170, h: 80,
    title: 'Web app',
    sub: (c) => (isToday(c) ? 'sends the e-mail itself' : 'returns right away'),
    tag: (c) => (isToday(c) ? null : 'CHANGED'),
  },
  {
    id: 'db',
    x: 10, y: 360, w: 170, h: 80,
    title: 'Orders database',
    sub: (c) => (isOutbox(c) ? 'order + outbox, 1 tx' : 'orders'),
  },
  {
    id: 'queue',
    x: 260, y: 40, w: 190, h: 80,
    title: 'Message queue',
    sub: () => 'retries + dead-letter queue',
    show: isQueue,
    tag: () => 'NEW',
  },
  {
    id: 'outbox',
    x: 260, y: 360, w: 190, h: 80,
    title: 'Outbox table',
    sub: () => 'one row per e-mail + status',
    show: isOutbox,
    tag: () => 'NEW',
  },
  {
    id: 'worker',
    x: 530, y: 200, w: 200, h: 80,
    title: (c) => (isOutbox(c) ? 'Relay' : 'E-mail worker'),
    sub: (c) => (c.v === 'fixed' ? 'retry every 5 min' : 'retry with backoff'),
    show: (c) => !isToday(c),
    tag: () => 'NEW',
  },
  {
    id: 'dlq',
    x: 530, y: 360, w: 200, h: 80,
    title: 'Dead-letter store',
    sub: () => 'after 5 failures · alarm',
    show: (c) => !isToday(c),
    tag: () => 'NEW',
  },
  {
    id: 'smtp',
    x: 830, y: 200, w: 190, h: 80,
    title: 'E-mail provider',
    sub: () => 'HTTP API',
  },
]

export const EDGES: Edge[] = [
  { id: 'e-send-direct', from: [180, 240], to: [830, 240], label: () => 'send (blocks the request)', labelAt: [500, 240], show: isToday },
  { id: 'e-enqueue', from: [140, 200], to: [260, 100], label: () => 'enqueue', labelAt: [190, 148], show: isQueue, highlight: () => true },
  {
    id: 'e-db',
    from: [95, 280],
    to: [95, 360],
    label: (c) => (isOutbox(c) ? 'order + outbox row' : 'INSERT order'),
    labelAt: [95, 320],
    highlight: isOutbox,
  },
  { id: 'e-db-outbox', from: [180, 400], to: [260, 400], show: isOutbox, highlight: () => true },
  { id: 'e-poll-queue', from: [450, 80], to: [530, 220], label: () => 'poll', labelAt: [492, 150], show: isQueue },
  { id: 'e-poll-outbox', from: [450, 400], to: [600, 280], label: () => 'poll', labelAt: [525, 340], show: isOutbox },
  { id: 'e-send', from: [730, 240], to: [830, 240], label: () => 'send', labelAt: [780, 240], show: (c) => !isToday(c) },
  { id: 'e-park', from: [630, 280], to: [630, 360], label: () => 'after 5 failures', labelAt: [650, 320], show: (c) => !isToday(c), dashed: true },
]

// One badge per problem (PROBLEMS in data.ts), by problem number. Its colour follows the status of
// the problem for the selected option. Put it beside the component where the problem lives.
export const BADGES: Record<number, [number, number]> = {
  1: [1040, 212],
  2: [196, 214],
  3: [95, 180],
  4: [196, 372],
}

// Width of a label box: about 6.4 px per character at font size 11, plus 12 px.
export const labelWidth = (s: string) => s.length * 6.4 + 12
