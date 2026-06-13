import { useState } from 'react'
import { AMINO_ACIDS, peptideResidueCharge } from '../data/aminoAcids.js'

// Amino-acid drills, two models:
//   1) "code"   — identify an amino acid shown in one form by clicking the
//                 matching BUTTON in another form (you choose shown/answer forms).
//   2) "charge" — a random 3–5 residue peptide at a random pH; assign each
//                 residue's net charge. Teaches that only the first residue has
//                 the free α-amino (+), only the last has the free α-carboxyl (−),
//                 and middle residues are side-chain-only.

const FORMS = [
  { key: 'one', he: 'אות בודדת' },
  { key: 'three', he: '3 אותיות' },
  { key: 'full', he: 'שם מלא' },
]
const label = (aa, form) =>
  form === 'one' ? aa.one : form === 'three' ? aa.three : `${aa.he} (${aa.en})`

const rnd = (n) => Math.floor(Math.random() * n)
const sample = (arr) => arr[rnd(arr.length)]

export default function AminoAcidGame({ onExit }) {
  const [mode, setMode] = useState('code')
  return (
    <section className="game aa-drill">
      <div className="game-head">
        <div>
          <h2>תרגול חומצות אמינו</h2>
          <div className="progress-line">בחר/י מודל תרגול</div>
        </div>
        <button className="link" onClick={onExit}>← למשחקים</button>
      </div>
      <div className="chip-row aa-modes">
        <button className={`chip ${mode === 'code' ? 'chip-on' : ''}`} onClick={() => setMode('code')}>זיהוי קוד</button>
        <button className={`chip ${mode === 'charge' ? 'chip-on' : ''}`} onClick={() => setMode('charge')}>מטעני פפטיד</button>
      </div>
      {mode === 'code' ? <CodeModel /> : <ChargeModel />}
    </section>
  )
}

// ---- Model 1: code identification (buttons) --------------------------------
function makeRound(shown, answer) {
  const target = sample(AMINO_ACIDS)
  const distractors = []
  while (distractors.length < 5) {
    const a = sample(AMINO_ACIDS)
    if (a.one !== target.one && !distractors.some((d) => d.one === a.one)) distractors.push(a)
  }
  const opts = [target, ...distractors].sort(() => Math.random() - 0.5)
  return { target, opts }
}

function CodeModel() {
  const [shown, setShown] = useState('one')
  const [answer, setAnswer] = useState('three')
  const [round, setRound] = useState(() => makeRound('one', 'three'))
  const [picked, setPicked] = useState(null)
  const [score, setScore] = useState({ right: 0, total: 0 })

  const answered = picked != null

  function chooseShown(f) {
    setShown(f)
    if (f === answer) setAnswer(FORMS.find((x) => x.key !== f).key)
    next(f, f === answer ? FORMS.find((x) => x.key !== f).key : answer)
  }
  function chooseAnswer(f) {
    setAnswer(f)
    if (f === shown) setShown(FORMS.find((x) => x.key !== f).key)
    next(f === shown ? FORMS.find((x) => x.key !== f).key : shown, f)
  }
  function next() {
    setRound(makeRound())
    setPicked(null)
  }
  function pick(aa) {
    if (answered) return
    const right = aa.one === round.target.one
    setPicked(aa.one)
    setScore((s) => ({ right: s.right + (right ? 1 : 0), total: s.total + 1 }))
  }

  return (
    <div className="code-model">
      <div className="aa-form-row">
        <span>מוצג:</span>
        {FORMS.map((f) => (
          <button key={f.key} className={`chip ${shown === f.key ? 'chip-on' : ''}`} onClick={() => chooseShown(f.key)}>{f.he}</button>
        ))}
      </div>
      <div className="aa-form-row">
        <span>תשובה:</span>
        {FORMS.map((f) => (
          <button key={f.key} className={`chip ${answer === f.key ? 'chip-on' : ''}`}
            disabled={f.key === shown} onClick={() => chooseAnswer(f.key)}>{f.he}</button>
        ))}
      </div>

      <div className="aa-prompt">{label(round.target, shown)}</div>

      <div className="aa-answer-grid">
        {round.opts.map((aa) => {
          let cls = 'aa-answer-btn'
          if (answered) {
            if (aa.one === round.target.one) cls += ' is-correct'
            else if (aa.one === picked) cls += ' is-wrong'
            else cls += ' is-muted'
          }
          return (
            <button key={aa.one} className={cls} disabled={answered} onClick={() => pick(aa)}>
              {label(aa, answer)}
            </button>
          )
        })}
      </div>

      <div className="aa-drill-foot">
        <span className="progress-line">ניקוד: {score.right}/{score.total}</span>
        {answered && <button className="primary" onClick={() => next()}>הבא ←</button>}
      </div>
    </div>
  )
}

// ---- Model 2: peptide charge quiz ------------------------------------------
const PH_CHOICES = [
  { pH: 1, he: '1 (חומצי מאוד)' },
  { pH: 7, he: '7 (ניטרלי)' },
  { pH: 12, he: '12 (בסיסי)' },
]
const roundCharge = (q) => Math.round(q)

function makePeptide() {
  const n = 3 + rnd(3) // 3–5
  const residues = Array.from({ length: n }, () => sample(AMINO_ACIDS))
  const { pH, he } = sample(PH_CHOICES)
  return { residues, pH, phHe: he }
}

function ChargeModel() {
  const [pep, setPep] = useState(makePeptide)
  const [vals, setVals] = useState(() => pep.residues.map(() => 0))
  const [checked, setChecked] = useState(false)

  const n = pep.residues.length
  const expected = pep.residues.map((aa, i) =>
    roundCharge(peptideResidueCharge(aa, pep.pH, i === 0, i === n - 1)),
  )
  const correctCount = vals.filter((v, i) => v === expected[i]).length

  function setVal(i, delta) {
    if (checked) return
    setVals((a) => a.map((v, j) => (j === i ? Math.max(-2, Math.min(2, v + delta)) : v)))
  }
  function newRound() {
    const p = makePeptide()
    setPep(p)
    setVals(p.residues.map(() => 0))
    setChecked(false)
  }
  const fmt = (q) => (q > 0 ? `+${q}` : `${q}`)

  return (
    <div className="charge-model">
      <div className="charge-ph">pH = <strong>{pep.phHe}</strong> · קבע/י את המטען של כל שארית</div>

      <div className="pep-row" dir="ltr">
        {pep.residues.map((aa, i) => {
          const ok = vals[i] === expected[i]
          const role = i === 0 ? 'N-קצה' : i === n - 1 ? 'C-קצה' : 'אמצע'
          let cls = 'pep-res'
          if (checked) cls += ok ? ' pep-ok' : ' pep-bad'
          return (
            <div key={i} className={cls}>
              <span className="pep-role">{role}</span>
              <span className="pep-one">{aa.one}</span>
              <span className="pep-three">{aa.three}</span>
              <div className="pep-stepper">
                <button onClick={() => setVal(i, -1)} disabled={checked}>−</button>
                <span className="pep-charge">{fmt(vals[i])}</span>
                <button onClick={() => setVal(i, +1)} disabled={checked}>+</button>
              </div>
              {checked && !ok && <span className="pep-correct">נכון: {fmt(expected[i])}</span>}
            </div>
          )
        })}
      </div>

      {!checked ? (
        <div className="results-actions">
          <button className="primary" onClick={() => setChecked(true)}>בדיקה</button>
          <button onClick={newRound}>פפטיד חדש</button>
        </div>
      ) : (
        <>
          <div className={`game-finish ${correctCount === n ? 'finish-perfect' : ''}`}>
            <div className="finish-title">{correctCount === n ? '🎉 הכול נכון!' : `${correctCount}/${n} נכונות`}</div>
            <div className="finish-sub">
              זכור/י: רק השארית הראשונה נושאת NH₃⁺ (קצה N), רק האחרונה נושאת COO⁻ (קצה C),
              ובאמצע — רק שרשרת הצד קובעת.
            </div>
            <div className="results-actions">
              <button className="primary" onClick={newRound}>פפטיד חדש</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
