import { useMemo, useState } from 'react'

function shuffled(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Order game: correct order = document order. The player clicks the shuffled
// pool items, in order, to build the sequence; click a placed item to return it.
// Three layouts (game.layout): 'vertical' (default), 'horizontal' (a row), and
// 'circular' (steps placed around a ring — for cycles like Krebs; author the
// steps from a conventional starting node, the ring is purely visual).
export default function OrderGame({ game, onExit }) {
  const layout = game.layout || 'vertical'
  const steps = useMemo(() => game.steps.map((text, i) => ({ id: i, text })), [game])
  const [seed, setSeed] = useState(0)
  const initialPool = useMemo(() => shuffled(steps), [steps, seed])

  const [pool, setPool] = useState(initialPool)
  const [placed, setPlaced] = useState([])

  const full = placed.length === steps.length
  const correctCount = placed.filter((s, i) => s.id === i).length

  function place(step) {
    setPlaced((p) => [...p, step])
    setPool((p) => p.filter((s) => s.id !== step.id))
  }
  function unplace(step) {
    if (full) return
    setPlaced((p) => p.filter((s) => s.id !== step.id))
    setPool((p) => [...p, step])
  }
  function restart() {
    setPool(shuffled(steps))
    setPlaced([])
    setSeed((s) => s + 1)
  }

  const verdictClass = (s, i) => (full ? (s.id === i ? ' step-correct' : ' step-wrong') : '')

  // Shared "a placed step" renderer for vertical & horizontal.
  const placedStep = (s, i) => (
    <button key={s.id} className={`order-step placed${verdictClass(s, i)}`} onClick={() => unplace(s)}>
      <span className="step-num">{i + 1}</span>
      <span className="step-text">{s.text}</span>
      {full && <span className="step-verdict">{s.id === i ? '✓' : '✗'}</span>}
    </button>
  )

  return (
    <section className={`game order-game order-${layout}`}>
      <div className="game-head">
        <div>
          <h2>{game.title}</h2>
          {game.prompt && <div className="progress-line">{game.prompt}</div>}
        </div>
        <button className="link" onClick={onExit}>← למשחקים</button>
      </div>

      {layout === 'circular' ? (
        <CircleAnswer steps={steps} placed={placed} full={full} onUnplace={unplace} title={game.topic} />
      ) : (
        <div className={`order-answer answer-${layout}`}>
          <div className="order-zone-label">הסדר שלך (לחיצה על שלב מחזירה אותו)</div>
          {placed.length === 0 && (
            <div className="order-empty">לחץ/י על השלבים למטה לפי הסדר הנכון</div>
          )}
          <div className={layout === 'horizontal' ? 'placed-row' : 'placed-col'}>
            {placed.map((s, i) => placedStep(s, i))}
          </div>
        </div>
      )}

      {!full && pool.length > 0 && (
        <div className="order-pool">
          <div className="order-zone-label">שלבים</div>
          <div className={layout === 'vertical' ? 'placed-col' : 'placed-row'}>
            {pool.map((s) => (
              <button key={s.id} className="order-step pool" onClick={() => place(s)}>
                {s.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {full && (
        <div className={`game-finish ${correctCount === steps.length ? 'finish-perfect' : ''}`}>
          <div className="finish-title">
            {correctCount === steps.length ? '🎉 הסדר נכון!' : `${correctCount}/${steps.length} במקום הנכון`}
          </div>
          <div className="results-actions">
            <button className="primary" onClick={restart}>נסה/י שוב</button>
            <button className="link" onClick={onExit}>חזרה למשחקים</button>
          </div>
        </div>
      )}
    </section>
  )
}

// Circular layout: render N positions around a ring; placed steps fill them in
// order. Empty positions show a faint numbered placeholder.
function CircleAnswer({ steps, placed, full, onUnplace, title }) {
  const n = steps.length
  const node = (i) => {
    const angle = (i / n) * 2 * Math.PI - Math.PI / 2 // start at top, go clockwise
    const left = 50 + 42 * Math.cos(angle)
    const top = 50 + 42 * Math.sin(angle)
    const s = placed[i]
    const ok = s && s.id === i
    let cls = 'circle-node'
    if (!s) cls += ' circle-empty'
    else if (full) cls += ok ? ' step-correct' : ' step-wrong'
    return (
      <button
        key={i}
        className={cls}
        style={{ left: `${left}%`, top: `${top}%` }}
        onClick={() => s && onUnplace(s)}
        disabled={!s}
      >
        <span className="circle-num">{i + 1}</span>
        <span className="circle-text">{s ? s.text : '—'}</span>
        {full && s && <span className="step-verdict">{ok ? '✓' : '✗'}</span>}
      </button>
    )
  }
  return (
    <div className="order-circle">
      {title && <span className="circle-center">{title}</span>}
      {Array.from({ length: n }, (_, i) => node(i))}
    </div>
  )
}
