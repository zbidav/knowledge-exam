# Exam-style question patterns (מבחן הידע)

A working rulebook for authoring questions that *feel like the real exam*, derived
from reading ~50 real questions across the 2023A מועד א' recall and the April-2014
recall. This is a living document — refine the rules as we see more exams.

Every generated question should be a deliberate instance of one **archetype** below,
at a chosen **difficulty tier**, with **distractors built by a known trap pattern**.
Tag each question so the quiz engine can later balance the mix.

---

## 1. The archetypes (question shapes the exam actually uses)

| # | Archetype | Hebrew stem cue | Real example (2023A) |
|---|-----------|-----------------|----------------------|
| A | **Negative / exception** — find the one that is *false* or *doesn't belong* | "מה **לא** נכון", "איזו מולקולה **לא** ניתן…", "מה **לא** יקרה", "איזה בסיס **אינו** עובר…" | "באיזו מולקולה לא ניתן להשתמש כבופר?" |
| B | **Connect / integrate two systems** | "מה **מקשר** בין X ל-Y", "מה משותף ל…" | "איזו מולקולה מקשרת בין מעגל קרבס למעגל האוריאה?" |
| C | **Direct recall / identify** (surface) | "מהו…", "איזה חלבון…", "ממה מורכב…" | "מהו הגורם המדבק במחלת הפרה המשוגעת?" |
| D | **Mechanism / why** (deep) | "מדוע…", "כיצד…", "מה הסיבה ש…" | "מדוע שייר פרולין נוטה לשבש סליל α?" |
| E | **Perturbation / loss-of-function** | "מה יקרה אם… יאבד/ימוטט", "מה ההשפעה של אובדן…" | "מה יקרה אם תאבד פעילות ה-ATPase של GET3?" |
| F | **Quantitative / calculation** | numbers in the stem; rate, ratio, probability, pH | "גן בן 3000 בסיסים, 50 בסיסים/שנייה — כמה mRNA בשעה?" |
| G | **Method / experiment interpretation** | "מה מאפשר…", "איזו מודיפיקציה חיונית ל…", "כיצד עובדת שיטת…" | "איזו מודיפיקציה של נוקלאוטיד חיונית לריצוף סנגר?" |
| H | **Graph / figure reading** | "איזה גרף מתאר…", "לפי העקומה…" | "מי מהגרפים מתאר מעכב תחרותי?" (M-M curve) |
| I | **Structure–function / stereochemistry** | side-chain, chirality, isomer, charge | "איזו חומצת אמינו היחידה שאינה כירלית?" |
| J | **Regulation / signaling logic** | cascade, feedback, "בנוכחות/בהיעדר…" | "מה נכון לגבי SREBP ו-SCAP בבקרת כולסטרול?" |

**Observed frequency bias:** the exam *loves* archetype **A (negatives)** and **D/E
(mechanism & perturbation)**. A realistic deck over-weights these vs. plain recall.

---

## 2. Difficulty tiers ("easy-surface" vs "hard-deep")

Map to the XML `difficulty` attribute:

- **`basic` — surface.** One fact, one step. Identify a molecule, state a definition.
  Archetypes C, I. *"מהו הגורם המדבק במחלת הפרה המשוגעת?"*
- **`intermediate` — applied.** One inference or a simple relation; apply a concept.
  Archetypes B, G, H. *"מה נכון בנוגע לחומצות אמינו גלוקוגניות?"*
- **`advanced` — deep.** Multi-step mechanism, perturbation reasoning, integrate two
  systems, quantitative, or discriminate a *subtle* distractor. Archetypes D, E, F, J.
  *"מדוע פרולין משבש סליל α?"* / *"מה יקרה אם תאבד פעילות ה-ATPase של GET3?"*

**Suggested deck mix** (tune to taste): ~35% basic, ~35% intermediate, ~30% advanced.
The real exam is *hard*, so don't under-weight advanced.

---

## 3. Distractor trap patterns (how the exam writes the wrong answers)

Good distractors are why a question is hard. The exam reuses these:

1. **Same-category plausibles** — other amino acids, other ETC complexes, other bases.
   (The right answer hides among siblings.)
2. **Right phenomenon, wrong cause** — the distractor states a true fact that doesn't
   answer *this* question. (Classic in archetype D.)
3. **Reversed direction / location** — "SCAP binds SREBP in the Golgi" (it's the ER);
   "malate links the cycles" (it's aspartate). Swap a correct relation's direction.
4. **Quantitative trap** — ">2% HbA2" vs "<2%"; "exactly 60" vs ">60". One threshold off.
5. **Adjacent-pathway confusion** — citrulline (inside urea cycle) offered when the
   answer is the *link* molecule (aspartate).
6. **Over-general / absolute** — "always", "only", "completely" phrasing that's subtly false.

**Rule:** every distractor gets a *specific* one-line reason it's wrong (the XML
`<distractor>` element). No generic "this is incorrect" — name the actual confusion.

---

## 4. Authoring checklist (per question)

- [ ] Pick an **archetype** (1–10 above) and a **difficulty tier**.
- [ ] Hebrew stem, English term in (parens); fill the `<terms>` he/en bridge.
- [ ] Exactly one `correct="true"`; 4 options (a–d).
- [ ] For negatives (archetype A), make the stem's "לא/אינו" **bold-clear** so it's not missed.
- [ ] Each wrong option → a **specific** `<distractor>` reason (use a trap pattern above).
- [ ] `<correct>` explains the mechanism, not just restates the answer.
- [ ] `source`: `recall` (from a past exam, cite moed) or `generated` (cite the summary/chapter).
- [ ] Tag the archetype + topic, e.g. `<tag>negative</tag>`, `<tag>mechanism</tag>`.

### Tag conventions for balancing
Add an archetype tag so the quiz can later build a realistic mix:
`negative`, `connect`, `recall`, `mechanism`, `perturbation`, `calculation`,
`method`, `graph`, `structure`, `regulation`.

---

## 5. Topic coverage note

The exam **mixes subjects freely** (confirmed by David). Author by topic (one XML deck
per summary section), but expect the *quiz* to draw across all decks — which the random
Quiz mode already does. Provenance (which summary/lecture a question came from) lives in
`source basis="..."` so you can trace and re-study.
