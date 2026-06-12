# Claude Code prompt — מבחן הידע practice platform

*Paste everything below into Claude Code as the opening message.*

---

## What I'm building

A **single-user, personal practice platform** for the Israeli medical knowledge exam (מבחן הידע). It reads **XML question files** (one per topic) and renders them as exam-style practice: a question, four options, and — after I answer — the correct answer plus an explanation of *why each wrong option is wrong*.

This is a study aid for me alone. Hard constraints:

- **No backend, no accounts, no database, no multi-user features** (no shared answer-statistics, no comments/discussion). Those are exactly the parts I *don't* want.
- **Fully independent and self-hostable** — it must run as a **static site on a public GitHub Pages repo**, and the whole thing (code + content) lives in Git.
- **Content is separate from UI.** The questions are portable XML files; the app only renders them. I must be able to hand-edit a question file or swap the front-end later without the content breaking.

## How to work with me

- I code in **R** (primary) and **Unix/shell** (proficient), with **basic Python** and **basic React**. I'm not a JS expert — when you make a non-obvious JS/React choice, **comment the code and explain the change** in plain terms.
- I'm a perfectionist and this kind of build is a known procrastination trap for me. **Build the smallest working thing first** (the MVP below) and stop. Do **not** add features beyond the MVP unless I ask. My study time is the priority; this tool serves it, not the other way around.
- The content is **Hebrew (RTL)** with English terms inline. The UI must render RTL correctly.

## The exam (the facts that shape the app)

- Four subjects: **Biochemistry, Molecular Biology, Cell Biology, Physiology**. Each is its own block.
- **120 multiple-choice questions**, 30 per subject, **single correct answer**.
- **180 minutes** → ~1.5 min/question (relevant later for an optional timed mode).
- **No penalty for wrong answers** → the practice UI should encourage always answering.
- Language is **Hebrew**; English terms appear because the source textbooks are English (Lehninger, Alberts, Berne & Levy). So each question carries a small **Hebrew⇄English term bridge** that the UI should display.

## Content model — the XML schema (authoritative — build the renderer to match this exactly)

One topic per file, stored at `content/<subject>/<topic>.xml`. A complete sample file already exists (`biochemistry/amino-acids.xml`, ~4 questions) — **use it as the seed content and as your test fixture.** Schema:

```xml
<questionset subject="biochemistry" topic="amino-acids" textbook="Lehninger" chapter="3">
  <question id="aa-001" difficulty="basic|intermediate|advanced" type="single-choice">
    <stem>Hebrew question text, with English term in (parens)</stem>
    <terms>
      <term he="..." en="..."/>          <!-- the Hebrew<->English bridge -->
    </terms>
    <options>
      <option id="a" correct="true|false">option text</option>
      <!-- ids a..d, exactly one correct="true" -->
    </options>
    <explanation>
      <correct>why the right answer is right</correct>
      <distractor option="b">why option b is wrong</distractor>
      <!-- one <distractor> per wrong option -->
    </explanation>
    <source type="generated|recall" basis="textbook chapter, OR the moed label for recalls"/>
    <tags><tag>...</tag></tags>
  </question>
</questionset>
```

`type="generated"` = written from the textbook. `type="recall"` = a real past-exam reconstruction. The UI may surface this tag but should treat both the same when practicing.

## Recommended stack (use unless you have a clear reason not to, and tell me if so)

- **React + Vite**, built to a static bundle (reuses what I already know; I have an existing React flashcard app).
- Parse the XML **at runtime in the browser with `DOMParser`** — no build-time conversion pipeline, to keep it simple and GitHub-Pages-friendly. (If you think a build-time XML→JSON step is clearly better, explain the tradeoff and let me decide.)
- **`localStorage`** for my own progress (this is my own hosted site, so browser storage is fine here).
- Deployable to **GitHub Pages** with no server.

## MVP — build ONLY this first

1. Repo scaffold + README, deployable to GitHub Pages.
2. Load every `.xml` deck under `content/`.
3. **Browse:** pick a subject → pick a topic.
4. **Practice mode:** show the stem + four options (Hebrew, RTL). I pick one → reveal correct/incorrect, the `<correct>` explanation, and the relevant `<distractor>` explanations, plus the term bridge and the source tag.
5. Basic session controls: shuffle, next/previous, and a running score for the session.

Then stop and show me the working MVP.

## Deferred — do NOT build yet (just leave room in the architecture)

Spaced repetition + confidence ratings (I'll port the logic from my Japanese flashcard app), tag/difficulty filters, a "practice more on this topic" button, a timed mode at ~1.5 min/question, full 30-question subject blocks for diagnostics, and a small amino-acids memory game.

## First task

Scaffold the repo with the recommended stack, create the `content/biochemistry/amino-acids.xml` location for my sample file, and build the MVP above so it runs locally and is ready to deploy to GitHub Pages. Comment anything non-obvious. Start now.
