// parseGames.js
// -----------------------------------------------------------------------------
// Parses the two game content types, both via DOMParser (same approach as the
// question decks — content stays plain, hand-editable XML, decoupled from UI).
//
// MATCH game (pair a left item with a right item; left may be an image):
//   <matchset subject="" topic="" title="" leftLabel="" rightLabel="">
//     <pair left="גלוקוז" right="חד-סוכר (monosaccharide)" img="sugars/glucose.png"/>
//     <!-- img is OPTIONAL and relative to /public; when present the left side
//          shows the image instead of the `left` text (text becomes its alt). -->
//   </matchset>
//
// ORDER game (drag the shuffled steps into the correct sequence):
//   <orderset subject="" topic="" title="" prompt="סדר/י את שלבי...">
//     <step>שלב ראשון</step>
//     <step>שלב שני</step>
//     <!-- document order IS the correct order -->
//   </orderset>
// -----------------------------------------------------------------------------

const attr = (el, name) => (el ? el.getAttribute(name) || '' : '')

function parseDoc(xmlString, filePath) {
  const doc = new DOMParser().parseFromString(xmlString, 'application/xml')
  const err = doc.querySelector('parsererror')
  if (err) throw new Error(`XML parse error in ${filePath}: ${err.textContent}`)
  return doc
}

/**
 * Parse one game file into a normalized game object.
 * @returns {{kind:'match'|'order', subject, topic, title, ...}}
 */
export function parseGame(xmlString, filePath = '') {
  const doc = parseDoc(xmlString, filePath)

  const matchEl = doc.querySelector('matchset')
  if (matchEl) {
    const pairs = Array.from(matchEl.querySelectorAll('pair')).map((p) => ({
      left: attr(p, 'left'),
      right: attr(p, 'right'),
      img: attr(p, 'img'), // optional; '' when absent
    }))
    return {
      kind: 'match',
      subject: attr(matchEl, 'subject'),
      topic: attr(matchEl, 'topic'),
      title: attr(matchEl, 'title') || attr(matchEl, 'topic'),
      leftLabel: attr(matchEl, 'leftLabel'),
      rightLabel: attr(matchEl, 'rightLabel'),
      pairs,
    }
  }

  const orderEl = doc.querySelector('orderset')
  if (orderEl) {
    const steps = Array.from(orderEl.querySelectorAll('step')).map((s) =>
      s.textContent.trim(),
    )
    return {
      kind: 'order',
      subject: attr(orderEl, 'subject'),
      topic: attr(orderEl, 'topic'),
      title: attr(orderEl, 'title') || attr(orderEl, 'topic'),
      prompt: attr(orderEl, 'prompt'),
      steps, // correct order = document order
    }
  }

  throw new Error(`No <matchset> or <orderset> root in ${filePath}`)
}
