// QuestionView.jsx
// Renders a single question: the stem, four options, and — once answered — the
// reveal block (correct answer, why-correct, why-each-wrong-is-wrong, the
// Hebrew⇄English term bridge, and the source tag). This component is purely
// presentational; all session state lives in <Practice>.

const OPTION_LABELS = { a: 'א', b: 'ב', c: 'ג', d: 'ד' } // Hebrew bullet letters

export default function QuestionView({ question, answer, onAnswer }) {
  const isAnswered = !!answer
  const chosenId = answer?.chosenOptionId

  return (
    <article className="question">
      <div className="stem">{question.stem}</div>

      <ul className="options">
        {question.options.map((opt) => {
          // Decide each option's visual state only after the user has answered.
          let cls = 'option'
          if (isAnswered) {
            if (opt.correct) cls += ' is-correct'
            else if (opt.id === chosenId) cls += ' is-wrong'
            else cls += ' is-muted'
          }
          return (
            <li key={opt.id}>
              <button
                className={cls}
                disabled={isAnswered}
                onClick={() => onAnswer(opt.id)}
              >
                <span className="opt-label">{OPTION_LABELS[opt.id] || opt.id}</span>
                <span className="opt-text">{opt.text}</span>
              </button>
            </li>
          )
        })}
      </ul>

      {isAnswered && <Reveal question={question} answer={answer} />}
    </article>
  )
}

function Reveal({ question, answer }) {
  const correctOpt = question.options.find((o) => o.correct)
  const wrongOptions = question.options.filter((o) => !o.correct)

  return (
    <div className={`reveal ${answer.correct ? 'reveal-correct' : 'reveal-wrong'}`}>
      <div className="verdict">
        {answer.correct ? '✓ תשובה נכונה' : '✗ תשובה שגויה'}
        {!answer.correct && correctOpt && (
          <span className="correct-pointer">
            {' '}
            — הנכונה: ({OPTION_LABELS[correctOpt.id] || correctOpt.id}){' '}
            {correctOpt.text}
          </span>
        )}
      </div>

      {question.explanation.correct && (
        <p className="why-correct">
          <strong>למה נכון: </strong>
          {question.explanation.correct}
        </p>
      )}

      {wrongOptions.some((o) => question.explanation.distractors[o.id]) && (
        <div className="why-wrong">
          <strong>למה שאר התשובות שגויות:</strong>
          <ul>
            {wrongOptions.map((o) =>
              question.explanation.distractors[o.id] ? (
                <li key={o.id}>
                  <span className="opt-label small">
                    {OPTION_LABELS[o.id] || o.id}
                  </span>
                  {question.explanation.distractors[o.id]}
                </li>
              ) : null,
            )}
          </ul>
        </div>
      )}

      {question.terms.length > 0 && (
        <div className="term-bridge">
          <strong>מונחים:</strong>
          <ul>
            {question.terms.map((t, i) => (
              <li key={i}>
                <span className="term-he">{t.he}</span>
                <span className="term-sep"> = </span>
                <span className="term-en" dir="ltr">{t.en}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="source-tag">
        {question.source.type === 'recall' ? '📝 שחזור ממבחן' : '📖 נכתב מהספר'}
        {question.source.basis ? ` · ${question.source.basis}` : ''}
        {question.difficulty ? ` · ${difficultyHe(question.difficulty)}` : ''}
      </div>
    </div>
  )
}

function difficultyHe(d) {
  return { basic: 'בסיסי', intermediate: 'בינוני', advanced: 'מתקדם' }[d] || d
}
