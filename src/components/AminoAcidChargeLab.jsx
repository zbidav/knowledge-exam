import { useState } from 'react'
import {
  AMINO_ACIDS,
  FAMILIES,
  sideChainCharge,
  freeAminoAcidCharge,
  peptideNetCharge,
  isoelectricPoint,
} from '../data/aminoAcids.js'

// Interactive pH / charge lab.
// Drag the pH slider; tiles are colored by charge at that pH. A toggle switches
// the per-tile value between:
//   - side chain only  (the R-group's contribution; 0 for non-ionizable)
//   - full charge       (the whole FREE amino acid: α-amino + α-carboxyl termini
//                        + side chain → roughly +2…−2; near pH 0 every AA is ~+1
//                        and near pH 14 ~−1 because the termini dominate).
// Build a peptide by clicking the palette (grouped by family); the peptide's net
// charge and estimated pI update live. The peptide reads N→C, left to right.

function chargeStyle(q) {
  if (q > 0.05) {
    const a = 0.15 + 0.7 * Math.min(q, 1)
    return { background: `rgba(59,130,246,${a})`, borderColor: '#3b82f6' }
  }
  if (q < -0.05) {
    const a = 0.15 + 0.7 * Math.min(-q, 1)
    return { background: `rgba(220,38,38,${a})`, borderColor: '#dc2626' }
  }
  return { background: 'var(--surface-2)', borderColor: 'var(--line)' }
}

const fmt = (q) => (q >= 0 ? `+${q.toFixed(1)}` : q.toFixed(1))

function Tile({ aa, q, onClick, removable }) {
  return (
    <button
      className={`aa-tile ${removable ? 'aa-tile-removable' : ''}`}
      style={chargeStyle(q)}
      onClick={onClick}
      title={`${aa.he} (${aa.en})`}
    >
      <span className="aa-tile-three">{aa.three}</span>
      <span className="aa-tile-one">{aa.one}</span>
      <span className="aa-tile-charge">{fmt(q)}</span>
    </button>
  )
}

export default function AminoAcidChargeLab({ onExit }) {
  const [pH, setPH] = useState(7.0)
  const [chain, setChain] = useState([])
  const [mode, setMode] = useState('side') // 'side' | 'full'

  // Value shown on a tile, per the selected mode.
  const tileCharge = (aa) =>
    mode === 'full' ? freeAminoAcidCharge(aa, pH) : sideChainCharge(aa, pH)

  const net = peptideNetCharge(chain, pH)
  const pI = isoelectricPoint(chain)
  const netSign = net > 0.05 ? 'pos' : net < -0.05 ? 'neg' : 'zero'

  const add = (aa) => setChain((c) => [...c, aa])
  const removeAt = (idx) => setChain((c) => c.filter((_, i) => i !== idx))

  return (
    <section className="game aa-charge">
      <div className="game-head">
        <div>
          <h2>מעבדת מטען ו-pH</h2>
          <div className="progress-line">
            הזז/י את ה-pH; האריחים נצבעים לפי המטען. בנה/י פפטיד מהלוח (מקובץ למשפחות).
          </div>
        </div>
        <button className="link" onClick={onExit}>← למשחקים</button>
      </div>

      {/* mode toggle */}
      <div className="charge-mode">
        <span>צביעה לפי:</span>
        <button className={`chip ${mode === 'side' ? 'chip-on' : ''}`} onClick={() => setMode('side')}>
          מטען שרשרת צד
        </button>
        <button className={`chip ${mode === 'full' ? 'chip-on' : ''}`} onClick={() => setMode('full')}>
          מטען כולל (+2…−2)
        </button>
      </div>
      {mode === 'full' && (
        <div className="mode-hint">
          המטען הכולל של חומצת אמינו חופשית כולל את קצוות ה-α (אמינו + קרבוקסיל). לכן ב-pH קיצוני
          כל חומצת אמינו טעונה (~+1 סביב pH 0, ~−1 סביב pH 14) — גם אם שרשרת הצד אינה נטענת.
        </div>
      )}

      {/* pH slider */}
      <div className="ph-control">
        <div className="ph-readout">pH = <strong>{pH.toFixed(1)}</strong></div>
        <input className="ph-slider" type="range" min="0" max="14" step="0.1"
          value={pH} onChange={(e) => setPH(parseFloat(e.target.value))} />
        <div className="ph-scale"><span>0 (חומצי)</span><span>7</span><span>14 (בסיסי)</span></div>
      </div>

      {/* live readouts */}
      <div className="charge-readouts">
        <div className={`readout-card net-${netSign}`}>
          <span className="readout-label">מטען נטו (כפפטיד)</span>
          <span className="readout-value">{net >= 0 ? '+' : ''}{net.toFixed(2)}</span>
        </div>
        <div className="readout-card">
          <span className="readout-label">נקודה איזואלקטרית (pI)</span>
          <span className="readout-value">{pI == null ? '—' : pI.toFixed(2)}</span>
        </div>
      </div>
      {chain.length > 0 && Math.abs(net) < 0.05 && (
        <div className="pi-note">⚖️ ב-pH זה המטען הכולל ≈ 0 — קרוב לנקודה האיזואלקטרית</div>
      )}

      {/* the peptide (reads N→C, left to right) */}
      <div className="chain-zone">
        <div className="order-zone-label">הפפטיד שלך — N→C משמאל לימין (לחיצה מסירה אריח)</div>
        {chain.length === 0 ? (
          <div className="order-empty">בחר/י חומצות אמינו מהלוח למטה</div>
        ) : (
          <div className="aa-tile-row chain-row" dir="ltr">
            {chain.map((aa, i) => (
              <Tile key={i} aa={aa} q={tileCharge(aa)} removable onClick={() => removeAt(i)} />
            ))}
          </div>
        )}
        {chain.length > 0 && (
          <button className="link" onClick={() => setChain([])}>נקה הכול</button>
        )}
      </div>

      {/* palette, grouped by family */}
      <div className="palette-zone">
        <div className="order-zone-label">לוח חומצות אמינו (לחיצה מוסיפה לפפטיד)</div>
        {/* family groups laid out 2 on top, 3 below (6-col grid; top spans 3, bottom spans 2) */}
        <div className="aa-family-grid">
          {FAMILIES.map((fam, i) => (
            <div className="aa-family" key={fam.key} style={{ gridColumn: i < 2 ? 'span 3' : 'span 2' }}>
              <div className="aa-family-label">{fam.he}</div>
              <div className="aa-tile-row palette" dir="ltr">
                {AMINO_ACIDS.filter((a) => a.family === fam.key).map((aa) => (
                  <Tile key={aa.one} aa={aa} q={tileCharge(aa)} onClick={() => add(aa)} />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="charge-legend">
          <span><span className="dot dot-pos" /> חיובי</span>
          <span><span className="dot dot-neg" /> שלילי</span>
          <span><span className="dot dot-zero" /> ניטרלי</span>
        </div>
      </div>
    </section>
  )
}
