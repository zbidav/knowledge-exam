// storage.js
// -----------------------------------------------------------------------------
// Tiny wrapper over localStorage for *your own* progress. Because this is your
// personal, self-hosted site, browser storage is the right call: no backend, no
// accounts. Everything is namespaced under one key so it's easy to inspect or
// clear (Application tab in dev tools, or window.localStorage.clear()).
//
// We deliberately keep the shape minimal for the MVP — per-question seen/correct
// tallies — but route ALL reads/writes through here so that when you later port
// spaced-repetition logic from your flashcard app, you only touch this file.
// -----------------------------------------------------------------------------

const KEY = 'knowledge-exam:v1'

function readAll() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {}
  } catch {
    return {}
  }
}

function writeAll(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data))
  } catch (err) {
    // Private-mode / quota errors shouldn't crash a study session.
    console.warn('Could not save progress:', err)
  }
}

/** Per-question stats: { seen, correct }. Returns zeros if never answered. */
export function getQuestionStat(questionId) {
  const all = readAll()
  return all.questions?.[questionId] || { seen: 0, correct: 0 }
}

/** Record one answered attempt for a question. */
export function recordAnswer(questionId, wasCorrect) {
  const all = readAll()
  all.questions = all.questions || {}
  const cur = all.questions[questionId] || { seen: 0, correct: 0 }
  all.questions[questionId] = {
    seen: cur.seen + 1,
    correct: cur.correct + (wasCorrect ? 1 : 0),
  }
  writeAll(all)
}

/** Wipe all stored progress (used by a future "reset" button). */
export function resetProgress() {
  writeAll({})
}
