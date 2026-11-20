# Diagram layout

You usually can't see the result while you work, so **plan coordinates, then run `npm run check:layout`, then look at `npm run screenshot`**.

## One layout for all options

A box keeps its position from one option (or stage) to the next. Only its text, its tag and its visibility change. That is what lets the room compare options by flipping between them: parts that are the same stay in the same place.

- Put a box that exists in one option only in a spot that is empty in the others.
- If an option needs room, move the boxes **in every option**, not only in that one.
- A consequence: some badges and gaps sit in empty space in the first option (the problem exists, the fix will land there). That is intended.

## Colour means "changed here"

Boxes are grey unless the selected option adds them (`NEW`, green) or changes them (`CHANGED`, blue). Don't colour boxes by kind of component: people read colour as change, and a rainbow of unchanged boxes is misleading. Arrows are green (`highlight`) when they are the new or changed flow. A dashed box or arrow means "exists, but does nothing today" or "optional".

## Coordinates

- `VIEWBOX` is `[width, height]` (default 1160 × 480). Pick a grid: a few columns and rows of equal-height boxes (for example rows at y = 40, 200, 360 with h = 80), and arrows in the gaps. State the grid in a comment at the top of `NODES`.
- Edges are straight lines: give `from` and `to` **on the border** of the boxes they join. Avoid a line that passes through a box that isn't an endpoint; route around with a different anchor point or move a box.
- **Label width:** about 6.4 px per character (font size 11, monospace) plus 12 px. The label box is `centre ± width/2` by `y − 11 … y + 7`. `labelAt` is its centre; keep it on the arrow.
- **Text in boxes:** the title is about 8.2 px per character (14 px, bold), the subtitle about 6 px (11 px). Keep both under `w − 12`. Shorten text rather than widening boxes.
- **Badges** (`BADGES`, by problem number) sit beside the component where the problem lives, never on a box or a label. A non-`bad` badge also shows `#n` to its right (about 40 px wide).
- Keep labels short ("write", "INSERT", "poll"). One verb or one noun.

## The checker

`npm run check:layout` loads `diagramSpec.ts` and tests **every option × variant**, because the visible elements change with them. It reports:

- **Errors (exit code 1):** boxes overlapping, a label over a box or another label, an arrow crossing a box it does not connect, anything outside the `viewBox`, a title or subtitle wider than its box, a badge over a label or another badge.
- **Warnings:** an arrow end that touches no box, a label sitting on another arrow, a badge on a box.

Zero errors does not mean pretty. Look at the screenshots.

## Screenshots

`npm run screenshot` (or `node scripts/screenshot.mjs [page] [outDir] [--height=2600]`) writes one PNG per option and variant, using the `#opt=…&v=…` hash. It needs a headless Chrome: `CHROME_BIN`, or `chrome-headless-shell` / `chromium` / `google-chrome` on the `PATH`, or a Playwright download (`npx playwright install chromium`). On a bare Linux box the browser may be missing system libraries: then say the layout is unverified and ask for a screenshot review.
