// parseXml.js
// -----------------------------------------------------------------------------
// Turns one XML question file (a <questionset>) into a plain JS object that the
// React components can render. We parse in the browser with the built-in
// DOMParser — no build step, no extra dependency. This keeps the CONTENT (the
// XML) fully decoupled from the UI: you can hand-edit an .xml file and the app
// renders the change with no code change.
//
// The schema this matches (see README + the sample amino-acids.xml):
//
//   <questionset subject="" topic="" textbook="" chapter="">
//     <question id="" difficulty="" type="">
//       <stem>...</stem>
//       <terms><term he="" en=""/></terms>
//       <options><option id="a" correct="true|false">...</option></options>
//       <explanation>
//         <correct>...</correct>
//         <distractor option="b">...</distractor>
//       </explanation>
//       <source type="" basis=""/>
//       <tags><tag>...</tag></tags>
//     </question>
//   </questionset>
// -----------------------------------------------------------------------------

// Small helper: read an attribute, falling back to '' if the node is missing.
const attr = (el, name) => (el ? el.getAttribute(name) || '' : '')

// Small helper: trimmed text content of the first matching child element.
const text = (parent, selector) => {
  const el = parent.querySelector(selector)
  return el ? el.textContent.trim() : ''
}

/**
 * Parse a raw XML string into a deck object.
 * @param {string} xmlString - the file contents
 * @param {string} filePath  - where it came from (for nicer error messages)
 * @returns {{subject,topic,textbook,chapter,questions:Array}}
 */
export function parseQuestionSet(xmlString, filePath = '') {
  const doc = new DOMParser().parseFromString(xmlString, 'application/xml')

  // DOMParser reports malformed XML by inserting a <parsererror> node rather
  // than throwing — so we check for it explicitly and fail loudly.
  const parseError = doc.querySelector('parsererror')
  if (parseError) {
    throw new Error(`XML parse error in ${filePath}: ${parseError.textContent}`)
  }

  const set = doc.querySelector('questionset')
  if (!set) throw new Error(`No <questionset> root in ${filePath}`)

  const questions = Array.from(set.querySelectorAll('question')).map((q) => {
    const options = Array.from(q.querySelectorAll('options > option')).map((o) => ({
      id: attr(o, 'id'),
      correct: attr(o, 'correct') === 'true',
      text: o.textContent.trim(),
    }))

    const terms = Array.from(q.querySelectorAll('terms > term')).map((t) => ({
      he: attr(t, 'he'),
      en: attr(t, 'en'),
    }))

    // Distractor explanations keyed by the option id they explain ("b" -> "...").
    const distractors = {}
    q.querySelectorAll('explanation > distractor').forEach((d) => {
      distractors[attr(d, 'option')] = d.textContent.trim()
    })

    const sourceEl = q.querySelector('source')

    return {
      id: attr(q, 'id'),
      difficulty: attr(q, 'difficulty'),
      type: attr(q, 'type'),
      stem: text(q, 'stem'),
      terms,
      options,
      explanation: {
        correct: text(q, 'explanation > correct'),
        distractors,
      },
      source: {
        type: attr(sourceEl, 'type'),
        basis: attr(sourceEl, 'basis'),
      },
      tags: Array.from(q.querySelectorAll('tags > tag')).map((t) => t.textContent.trim()),
    }
  })

  return {
    subject: attr(set, 'subject'),
    topic: attr(set, 'topic'),
    textbook: attr(set, 'textbook'),
    chapter: attr(set, 'chapter'),
    questions,
  }
}
