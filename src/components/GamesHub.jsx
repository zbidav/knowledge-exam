import { useState } from 'react'
import { ALL_GAMES } from '../lib/loadGames.js'
import { subjectByKey } from '../data/subjects.js'
import MatchGame from './MatchGame.jsx'
import OrderGame from './OrderGame.jsx'

// Lists every discovered game and launches the right component for its kind.
// Kept as its own screen so more game types can slot in later.
export default function GamesHub({ onBack }) {
  const [active, setActive] = useState(null) // the selected game object, or null

  if (active) {
    const Cmp = active.kind === 'match' ? MatchGame : OrderGame
    return <Cmp game={active} onExit={() => setActive(null)} />
  }

  return (
    <section className="games-hub">
      <h1>🧩 משחקים</h1>
      {ALL_GAMES.length === 0 && (
        <p className="empty">
          עדיין אין משחקים. הוסף/י קובץ תחת <code>content/&lt;מקצוע&gt;/games/</code>.
        </p>
      )}
      <ul className="game-list">
        {ALL_GAMES.map((g) => {
          const subj = subjectByKey[g.subject]
          const badge = g.kind === 'match' ? 'התאמה' : 'סידור'
          const icon = g.kind === 'match' ? '🔗' : '🔢'
          const size = g.kind === 'match' ? g.pairs.length : g.steps.length
          return (
            <li key={g.id}>
              <button className="game-row" onClick={() => setActive(g)}>
                <span className="game-icon">{icon}</span>
                <span className="game-meta">
                  <span className="game-title">{g.title}</span>
                  <span className="game-sub">
                    {subj ? subj.he : g.subject} · משחק {badge} · {size} פריטים
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
      <button className="link" onClick={onBack}>
        ← חזרה לתפריט
      </button>
    </section>
  )
}
