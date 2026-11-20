# Content rules

What to write in `data.ts`. These come from real presentations, where each rule was a correction made after the first version.

## Facts

- **Keep the wording factual.** Say what the system does, not what it should do.
- **Verify each claim against the source** (code, config, the live system), not against the design doc. Docs lag. If you can't verify something, either leave it out or write "not verified".
- **Never present planned work as done.** Use a distinct "planned" status (`plan`) for what is designed but not built, and a `PLANNED` pill on the stage. A merged-but-not-released change is "implemented", not "live".
- **A fixed status needs a note saying how.** "Fixed" with no mechanism invites the question "how?" in the meeting. Write the note.
- **Leave undecided things undecided.** They go in `OPEN_QUESTIONS` ("Not decided yet, or to check"), not in the diagram as if settled.

## Problems

- **A problem title says exactly what is true.** If it is only partly true ("nobody is told about deployments", but nothing is posted when a deploy changes nothing, by design), reword it until it is exactly true.
- **Number the problems and keep the numbers stable.** They are the badges on the diagram, and people will say "problem 3" out loud.
- **Group by what each option does.** Each stage or option should fix a coherent set of problems. A column full of "same as the previous stage" notes means the split is wrong: either merge the stages, or move the fixes.
- **One scenario row per failure or event** a person in the room will ask about: "what if X crashes", "what if we need to roll back". Write what happens in each option, in a short sentence.

## Options and stages

- **Name things for what they are.** Alternatives: "Pros / Cons". Stages: "What you get / Limits", because stages are not alternatives, and say so in the subtitle.
- **`NOTES`** (the "Needed whatever we choose" / "Worth knowing" box) holds real caveats and accepted risks, and things that hold for all options. Rejected or unresolved ideas don't belong in it.
- **Don't pre-select an option.** In alternatives mode the page presents and the room decides: no `CHOSEN` pill, no "recommended" wording, every option keeps its cons. If a decision is made later, add the pill then.

## Style

- Short sentences, the audience's vocabulary. Explain an acronym once.
- Put long explanations in `DETAILS` and the notes, not on the diagram: the diagram labels stay under ~25 characters.
- English or the audience's language, but the same one everywhere.
- No names of people, tickets or customers on a page that will be shared outside the team, unless the audience needs them.
