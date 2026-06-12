import { useMemo, useState } from 'react'
import { AMINO_ACIDS } from '../data/aminoAcids.js'

// Amino-acid abbreviation game.
// Shows a random "peptide word" written in 1-letter code (e.g. K D E Y). For each
// letter the player picks the amino acid by full name from a dropdown of all 20
// (the dropdown does NOT reveal the 1-letter code, so it's genuine recall).
// "Check" colors each letter correct/wrong and shows the full + 3-letter names.

// Options for the dropdowns, sorted by English name; value is the 1-letter code.
const NAME_OPTIONS = [...AMINO_ACIDS]
  .sort((a, b) => a.en.localeCompare(b.en))
  .map((a) => ({ value: a.one, label: `${a.he} (${a.en})` }))

function randomWord(len) {
  const w = []
  for (let i = 0; i < len; i++) {
    w.push(AMINO_ACIDS[Math.floor(Math.random() * AMINO_ACIDS.length)])
  }
  return w
}

export default function AminoAcidAbbrevGame({ onExit }) {
  const [len, setLen] = useState(4)
  const [seed, setSeed] = useState(0)
  const word = useMemo(() => randomWord(len), [len, seed])
  const [answers, setAnswers] = useState(() => Array(len).fill(''))
  const [checked, setChecked] = useState(false)

  function newWord(nextLen = len) {
    setAnswers(Array(nextLen).fill(''))
    setChecked(false)
    setSeed((s) => s + 1)
  }
  function setLength(n) {
    setLen(n)
    setAnswers(Array(n).fill(''))
    setChecked(false)
    setSeed((s) => s + 1)
  }

  const allAnswered = answers.every((a) => a !== '')
  const correctCount = word.filter((aa, i) => answers[i] === aa.one).length

  return (
    <section className="game aa-abbrev">
      <div className="game-head">
        <div>
          <h2>קודים של חומצות אמינו</h2>
          <div className="progress-line">זהה/י כל אות בקוד החד-אותי לפי השם המלא</div>
        </div>
        <button className="link" onClick={onExit}>← למשחקים</button>
      </div>

      <div className="aa-len-row">
        <span>אורך מילה:</span>
        {[3, 4, 5].map((n) => (
          <button
            key={n}
            className={`chip ${len === n ? 'chip-on' : ''}`}
            onClick={() => setLength(n)}
          >
            {n}
          </button>
        ))}
      </div>

      <div className="aa-word">
        {word.map((aa, i) => {
          const ok = answers[i] === aa.one
          const cls = checked ? (ok ? ' aa-correct' : ' aa-wrong') : ''
          return (
            <div key={i} className={`aa-letter-box${cls}`}>
              <span className="aa-big">{aa.one}</span>
              {checked && (
                <span className="aa-reveal">
                  {aa.three} · {aa.he}
                </span>
              )}
              <select
                className="aa-select"
                value={answers[i]}
                disabled={checked}
                onChange={(e) => {
                  const v = e.target.value
                  setAnswers((prev) => prev.map((a, j) => (j === i ? v : a)))
                }}
              >
                <option value="">בחר/י…</option>
                {NAME_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          )
        })}
      </div>

      {!checked ? (
        <div className="results-actions">
          <button className="primary" disabled={!allAnswered} onClick={() => setChecked(true)}>
            בדיקה
          </button>
          <button onClick={() => newWord()}>מילה חדשה</button>
        </div>
      ) : (
        <div className={`game-finish ${correctCount === len ? 'finish-perfect' : ''}`}>
          <div className="finish-title">
            {correctCount === len ? '🎉 הכול נכון!' : `${correctCount}/${len} נכונות`}
          </div>
          <div className="results-actions">
            <button className="primary" onClick={() => newWord()}>מילה חדשה</button>
            <button className="link" onClick={onExit}>חזרה למשחקים</button>
          </div>
        </div>
      )}
    </section>
  )
}
