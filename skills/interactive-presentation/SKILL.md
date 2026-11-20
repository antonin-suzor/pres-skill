---
name: interactive-presentation
description: Build an interactive presentation page (local Vite + React + TS + Tailwind app) for a change big enough to need a team presentation. Use it when the user wants to present a design, a migration, a rollout in stages, or several options to compare, and has a design doc or a design discussion to start from. The page has a diagram that changes per option or stage, numbered problem cards with a status per option, a scenario × option matrix, pros and cons, open questions, and a single-file HTML export (for Confluence, Jira or mail). Triggers on "make a presentation of this design", "present these options to the team", "slides for this change", "compare these approaches visually".
---

# Interactive presentation

A data-driven page that walks a team through a change. One diagram, redrawn for each **option** (alternatives to compare) or each **stage** (steps that build on each other, some done, some planned), over the same list of problems and scenarios. The presenter flips between options with the keys 1–9 or the arrow keys while sharing the screen.

`template/` is a small working app with fictional content. You adapt it: **replace the content, then edit any code that is specific to this presentation**. Nothing in it is sacred. `examples/stages/` is the same app filled for the "stages" mode.

## When to use it, and when not

Use it for a change with several moving parts, or a decision with at least two options, where a diagram per option makes the discussion shorter than a document does. Don't use it for a small change (a PR description is enough) or when the audience needs a deck file (`.pptx`/Google Slides): this produces a web page.

## Workflow

1. **Gather the input.** The best source is the design doc plus the discussion that produced it (the conversation, a ticket, meeting notes). Read them fully. If there is no doc, write the key facts down first: what exists today, what each option changes, what the problems are.
2. **Decide the mode, the audience and the destination, and infer what you can.** Ask the user only what you can't infer, with a recommendation for each:
   - **Mode:** alternatives (compare them; none is pre-selected, the room decides) or stages (`Today → stage 1 (done) → stage 2 (planned)`). Stages are not alternatives: say so in the subtitle, and name the lists "What you get / Limits" rather than "Pros / Cons".
   - **Audience** (it sets the vocabulary and what to leave out) and **language**.
   - **Where the project goes.** A gitignored drafts folder (`.private/<topic>-pres/` or similar), so it is never committed by accident.
   - **What to keep vague:** undecided things stay "not decided yet", they are not invented.
3. **Copy the template** to the destination, and for stages mode overlay the example: `cp -r <skill>/template <dest> && cd <dest> && npm install`, then `cp <skill>/examples/stages/src/*.ts src/` if needed.
4. **Write `src/data.ts`** from the input (see "What to edit"). Content rules are in `references/content-rules.md`: read it before writing.
5. **Write `src/diagramSpec.ts`**: the boxes, arrows and badges, with one layout for all options (`references/diagram-layout.md`).
6. **Verify every claim** the page makes about code, config or systems against the real source, not against the design doc alone. A wrong "problem" presented to a team costs more than a missing one. Planned work is never shown as done.
7. **Check it, then look at it.**
   - `npm run verify` (typecheck + `check:layout`, which tests every option × variant for overlaps and text that doesn't fit its box). Fix every error.
   - `npm run screenshot` writes one PNG per option to `screens/` (needs a headless Chrome; see the script header). **If you can view images, look at the PNGs:** the checker finds geometry problems, not ugly ones. If you can't, rely on the checker and ask the user for a screenshot review.
   - If you can't take screenshots, say that the layout is unverified and ask the user for a screenshot review.
8. **Hand over.** Give the user the path and the commands (below). Don't commit the page unless asked.

## What to edit

| File | What it holds | Edit it for |
|---|---|---|
| `src/data.ts` | All the text: `CONFIG` (title, subtitle, headings), `STATUSES`, `OPTIONS`, `VARIANT`, `PROBLEMS`, `SCENARIOS`, `DETAILS`, `NOTES`, `OPEN_QUESTIONS` | Every presentation |
| `src/diagramSpec.ts` | `NODES`, `EDGES`, `BADGES`, `VIEWBOX`, `TAGS` | Every presentation |
| `src/App.tsx` | The page: option buttons, diagram + legend, how-it-works, problem cards, matrix, notes | Only for something specific: a section, a different layout |
| `src/Diagram.tsx` | The SVG renderer | Only to change how things are drawn |
| `scripts/` | `check-layout.mjs`, `screenshot.mjs` | Rarely |

- **Options and stages:** `OPTIONS` (the first one is selected at load, and is usually "Today"); `pill` puts a label next to a name (`✓ DONE`, `PLANNED`; or `✓ CHOSEN` once a decision has actually been made). Alternatives have no pill by default. `Opt` is a union of the ids; the compiler then forces every `Record<Opt, …>` to be complete.
- **Statuses:** `STATUSES` is a catalogue. `bad` red, `ok` green, `warn` amber ("fixed with a caveat"), `plan` indigo ("fixed by a planned step"), `fix` blue ("needs a fix whatever we choose"), `unfix` grey, `na`. Delete what you don't use, add what you need. The legend lists only the statuses in use.
- **Variant:** an optional switch inside the options (key Q), such as "for now" vs "target". Set `VARIANT = null` to drop it. The selected id is `c.v` in `diagramSpec.ts`, and picks `DETAILS[opt].variantNotes`.
- **Sections** with no data (`PROBLEMS`, `SCENARIOS`, `NOTES`, `OPEN_QUESTIONS`, `NODES`) are hidden. A matrix is recommended: it makes the comparison concrete.
- **URL hash:** `#opt=<id>&v=<variant>` opens a given option, so a link or a screenshot can target it.

When the template doesn't fit, change the code. See `references/extending.md` for how the pieces fit, and for typical extensions (a second diagram, a timeline, a cost table, a different status model).

## For the meeting

- `npm run dev` serves `http://localhost:5173`. **The user should start it themselves** for the meeting: a server started inside an agent session can be killed when the session or its time limit ends.
- `npm run build:single` makes `presentation.html`, one offline file for Confluence, Jira or mail. The page can't be attached by an agent in most setups: tell the user to do it.
- Keys: **1–9** or **← →** switch option, **Q** switches the variant. The option buttons are sticky at the top.

## When a decision changes afterwards

Pages go stale when the design moves. After each decision, grep the design doc **and** `src/` for every mention (names, counts, step names, tags) and edit both, then `npm run build:single`. Re-check that no status is more optimistic than the code.

## Delegating the build

If your tool has subagents, a mid-size model is enough to build the page. Write the brief like a spec: the goal, audience, language and destination; the hard rules (don't commit, don't touch other files, don't leave a server running, don't ask questions: the choices below are made); the options, the numbered problems with their status per option, and the scenarios; what to keep vague; the source files to verify against, and the facts you already verified; the closing command (`npm run verify && npm run build:single`); and a reply format that includes what was left out or is uncertain. Keep the later edits in the main conversation: that's where the user's corrections arrive.
