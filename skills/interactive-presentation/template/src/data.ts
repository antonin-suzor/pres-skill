// Everything the page shows as text lives here (plus the diagram, in diagramSpec.ts).
// App.tsx and Diagram.tsx are generic: edit them only for something specific to your presentation.
//
// This file is a worked example (fictional): "how do we send order e-mails reliably?", comparing
// the current design with two alternatives. No option is pre-selected: the room decides. Replace all the content.

// The options (or stages) shown as buttons. The FIRST one is the baseline: it is selected at load.
export type Opt = 'today' | 'queue' | 'outbox'

export type StatusDef = {
  label: string // text of the chip
  chip: string // Tailwind classes of the chip (write them in full: Tailwind scans this file)
  color: string // badge colour on the diagram
  symbol: string // symbol in the badge ('' shows the problem number)
  legend?: string // legend text; the legend only lists statuses that are used
}

// The status catalogue. Delete what you don't use, add what you need (the type follows the keys).
export const STATUSES = {
  bad: { label: '✘ broken', chip: 'bg-red-100 text-red-800 border-red-300', color: '#dc2626', symbol: '', legend: 'problem #n, not fixed' },
  ok: { label: '✔ fixed', chip: 'bg-green-100 text-green-800 border-green-300', color: '#16a34a', symbol: '✓', legend: 'fixed' },
  warn: { label: '! caveat', chip: 'bg-amber-100 text-amber-800 border-amber-300', color: '#d97706', symbol: '!', legend: 'fixed with a caveat' },
  fix: { label: '⚑ needs common fix', chip: 'bg-blue-100 text-blue-800 border-blue-300', color: '#2563eb', symbol: '⚑', legend: 'needs a fix in any option' },
  plan: { label: '◷ planned', chip: 'bg-indigo-100 text-indigo-800 border-indigo-300', color: '#4f46e5', symbol: '◷', legend: 'fixed by a planned step, not built yet' },
  unfix: { label: '✕ not fixed', chip: 'bg-slate-200 text-slate-800 border-slate-400', color: '#4b5563', symbol: '✕', legend: 'not fixed by these options' },
  na: { label: 'n/a', chip: 'bg-slate-100 text-slate-600 border-slate-300', color: '#94a3b8', symbol: '–' },
} as const satisfies Record<string, StatusDef>
export type Status = keyof typeof STATUSES

export const CONFIG = {
  title: 'Order e-mails: how do we send them reliably?',
  subtitle: 'How it works today, and the two options we could move to.',
  headings: {
    how: 'How it works',
    pros: 'Pros',
    cons: 'Cons',
    problems: "Today's problems, and what the selected option does about them",
    scenarios: 'Scenario matrix',
    notes: 'Needed whatever we choose',
    questions: 'Open questions',
  },
}

// pill (optional): a label next to the name, tone 'good' = green, 'info' = indigo. Used for stages
// (DONE, PLANNED), or for a decision that was already made; alternatives usually have none.
export const OPTIONS: { id: Opt; name: string; short: string; pill?: { text: string; tone: 'good' | 'info' } }[] = [
  { id: 'today', name: 'Today', short: 'The web app sends the e-mail inside the request' },
  { id: 'queue', name: 'A: message queue', short: 'The web app enqueues, a worker sends' },
  { id: 'outbox', name: 'B: outbox table', short: 'Written with the order, a relay sends' },
]

// An optional switch inside the options (key Q). Set VARIANT to null if you don't need it.
// The selected id is `c.v` in diagramSpec.ts and picks the `variantNotes` text below.
export const VARIANT: { label: string; hideFor: Opt[]; choices: { id: string; label: string | ((o: Opt) => string) }[] } | null = {
  label: 'Retry policy',
  hideFor: ['today'],
  choices: [
    { id: 'backoff', label: 'exponential backoff' },
    { id: 'fixed', label: 'fixed delay (for now)' },
  ],
}

// The problems. Their numbers match the badges on the diagram (BADGES in diagramSpec.ts).
// `who` is a free label (owner, component, audience). `note` explains the status for one option.
export const PROBLEMS: { n: number; who: string; title: string; detail: string; status: Record<Opt, Status>; note?: Partial<Record<Opt, string>> }[] = [
  {
    n: 1,
    who: 'reliability',
    title: 'An e-mail is lost when the provider is down',
    detail: 'The send happens once, inside the request. If the provider returns an error, the order is saved but nothing is sent or retried.',
    status: { today: 'bad', queue: 'ok', outbox: 'ok' },
    note: {
      queue: 'The worker retries, then moves the message to a dead-letter queue.',
      outbox: 'The row stays in the outbox until it is sent; failures are retried and, after 5 tries, parked and alerted.',
    },
  },
  {
    n: 2,
    who: 'latency',
    title: 'Checkout waits for the e-mail provider',
    detail: 'The request returns only after the provider answers, so a slow provider is a slow checkout.',
    status: { today: 'bad', queue: 'ok', outbox: 'ok' },
    note: { queue: 'The request only enqueues.', outbox: 'The request only inserts a row, in the same transaction as the order.' },
  },
  {
    n: 3,
    who: 'consistency',
    title: 'An order can exist without its e-mail, or the other way round',
    detail: 'The order and the send are two separate writes with no shared transaction.',
    status: { today: 'bad', queue: 'warn', outbox: 'ok' },
    note: {
      queue: 'If the process dies between the commit and the enqueue, the e-mail is lost.',
      outbox: 'Order and outbox row commit together: both exist or neither does.',
    },
  },
  {
    n: 4,
    who: 'operations',
    title: 'Nobody can see what was sent',
    detail: 'There is no record of sends or failures other than application logs.',
    status: { today: 'bad', queue: 'warn', outbox: 'ok' },
    note: { queue: 'Queue metrics show counts, not which order failed.', outbox: 'Every e-mail is a row with a status: one query answers "was it sent?".' },
  },
]

// One row per scenario; cells[opt] = [status, short text].
export const SCENARIOS: { title: string; cells: Record<Opt, [Status, string]> }[] = [
  {
    title: 'The e-mail provider is down for 10 minutes',
    cells: {
      today: ['bad', 'Every order in that window loses its e-mail.'],
      queue: ['ok', 'Messages wait and are retried.'],
      outbox: ['ok', 'Rows wait and are retried.'],
    },
  },
  {
    title: 'The app crashes right after the order commits',
    cells: {
      today: ['bad', 'No e-mail.'],
      queue: ['warn', 'No e-mail if the enqueue had not happened yet.'],
      outbox: ['ok', 'The outbox row is already committed: the relay sends it.'],
    },
  },
  {
    title: 'The worker sends, then crashes before acknowledging',
    cells: {
      today: ['na', 'No worker.'],
      queue: ['warn', 'The message is delivered again: a duplicate e-mail.'],
      outbox: ['warn', 'Same: the row is still pending. Use an idempotency key at the provider.'],
    },
  },
]

// Per option: how it works, pros, cons, and optionally one text per variant (shown when the variant applies).
export const DETAILS: Record<Opt, { how: string[]; pros: string[]; cons: string[]; variantNotes?: Record<string, { title: string; text: string }> }> = {
  today: {
    how: [
      'The order handler writes the order, then calls the e-mail provider API, then returns.',
      'A provider error is logged and the request still succeeds.',
    ],
    pros: ['Simple, no extra component'],
    cons: ['Problems #1 to #4', 'Checkout latency includes the provider latency'],
  },
  queue: {
    how: [
      'After the order commit, the handler enqueues a message and returns.',
      'A worker reads the queue, calls the provider, and deletes the message when the provider accepts it.',
      'A message that failed 5 times goes to a dead-letter queue, with an alarm.',
    ],
    pros: ['The request no longer depends on the provider', 'Managed queue: little code'],
    cons: ['The commit and the enqueue are still two writes (#3)', 'Duplicates are possible: the queue delivers at least once'],
    variantNotes: {
      backoff: { title: 'Exponential backoff', text: 'Retries after 1, 2, 4, 8 and 16 minutes, so a long outage does not hammer the provider.' },
      fixed: { title: 'Fixed delay', text: 'Retries every 5 minutes, 5 times. Simpler to reason about; we move to backoff if the provider rate-limits us.' },
    },
  },
  outbox: {
    how: [
      'The handler inserts the order and an outbox row in one transaction.',
      'A relay polls the outbox, sends each pending row and marks it sent.',
      'A row that failed 5 times is parked in a dead-letter store, with an alarm.',
    ],
    pros: ['Order and e-mail are atomic (#3)', 'The outbox table is the audit trail (#4)'],
    cons: ['One more table to maintain and purge', 'The relay polls: a few seconds of delay, and a leader election if it runs twice'],
    variantNotes: {
      backoff: { title: 'Exponential backoff', text: 'The row stores its next attempt time: 1, 2, 4, 8 and 16 minutes.' },
      fixed: { title: 'Fixed delay', text: 'The relay retries pending rows on every poll (every 5 minutes after the first failure).' },
    },
  },
}

// A box of notes for things that hold whatever the option, or caveats worth knowing (empty = hidden).
export const NOTES: { title: string; text: string }[] = [
  {
    title: 'An idempotency key at the provider',
    text: 'Both options can deliver twice. Sending the order id as the idempotency key lets the provider drop the duplicate.',
  },
]

export const OPEN_QUESTIONS: string[] = [
  'Which dead-letter alarm threshold do we want: any message, or more than N per hour?',
  'How long do we keep sent outbox rows?',
]
