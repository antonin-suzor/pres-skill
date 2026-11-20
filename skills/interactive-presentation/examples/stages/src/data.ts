// STAGES example (fictional): "feature flags", in three stages that build on each other. The options
// are not alternatives, so there is no winner: each stage has a pill saying whether it is done or planned.
// Copy this file and diagramSpec.ts over the template's src/ folder (App.tsx is unchanged).

export type Opt = 'today' | 'service' | 'admin'

export type StatusDef = { label: string; chip: string; color: string; symbol: string; legend?: string }

export const STATUSES = {
  bad: { label: '✘ broken', chip: 'bg-red-100 text-red-800 border-red-300', color: '#dc2626', symbol: '', legend: 'problem #n, not fixed' },
  ok: { label: '✔ fixed', chip: 'bg-green-100 text-green-800 border-green-300', color: '#16a34a', symbol: '✓', legend: 'fixed' },
  plan: { label: '◷ planned', chip: 'bg-indigo-100 text-indigo-800 border-indigo-300', color: '#4f46e5', symbol: '◷', legend: 'fixed by stage 2 (planned, not built)' },
  warn: { label: '! caveat', chip: 'bg-amber-100 text-amber-800 border-amber-300', color: '#d97706', symbol: '!', legend: 'works, with a caveat' },
  na: { label: 'n/a', chip: 'bg-slate-100 text-slate-600 border-slate-300', color: '#94a3b8', symbol: '–' },
} as const satisfies Record<string, StatusDef>
export type Status = keyof typeof STATUSES

export const CONFIG = {
  title: 'Feature flags',
  subtitle: 'Where we are today, what stage 1 (done) added, and what stage 2 (planned) adds. The stages build on each other; they are not alternatives.',
  headings: {
    how: 'How it works',
    pros: 'What you get',
    cons: 'Limits',
    problems: "Today's problems, and what the selected stage does about them",
    scenarios: 'Scenario matrix',
    notes: 'Worth knowing',
    questions: 'Not decided yet, or to check',
  },
}

export const OPTIONS: { id: Opt; name: string; short: string; pill?: { text: string; tone: 'good' | 'info' } }[] = [
  { id: 'today', name: 'Today', short: 'Flags are a file in the repo' },
  { id: 'service', name: 'Stage 1: flag service', short: 'Flags live in a service, with per-customer rules', pill: { text: '✓ DONE', tone: 'good' } },
  { id: 'admin', name: 'Stage 2: admin UI + audit', short: 'Non-developers change flags; every change is logged', pill: { text: 'PLANNED', tone: 'info' } },
]

export const VARIANT: { label: string; hideFor: Opt[]; choices: { id: string; label: string | ((o: Opt) => string) }[] } | null = null

export const PROBLEMS: { n: number; who: string; title: string; detail: string; status: Record<Opt, Status>; note?: Partial<Record<Opt, string>> }[] = [
  {
    n: 1,
    who: 'release',
    title: 'Changing a flag needs a deploy',
    detail: 'Flags are read from flags.json at startup, so turning one off during an incident means a PR, a build and a rollout.',
    status: { today: 'bad', service: 'ok', admin: 'ok' },
    note: { service: 'The service answers with the current value; apps refresh it every 30 seconds.', admin: 'Same as stage 1.' },
  },
  {
    n: 2,
    who: 'rollout',
    title: 'No rollout to a part of the customers',
    detail: 'A flag is on or off for everyone.',
    status: { today: 'bad', service: 'ok', admin: 'ok' },
    note: { service: 'A rule can target a percentage of customers or a list of customer ids.', admin: 'Same as stage 1.' },
  },
  {
    n: 3,
    who: 'operations',
    title: 'Nobody knows who changed a flag, or when',
    detail: 'The only trace is the git history of flags.json, which stops at the deploy.',
    status: { today: 'bad', service: 'bad', admin: 'plan' },
    note: { admin: 'Every write through the admin UI or the API goes to an audit log (who, what, when, previous value).' },
  },
  {
    n: 4,
    who: 'hygiene',
    title: 'Old flags are never removed',
    detail: 'Nothing says which flags are still read by the code.',
    status: { today: 'bad', service: 'bad', admin: 'plan' },
    note: { admin: 'The service records the last time each flag was evaluated; the UI lists flags unused for 90 days.' },
  },
]

export const SCENARIOS: { title: string; cells: Record<Opt, [Status, string]> }[] = [
  {
    title: 'Turn a flag off during an incident',
    cells: {
      today: ['bad', 'PR, review, build, deploy: tens of minutes.'],
      service: ['ok', 'One API call, effective within 30 seconds.'],
      admin: ['plan', 'A toggle in the UI, for anyone with the role.'],
    },
  },
  {
    title: 'Enable a feature for 5% of customers',
    cells: {
      today: ['bad', 'Not possible.'],
      service: ['ok', 'A percentage rule, set through the API.'],
      admin: ['plan', 'The same rule, set from a form.'],
    },
  },
  {
    title: 'Find out who enabled a flag last week',
    cells: {
      today: ['warn', 'Read the git history, if the change was made by PR.'],
      service: ['bad', 'Not recorded.'],
      admin: ['plan', 'One row in the audit log.'],
    },
  },
]

export const DETAILS: Record<Opt, { how: string[]; pros: string[]; cons: string[]; variantNotes?: Record<string, { title: string; text: string }> }> = {
  today: {
    how: ['flags.json is in the repo and is read when the app starts.', 'Changing a flag is a normal PR.'],
    pros: ['Simple, versioned with the code'],
    cons: ['Problems #1 to #4'],
  },
  service: {
    how: [
      'A small service stores the flags and their rules.',
      'The client app asks it for the value of a flag, and caches the answer for 30 seconds.',
      'flags.json stays in the repo as the fallback if the service is unreachable.',
    ],
    pros: ['A flag changes without a deploy (#1)', 'Percentage and customer-list rules (#2)'],
    cons: ['Changes are made through the API: developers only', 'Still no record of changes (#3, #4)'],
  },
  admin: {
    how: [
      'An admin UI is added on top of the service API, with a role for who may change flags.',
      'Every write is stored in an audit log.',
      'The service tracks the last evaluation of each flag, so the UI can list stale flags.',
    ],
    pros: ['Product and support can use flags without a developer', 'A complete history of changes (#3)', 'A list of flags to remove (#4)'],
    cons: ['Not built yet', 'A new surface to secure: the role model is to be decided'],
  },
}

export const NOTES: { title: string; text: string }[] = [
  {
    title: 'Stage 1 changes what runs; stage 2 does not',
    text: 'Stage 2 adds an interface and a log on top of the service. The flag evaluation path of the client app is the same.',
  },
  {
    title: 'The fallback file can drift',
    text: 'If someone changes a flag in the service and not in flags.json, an outage of the service falls back to an older value. Accepted for now.',
  },
]

export const OPEN_QUESTIONS: string[] = ['Which roles may change a flag in production: everyone with the role, or two-person approval?', 'Where does the audit log live long term?']
