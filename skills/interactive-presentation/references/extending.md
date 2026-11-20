# Extending the template

The template is meant to be edited. Keep the parts that are common to presentations (data in `data.ts`, one layout, status chips, the checker) and change what is specific.

## How the pieces fit

```
data.ts ──────────────┬──> App.tsx        (page, sections, legend, keys)
 Opt, Status,         └──> Diagram.tsx    (SVG renderer)
 STATUSES, OPTIONS,           ▲
 PROBLEMS, ...                │
diagramSpec.ts ───────────────┘            NODES, EDGES, BADGES, TAGS, VIEWBOX
```

- `Opt` and `Status` are TypeScript types derived from the content (`Opt` is a union you write, `Status` is `keyof typeof STATUSES`). Add an option id, and the compiler lists every place that must now have an entry for it.
- `diagramSpec.ts` imports only the `Opt` type from `data.ts`; `Diagram.tsx` and `App.tsx` import both. The scripts load both through Vite (`ssrLoadModule`), so they work with any code the spec uses, without a build.
- Every function in the spec receives `c = { o: option, v: variant }` and returns text, a tag or a visibility, so a box can change per option without moving.

## Typical changes

- **Add a status** (for example "decided", "blocked"): add a key to `STATUSES` with its chip classes, colour, symbol and legend. Write the Tailwind classes in full (`bg-indigo-100`, not a computed string) so Tailwind sees them.
- **Add a section** (a timeline, a cost table, an FAQ): add an export to `data.ts`, a `<section>` in `App.tsx` with the same card classes (`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm`), and hide it when the data is empty like the others do.
- **Add a second diagram** (a sequence, a data model): make a `Diagram2.tsx` and a spec, or draw it with plain JSX in `App.tsx`. Copy `scripts/check-layout.mjs` and point it at the new spec if you want it checked.
- **Remove the diagram:** empty `NODES`; the section is hidden, and the rest of the page works as a comparison table.
- **Change the look:** it is Tailwind. The accent is `emerald`; search and replace it, and the `SAME`, `TAGS` colours in the diagram files.
- **A non-"today" baseline:** the first entry of `OPTIONS` is selected at load. If your first option isn't a baseline, nothing else changes.
- **More than 9 options:** the keys stop at 9; the arrow keys still work. More than 5 or 6 options is a sign to split the presentation.
- **Variants that differ per option:** `VARIANT.choices[].label` can be a function of the option, and `hideFor` hides the switch for some options.

## Keeping the template healthy

- Keep `npm run verify` green: it is the gate for `build:single`.
- If you add something the checker should know about (a new kind of element), extend `scripts/check-layout.mjs` with it, so the next person gets the check too.
- Generic improvements (a better checker, a new status, a layout helper) belong in the template. Content belongs in your presentation's copy.
