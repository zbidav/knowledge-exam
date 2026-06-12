// loadDecks.js
// -----------------------------------------------------------------------------
// Discovers every question file under /content/**/*.xml and parses it into deck
// objects, grouped by subject. We use Vite's import.meta.glob so that ADDING a
// new XML file is the only thing you need to do to get a new topic — no list to
// update, no import to add. The `{ query: '?raw', eager: true }` part tells Vite
// to inline each file's raw text at build time.
// -----------------------------------------------------------------------------
import { parseQuestionSet } from './parseXml.js'

// Eagerly pull in the raw text of every XML deck. Keys are file paths like
// "/content/biochemistry/amino-acids.xml"; values are the file contents.
const rawFiles = import.meta.glob('/content/**/*.xml', {
  query: '?raw',
  import: 'default',
  eager: true,
})

/**
 * Build the full deck list once at module load.
 * @returns {Array<{path,subject,topic,...,questions}>}
 */
function buildDecks() {
  const decks = []
  for (const [path, raw] of Object.entries(rawFiles)) {
    // Game files live under content/<subject>/games/ and have a different root
    // (<matchset>/<orderset>) — they're handled by loadGames.js, skip them here.
    if (path.includes('/games/')) continue
    try {
      const deck = parseQuestionSet(raw, path)
      // Fall back to the folder name if the XML omits the subject attribute.
      const subjectFromPath = path.split('/')[2]
      decks.push({ path, ...deck, subject: deck.subject || subjectFromPath })
    } catch (err) {
      // One broken file shouldn't take down the whole app — log and skip it.
      console.error(err)
    }
  }
  return decks
}

export const DECKS = buildDecks()

// Convenience: all decks for one subject key.
export const decksForSubject = (subjectKey) =>
  DECKS.filter((d) => d.subject === subjectKey)

// Convenience: every question in a subject, flattened, each tagged with its
// deck's topic/textbook so the UI can show provenance.
export const questionsForSubject = (subjectKey) =>
  decksForSubject(subjectKey).flatMap((d) =>
    d.questions.map((q) => ({ ...q, topic: d.topic, textbook: d.textbook, deckPath: d.path })),
  )

// Every question across ALL subjects, flattened and tagged with subject + topic.
// This is the pool the random Quiz mode draws from (the real exam mixes subjects).
export const ALL_QUESTIONS = DECKS.flatMap((d) =>
  d.questions.map((q) => ({
    ...q,
    subject: d.subject,
    topic: d.topic,
    textbook: d.textbook,
    deckPath: d.path,
  })),
)
