import { useMemo, useState } from 'react'
import QuestionView from './QuestionView.jsx'
import { recordAnswer } from '../lib/storage.js'

// Fisher–Yates shuffle (returns a new array, leaves the input untouched).
function shuffled(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// The runner walks through a list of questions one at a time, keeps a session
// score, and supports next/previous. Two modes:
//   - practice (default): free browsing, shuffle button, no end screen.
//   - quiz (isQuiz): a fixed random set; a "finish" action shows a score screen.
// In both modes the answered state per question is kept so paging back still
// shows the explanation.
export default function Practice({ title, questions, onExit, isQuiz = false }) {
  const [order, setOrder] = useState(() => questions)
  const [index, setIndex] = useState(0)
  // answers: { [questionId]: { chosenOptionId, correct } } for this session.
  const [answers, setAnswers] = useState({})
  const [finished, setFinished] = useState(false)

  const current = order[index]
  const answered = answers[current?.id]

  const score = useMemo(() => {
    const vals = Object.values(answers)
    return {
      answered: vals.length,
      correct: vals.filter((a) => a.correct).length,
    }
  }, [answers])

  function handleAnswer(chosenOptionId) {
    if (answers[current.id]) return // already answered this one
    const chosen = current.options.find((o) => o.id === chosenOptionId)
    const correct = !!chosen?.correct
    setAnswers((prev) => ({ ...prev, [current.id]: { chosenOptionId, correct } }))
    recordAnswer(current.id, correct) // local-only tally; safe to ignore
  }

  function reshuffle() {
    setOrder(shuffled(questions))
    setIndex(0)
    setAnswers({})
    setFinished(false)
  }

  if (finished) {
    return (
      <ResultsScreen
        order={order}
        answers={answers}
        score={score}
        onReview={() => {
          setFinished(false)
          setIndex(0)
        }}
        onRestart={reshuffle}
        onExit={onExit}
      />
    )
  }

  const atFirst = index === 0
  const atLast = index === order.length - 1
  const allAnswered = score.answered === order.length

  return (
    <section className="practice">
      <div className="practice-head">
        <div>
          <h2>{title}</h2>
          <div className="progress-line">
            שאלה {index + 1} מתוך {order.length} · ניקוד: {score.correct}/
            {score.answered}
          </div>
        </div>
        <div className="practice-actions">
          {!isQuiz && (
            <button className="link" onClick={reshuffle}>
              🔀 ערבוב
            </button>
          )}
          {isQuiz ? (
            <button className="link" onClick={() => setFinished(true)}>
              {allAnswered ? 'הצג תוצאה' : 'סיים והצג תוצאה'}
            </button>
          ) : (
            <button className="link" onClick={onExit}>
              סיום
            </button>
          )}
        </div>
      </div>

      <QuestionView
        key={current.id}
        question={current}
        answer={answered}
        onAnswer={handleAnswer}
      />

      <div className="nav-buttons">
        <button disabled={atFirst} onClick={() => setIndex((i) => i - 1)}>
          → הקודמת
        </button>
        {isQuiz && atLast ? (
          <button className="primary" onClick={() => setFinished(true)}>
            סיים מבחן ✓
          </button>
        ) : (
          <button
            disabled={atLast}
            className="primary"
            onClick={() => setIndex((i) => i + 1)}
          >
            הבאה ←
          </button>
        )}
      </div>
    </section>
  )
}

// End-of-quiz score screen: percentage, a colored summary, and a per-question
// list so you can see which you missed (click one to jump back into review).
function ResultsScreen({ order, answers, score, onReview, onRestart, onExit }) {
  const total = order.length
  const pct = total ? Math.round((score.correct / total) * 100) : 0
  const grade = pct >= 80 ? 'good' : pct >= 60 ? 'ok' : 'low'

  return (
    <section className="results">
      <h2>תוצאות המבחן</h2>
      <div className={`score-badge score-${grade}`}>
        <span className="score-pct">{pct}%</span>
        <span className="score-frac">
          {score.correct} מתוך {total} נכונות
        </span>
      </div>

      <ol className="result-list">
        {order.map((q, i) => {
          const a = answers[q.id]
          const state = !a ? 'skipped' : a.correct ? 'correct' : 'wrong'
          const mark = state === 'correct' ? '✓' : state === 'wrong' ? '✗' : '—'
          return (
            <li key={q.id} className={`result-row result-${state}`}>
              <span className="result-mark">{mark}</span>
              <span className="result-stem">
                {i + 1}. {q.stem}
              </span>
            </li>
          )
        })}
      </ol>

      <div className="results-actions">
        <button className="primary" onClick={onReview}>
          סקירת השאלות
        </button>
        <button onClick={onRestart}>מבחן חדש (אותו מאגר)</button>
        <button className="link" onClick={onExit}>
          חזרה לתפריט
        </button>
      </div>
    </section>
  )
}
