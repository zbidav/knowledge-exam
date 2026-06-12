import { useMemo, useState } from 'react'

function shuffled(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Match game: two shuffled columns. Click a left card, then a right card. A
// correct pair locks green; a wrong pair flashes red and clears. Tracks mistakes
// and ends when every pair is matched. If a pair has an `img`, the left card
// shows the image (text becomes its caption/alt).
export default function MatchGame({ game, onExit }) {
  // Stable ids so we can match left↔right regardless of column shuffle.
  const pairs = useMemo(() => game.pairs.map((p, i) => ({ ...p, id: i })), [game])
  const [seed, setSeed] = useState(0) // bump to re-shuffle / restart
  const leftCards = useMemo(() => shuffled(pairs), [pairs, seed])
  const rightCards = useMemo(() => shuffled(pairs), [pairs, seed])

  const [selLeft, setSelLeft] = useState(null)
  const [selRight, setSelRight] = useState(null)
  const [matched, setMatched] = useState(() => new Set())
  const [wrong, setWrong] = useState(false)
  const [mistakes, setMistakes] = useState(0)

  const base = import.meta.env.BASE_URL // for /public images under any repo path
  const done = matched.size === pairs.length

  function evaluate(leftId, rightId) {
    if (leftId === rightId) {
      setMatched((m) => new Set(m).add(leftId))
      setSelLeft(null)
      setSelRight(null)
    } else {
      setWrong(true)
      setMistakes((n) => n + 1)
      // brief red flash, then clear the selection so the player can retry
      setTimeout(() => {
        setWrong(false)
        setSelLeft(null)
        setSelRight(null)
      }, 650)
    }
  }

  function clickLeft(id) {
    if (matched.has(id) || wrong) return
    setSelLeft(id)
    if (selRight != null) evaluate(id, selRight)
  }
  function clickRight(id) {
    if (matched.has(id) || wrong) return
    setSelRight(id)
    if (selLeft != null) evaluate(selLeft, id)
  }

  function restart() {
    setMatched(new Set())
    setSelLeft(null)
    setSelRight(null)
    setWrong(false)
    setMistakes(0)
    setSeed((s) => s + 1)
  }

  function cardClass(id, side, sel) {
    let c = 'match-card'
    if (matched.has(id)) c += ' match-done'
    else if (sel === id) c += wrong ? ' match-wrong' : ' match-sel'
    return c
  }

  return (
    <section className="game match-game">
      <div className="game-head">
        <div>
          <h2>{game.title}</h2>
          <div className="progress-line">
            הותאמו {matched.size}/{pairs.length} · טעויות: {mistakes}
          </div>
        </div>
        <button className="link" onClick={onExit}>
          ← למשחקים
        </button>
      </div>

      {done ? (
        <div className={`game-finish ${mistakes === 0 ? 'finish-perfect' : ''}`}>
          <div className="finish-title">
            {mistakes === 0 ? '🎉 מושלם!' : '✓ סיימת!'}
          </div>
          <div className="finish-sub">
            כל {pairs.length} ההתאמות נכונות · {mistakes} טעויות בדרך
          </div>
          <div className="results-actions">
            <button className="primary" onClick={restart}>
              שחק שוב
            </button>
            <button className="link" onClick={onExit}>
              חזרה למשחקים
            </button>
          </div>
        </div>
      ) : (
        <div className="match-columns">
          <div className="match-col">
            {game.leftLabel && <div className="match-col-label">{game.leftLabel}</div>}
            {leftCards.map((p) => (
              <button
                key={`l${p.id}`}
                className={cardClass(p.id, 'left', selLeft)}
                disabled={matched.has(p.id)}
                onClick={() => clickLeft(p.id)}
              >
                {p.img ? (
                  <>
                    <img className="match-img" src={base + p.img} alt={p.left} />
                    {p.left && <span className="match-cap">{p.left}</span>}
                  </>
                ) : (
                  p.left
                )}
              </button>
            ))}
          </div>
          <div className="match-col">
            {game.rightLabel && <div className="match-col-label">{game.rightLabel}</div>}
            {rightCards.map((p) => (
              <button
                key={`r${p.id}`}
                className={cardClass(p.id, 'right', selRight)}
                disabled={matched.has(p.id)}
                onClick={() => clickRight(p.id)}
              >
                {p.right}
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
