import { useState, useEffect } from 'react'
import { SUBJECTS, subjectByKey } from './data/subjects.js'
import { decksForSubject, questionsForSubject, ALL_QUESTIONS } from './lib/loadDecks.js'
import Practice from './components/Practice.jsx'
import QuizSetup from './components/QuizSetup.jsx'
import GamesHub from './components/GamesHub.jsx'

// Theme (light/dark). We read a saved choice from localStorage, falling back to
// the OS preference. The choice is applied by setting data-theme on <html>, which
// CSS targets — see index.css. Returns [theme, toggle].
function useTheme() {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('knowledge-exam:theme')
    if (saved) return saved
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('knowledge-exam:theme', theme)
  }, [theme])
  return [theme, () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))]
}

// The whole app is a tiny state machine with three screens. We keep navigation
// in React state (not a URL router) so the static build works on GitHub Pages
// with zero config and no broken deep links.
//
//   home    -> grid of the 4 subjects
//   topics  -> the topics inside one subject (+ "practice whole subject")
//   practice-> the actual question runner
//
// Memory games (match / order) will later add another screen here; the
// architecture already isolates each screen as its own branch.
export default function App() {
  const [view, setView] = useState('home')
  const [subjectKey, setSubjectKey] = useState(null)
  const [theme, toggleTheme] = useTheme()
  // The set of questions handed to the runner (a topic, a whole subject, or a
  // random quiz). isQuiz toggles the score screen at the end.
  const [session, setSession] = useState({ title: '', questions: [], isQuiz: false })

  function openSubject(key) {
    setSubjectKey(key)
    setView('topics')
  }

  function startPractice(title, questions) {
    if (questions.length === 0) return
    setSession({ title, questions, isQuiz: false })
    setView('practice')
  }

  function startQuiz(title, questions) {
    if (questions.length === 0) return
    setSession({ title, questions, isQuiz: true })
    setView('practice')
  }

  return (
    <div className="app">
      <header className="topbar">
        <button className="brand" onClick={() => setView('home')}>
          תרגול מבחן הידע
        </button>
        <div className="topbar-right">
          {view !== 'home' && (
            <button className="link" onClick={() => setView('home')}>
              ← חזרה לתפריט
            </button>
          )}
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'מצב יום' : 'מצב לילה'}
            aria-label="החלף ערכת צבעים"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      <main>
        {view === 'home' && (
          <SubjectGrid
            onPick={openSubject}
            onQuiz={() => setView('quiz-setup')}
            onGames={() => setView('games')}
          />
        )}
        {view === 'quiz-setup' && (
          <QuizSetup onStart={startQuiz} onBack={() => setView('home')} />
        )}
        {view === 'games' && <GamesHub onBack={() => setView('home')} />}
        {view === 'topics' && (
          <TopicList
            subjectKey={subjectKey}
            onBack={() => setView('home')}
            onStart={startPractice}
          />
        )}
        {view === 'practice' && (
          <Practice
            title={session.title}
            questions={session.questions}
            isQuiz={session.isQuiz}
            onExit={() => setView(session.isQuiz ? 'home' : 'topics')}
          />
        )}
      </main>
    </div>
  )
}

// ---- Screen 1: the four subjects + the random-quiz & games entries ---------
function SubjectGrid({ onPick, onQuiz, onGames }) {
  return (
    <section className="subject-grid">
      <div className="cta-row">
        <button className="quiz-cta" onClick={onQuiz}>
          <span className="quiz-cta-title">🎯 מבחן אקראי</span>
          <span className="quiz-cta-sub">
            {ALL_QUESTIONS.length} שאלות במאגר · בחר/י כמה לתרגל וקבל/י ציון
          </span>
        </button>
        <button className="games-cta" onClick={onGames}>
          <span className="quiz-cta-title">🧩 משחקים</span>
          <span className="quiz-cta-sub">
            התאמה, סידור, קודים ומעבדת pH · למידה אינטראקטיבית
          </span>
        </button>
      </div>

      <h1>או תרגול לפי מקצוע</h1>
      <div className="cards">
        {SUBJECTS.map((s) => {
          const count = questionsForSubject(s.key).length
          return (
            <button
              key={s.key}
              className="subject-card"
              style={{ borderTopColor: s.color }}
              onClick={() => onPick(s.key)}
            >
              <span className="subject-he">{s.he}</span>
              <span className="subject-en">{s.en}</span>
              <span className="subject-count">{count} שאלות</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}

// ---- Screen 2: topics within a subject -------------------------------------
function TopicList({ subjectKey, onStart }) {
  const subject = subjectByKey[subjectKey]
  const decks = decksForSubject(subjectKey)
  const subjectQuestions = questionsForSubject(subjectKey)

  return (
    <section className="topic-list">
      <h1 style={{ color: subject.color }}>{subject.he}</h1>

      {subjectQuestions.length > 0 && (
        <button
          className="practice-all"
          onClick={() => onStart(subject.he + ' — כל הנושאים', subjectQuestions)}
        >
          תרגול כל המקצוע ({subjectQuestions.length} שאלות)
        </button>
      )}

      {decks.length === 0 && (
        <p className="empty">
          עדיין אין שאלות במקצוע הזה. הוסף/י קובץ XML תחת{' '}
          <code>content/{subjectKey}/</code>.
        </p>
      )}

      <ul className="topics">
        {decks.map((d) => (
          <li key={d.path}>
            <button
              className="topic-row"
              onClick={() => onStart(d.topic, d.questions)}
            >
              <span className="topic-name">{d.topic}</span>
              <span className="topic-meta">
                {d.questions.length} שאלות
                {d.textbook ? ` · ${d.textbook}` : ''}
                {d.chapter ? ` ${d.chapter}` : ''}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
