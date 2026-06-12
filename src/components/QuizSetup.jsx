import { useState } from 'react'
import { SUBJECTS } from '../data/subjects.js'
import { ALL_QUESTIONS, questionsForSubject } from '../lib/loadDecks.js'

// Quiz setup: choose how many random questions and from which pool (all subjects
// — like the real mixed exam — or a single subject). On start we sample that
// many questions at random and hand them to the runner in quiz mode, which ends
// with a score screen. Nothing here is persisted; it's a fresh draw each time.
export default function QuizSetup({ onStart, onBack }) {
  const [scope, setScope] = useState('all') // 'all' or a subject key
  const [count, setCount] = useState(10)

  // The pool of questions matching the chosen scope.
  const pool = scope === 'all' ? ALL_QUESTIONS : questionsForSubject(scope)
  const maxCount = pool.length
  // Clamp the requested count to what's actually available.
  const effectiveCount = Math.min(count, maxCount)

  function sampleAndStart() {
    if (maxCount === 0) return
    // Shuffle a copy and take the first `effectiveCount`.
    const shuffled = [...pool]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    const picked = shuffled.slice(0, effectiveCount)
    const scopeLabel =
      scope === 'all'
        ? 'כל המקצועות'
        : SUBJECTS.find((s) => s.key === scope)?.he || scope
    onStart(`מבחן אקראי · ${scopeLabel} · ${picked.length} שאלות`, picked)
  }

  // Offer round counts, but never more than the pool holds.
  const countOptions = [5, 10, 20, 30, 50].filter((n) => n <= maxCount)
  if (maxCount > 0 && !countOptions.includes(maxCount)) countOptions.push(maxCount)

  return (
    <section className="quiz-setup">
      <h1>מבחן אקראי</h1>
      <p className="quiz-intro">
        בחר/י מאגר ומספר שאלות. השאלות ייבחרו באקראי ובסיום תוצג לך תוצאה. אין
        שמירה בין הפעלות — כל מבחן הוא הגרלה חדשה.
      </p>

      <div className="quiz-field">
        <label>מאגר שאלות</label>
        <div className="chip-row">
          <button
            className={`chip ${scope === 'all' ? 'chip-on' : ''}`}
            onClick={() => setScope('all')}
          >
            כל המקצועות ({ALL_QUESTIONS.length})
          </button>
          {SUBJECTS.map((s) => {
            const n = questionsForSubject(s.key).length
            return (
              <button
                key={s.key}
                className={`chip ${scope === s.key ? 'chip-on' : ''}`}
                disabled={n === 0}
                onClick={() => setScope(s.key)}
              >
                {s.he} ({n})
              </button>
            )
          })}
        </div>
      </div>

      <div className="quiz-field">
        <label>מספר שאלות</label>
        <div className="chip-row">
          {countOptions.map((n) => (
            <button
              key={n}
              className={`chip ${effectiveCount === n ? 'chip-on' : ''}`}
              onClick={() => setCount(n)}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <div className="quiz-actions">
        <button className="primary big" disabled={maxCount === 0} onClick={sampleAndStart}>
          התחל מבחן ({effectiveCount} שאלות)
        </button>
        <button className="link" onClick={onBack}>
          חזרה
        </button>
      </div>
    </section>
  )
}
