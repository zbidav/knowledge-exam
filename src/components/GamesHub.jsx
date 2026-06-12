import { useState } from 'react'
import { ALL_GAMES } from '../lib/loadGames.js'
import { SUBJECTS, subjectByKey } from '../data/subjects.js'
import MatchGame from './MatchGame.jsx'
import OrderGame from './OrderGame.jsx'
import AminoAcidAbbrevGame from './AminoAcidAbbrevGame.jsx'
import AminoAcidChargeLab from './AminoAcidChargeLab.jsx'
import MembranePotentialLab from './MembranePotentialLab.jsx'

// Built-in (code-driven) games — richer than the XML match/order decks. Each
// declares its subject so it groups with the rest. `Component` takes { onExit }.
const BUILTIN_GAMES = [
  {
    id: 'builtin-aa-abbrev',
    subject: 'biochemistry',
    title: 'קודים של חומצות אמינו',
    sub: 'זיהוי קוד 1/3 אותיות לשם המלא',
    icon: '🔤',
    Component: AminoAcidAbbrevGame,
  },
  {
    id: 'builtin-aa-charge',
    subject: 'biochemistry',
    title: 'מעבדת מטען ו-pH',
    sub: 'הדגמה חיה: מטען חומצות אמינו לפי pH',
    icon: '⚗️',
    Component: AminoAcidChargeLab,
  },
  {
    id: 'builtin-membrane-potential',
    subject: 'physiology',
    title: 'מעבדת פוטנציאל ממברנה',
    sub: 'Nernst לכל יון + פוטנציאל מנוחה (Goldman) חי',
    icon: '⚡',
    Component: MembranePotentialLab,
  },
]

// Normalize an XML-discovered game into the same shape the list renders.
function describeXmlGame(g) {
  const isMatch = g.kind === 'match'
  return {
    id: g.id,
    subject: g.subject,
    title: g.title,
    sub: `משחק ${isMatch ? 'התאמה' : 'סידור'} · ${
      isMatch ? g.pairs.length : g.steps.length
    } פריטים`,
    icon: isMatch ? '🔗' : '🔢',
    raw: g, // kept so we can launch the right component
  }
}

export default function GamesHub({ onBack }) {
  const [active, setActive] = useState(null)

  // Launch screen for whichever game is selected.
  if (active) {
    if (active.Component) {
      const C = active.Component
      return <C onExit={() => setActive(null)} />
    }
    const Cmp = active.raw.kind === 'match' ? MatchGame : OrderGame
    return <Cmp game={active.raw} onExit={() => setActive(null)} />
  }

  // All games (built-in + XML), grouped by subject in SUBJECTS order.
  const all = [...BUILTIN_GAMES, ...ALL_GAMES.map(describeXmlGame)]
  const bySubject = SUBJECTS.map((s) => ({
    subject: s,
    games: all.filter((g) => g.subject === s.key),
  })).filter((grp) => grp.games.length > 0)

  return (
    <section className="games-hub">
      <h1>🧩 משחקים</h1>
      {all.length === 0 && <p className="empty">עדיין אין משחקים.</p>}

      {bySubject.map(({ subject, games }) => (
        <div key={subject.key} className="game-group">
          <h2 className="game-group-title" style={{ color: subject.color }}>
            {subject.he}
          </h2>
          <ul className="game-list">
            {games.map((g) => (
              <li key={g.id}>
                <button className="game-row" onClick={() => setActive(g)}>
                  <span className="game-icon">{g.icon}</span>
                  <span className="game-meta">
                    <span className="game-title">{g.title}</span>
                    <span className="game-sub">{g.sub}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <button className="link" onClick={onBack}>← חזרה לתפריט</button>
    </section>
  )
}
