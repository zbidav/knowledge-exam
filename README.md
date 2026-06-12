# תרגול מבחן הידע — Knowledge Exam Practice Platform

A single-user, static practice platform for the Israeli medical knowledge exam
(מבחן הידע, [TAU 4-year program](https://med.tau.ac.il/test-4years)). It reads
**XML question files** and renders them as exam-style practice in Hebrew (RTL):
a stem, four options, and — after you answer — the correct answer plus an
explanation of *why each wrong option is wrong*, a Hebrew⇄English term bridge,
and the question's source.

No backend, no accounts, no database. It builds to a static bundle and is meant
to live on **GitHub Pages**. Your progress is kept in the browser (`localStorage`).

## The exam

Four subjects — **ביוכימיה / ביולוגיה מולקולרית / ביולוגיה של התא / פיזיולוגיה**
— 30 questions each, 120 total, single correct answer, 180 minutes, no penalty
for wrong answers.

## Run it locally

This project uses a **conda env** for Node (per the lab's shared-server
convention — no system Node):

```bash
conda activate knowledge_exam   # Node 20+ lives here
npm install                     # first time only
npm run dev                     # http://localhost:5173
```

Build the static site:

```bash
npm run build      # output in dist/
npm run preview    # serve the built site locally
```

## Adding questions

Content is **fully separate from the UI**. To add a topic, drop a new file at:

```
content/<subject>/<topic>.xml
```

where `<subject>` is one of `biochemistry`, `molecular-biology`,
`cell-biology`, `physiology`. The app auto-discovers every `.xml` under
`content/` — no code change needed. Copy
[`content/biochemistry/amino-acids.xml`](content/biochemistry/amino-acids.xml)
as a template; the schema is documented in the comment at the top of that file
and in [`src/lib/parseXml.js`](src/lib/parseXml.js).

### XML schema (short version)

```xml
<questionset subject="biochemistry" topic="..." textbook="Lehninger" chapter="3">
  <question id="aa-001" difficulty="basic|intermediate|advanced" type="single-choice">
    <stem>Hebrew question, English term in (parens)</stem>
    <terms><term he="..." en="..."/></terms>
    <options>
      <option id="a" correct="false">...</option>
      <option id="b" correct="true">...</option>   <!-- exactly one correct -->
      <option id="c" correct="false">...</option>
      <option id="d" correct="false">...</option>
    </options>
    <explanation>
      <correct>why the right answer is right</correct>
      <distractor option="a">why a is wrong</distractor>  <!-- one per wrong option -->
    </explanation>
    <source type="generated|recall" basis="textbook chapter, or the moed for recalls"/>
    <tags><tag>...</tag></tags>
  </question>
</questionset>
```

`type="generated"` = written from the textbook; `type="recall"` = reconstructed
from a past exam. The UI shows the tag but practices both the same.

## Deploy to GitHub Pages

A workflow at `.github/workflows/deploy.yml` builds and deploys on every push to
`main`. Enable it once in the repo: **Settings → Pages → Source: GitHub Actions**.
The Vite `base` is relative (`./`), so the site works under any repo name with
no extra config.

## Modes (built)

- **Random Quiz** (`מבחן אקראי`) — pick a pool (all subjects, like the real
  mixed exam, or one subject) and a count (5/10/20/30/…); the app samples that
  many questions at random and ends with a **score screen** (percent + per-question
  review). Nothing is persisted — each quiz is a fresh draw, no server needed.
- **Practice by subject/topic** — browse a subject, drill a topic or a whole
  subject, with shuffle and a running session score.

## Roadmap (deferred — not built yet)

Spaced repetition + confidence ratings, tag/difficulty filters, a timed mode
(~1.5 min/question), and memory games (match / order). The architecture leaves
room for each as its own screen.

## Project layout

```
content/            XML question files, grouped by subject  (the "data")
src/
  data/subjects.js  the 4 subjects (keys must match content/ folders)
  lib/parseXml.js   DOMParser-based XML -> JS objects
  lib/loadDecks.js  auto-discovers content/**/*.xml
  lib/storage.js    localStorage progress
  components/       Practice runner + QuestionView
  App.jsx           home -> topics -> practice navigation
Prev_exams/         source past-exam PDFs (for authoring recall questions)
```
