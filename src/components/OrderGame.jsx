import { useMemo, useState } from 'react'

function shuffled(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Order game: the correct order is the document order of <step>s. We show them
// shuffled in a pool; the player clicks them, in order, to build the sequence.
// Click a placed step to send it back. When all are placed we auto-check and
// color each slot by whether it sits in its correct position.
export default function OrderGame({ game, onExit }) {
  // id = correct position (0-based), text = step label.
  const steps = useMemo(() => game.steps.map((text, i) => ({ id: i, text })), [game])
  const [seed, setSeed] = useState(0)
  const initialPool = useMemo(() => shuffled(steps), [steps, seed])

  const [pool, setPool] = useState(initialPool)
  const [placed, setPlaced] = useState([])

  // Keep pool/placed in sync when a new round starts (seed change).
  // (Simplest: a key-based remount via restart resets these directly below.)
  const full = placed.length === steps.length
  const correctCount = placed.filter((s, i) => s.id === i).length

  function place(step) {
    setPlaced((p) => [...p, step])
    setPool((p) => p.filter((s) => s.id !== step.id))
  }
  function unplace(step) {
    if (full) return // locked once checked
    setPlaced((p) => p.filter((s) => s.id !== step.id))
    setPool((p) => [...p, step])
  }
  function restart() {
    const fresh = shuffled(steps)
    setPool(fresh)
    setPlaced([])
    setSeed((s) => s + 1)
  }

  return (
    <section className="game order-game">
      <div className="game-head">
        <div>
          <h2>{game.title}</h2>
          {game.prompt && <div className="progress-line">{game.prompt}</div>}
        </div>
        <button className="link" onClick={onExit}>
          ← למשחקים
        </button>
      </div>

      <div className="order-answer">
        <div className="order-zone-label">הסדר שלך (לחיצה על שלב מחזירה אותו)</div>
        {placed.length === 0 && <div className="order-empty">לחץ/י על השלבים למטה לפי הסדר הנכון</div>}
        {placed.map((s, i) => {
          const ok = s.id === i
          const cls = full ? (ok ? ' step-correct' : ' step-wrong') : ''
          return (
            <button
              key={s.id}
              className={`order-step placed${cls}`}
              onClick={() => unplace(s)}
            >
              <span className="step-num">{i + 1}</span>
              <span className="step-text">{s.text}</span>
              {full && <span className="step-verdict">{ok ? '✓' : '✗'}</span>}
            </button>
          )
        })}
      </div>

      {!full && pool.length > 0 && (
        <div className="order-pool">
          <div className="order-zone-label">שלבים</div>
          {pool.map((s) => (
            <button key={s.id} className="order-step pool" onClick={() => place(s)}>
              {s.text}
            </button>
          ))}
        </div>
      )}

      {full && (
        <div className={`game-finish ${correctCount === steps.length ? 'finish-perfect' : ''}`}>
          <div className="finish-title">
            {correctCount === steps.length ? '🎉 הסדר נכון!' : `${correctCount}/${steps.length} במקום הנכון`}
          </div>
          <div className="results-actions">
            <button className="primary" onClick={restart}>
              נסה/י שוב
            </button>
            <button className="link" onClick={onExit}>
              חזרה למשחקים
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
