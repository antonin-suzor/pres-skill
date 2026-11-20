# Instructions for coding agents

This repo holds one skill, `interactive-presentation`: it builds an interactive presentation page
(a diagram per option or stage, problem cards, a scenario matrix, a single-file HTML export) from a
design doc or a design discussion.

## To make a presentation

Read [`skills/interactive-presentation/SKILL.md`](skills/interactive-presentation/SKILL.md) and follow it. It is
plain Markdown and does not depend on a particular agent or model. In short:

1. Copy `skills/interactive-presentation/template/` to a gitignored folder, and run `npm install`.
2. Replace the content in `src/data.ts` and `src/diagramSpec.ts`. Edit `App.tsx` / `Diagram.tsx` only for
   something specific to your presentation.
3. Read `skills/interactive-presentation/references/` before writing: content rules, diagram layout, extending.
4. `npm run verify`, then `npm run screenshot` (if you can view images), then hand the user the commands.

## To work on this repo

- The template is the product. Keep it generic (no company names, no real tickets) and keep it working.
- After any change to `template/` or `examples/`, copy each (the template, and the template with the files
  of `examples/stages/src/` laid over its `src/`) to a scratch folder outside this repo, and run
  `npm install && npm run build:single` there. Both must pass `npm run verify` with 0 errors.
- Don't commit `node_modules`, `dist`, `dist-single`, `screens` or `presentation.html`.
