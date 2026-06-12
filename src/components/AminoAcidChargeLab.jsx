import { useState } from 'react'
import {
  AMINO_ACIDS,
  sideChainCharge,
  peptideNetCharge,
  isoelectricPoint,
} from '../data/aminoAcids.js'

// Interactive pH / charge lab (a "live demo" game).
// Drag the pH slider; each amino-acid tile is colored by its SIDE-CHAIN charge at
// that pH (blue = +, red = −, grey = neutral). Build a peptide by clicking the
// palette; the net charge and estimated pI of the whole chain update live.

// Map a charge value (−1..+1) to a tile background + border.
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

function Tile({ aa, pH, onClick, removable }) {
  const q = sideChainCharge(aa, pH)
  const sign = q > 0.05 ? '+' : q < -0.05 ? '−' : '0'
  return (
    <button
      className={`aa-tile ${removable ? 'aa-tile-removable' : ''}`}
      style={chargeStyle(q)}
      onClick={onClick}
      title={`${aa.he} (${aa.en}) · מטען שרשרת צד: ${q.toFixed(2)}`}
    >
      <span className="aa-tile-three">{aa.three}</span>
      <span className="aa-tile-one">{aa.one}</span>
      <span className="aa-tile-charge">{sign}</span>
    </button>
  )
}

export default function AminoAcidChargeLab({ onExit }) {
  const [pH, setPH] = useState(7.0)
  const [chain, setChain] = useState([]) // array of amino-acid objects

  const net = peptideNetCharge(chain, pH)
  const pI = isoelectricPoint(chain)
  const netSign = net > 0.05 ? 'pos' : net < -0.05 ? 'neg' : 'zero'

  function add(aa) {
    setChain((c) => [...c, aa])
  }
  function removeAt(idx) {
    setChain((c) => c.filter((_, i) => i !== idx))
  }

  return (
    <section className="game aa-charge">
      <div className="game-head">
        <div>
          <h2>מעבדת מטען ו-pH</h2>
          <div className="progress-line">
            הזז/י את סקאלת ה-pH וצפה/י כיצד משתנים המטענים. הוסף/י חומצות אמינו לבניית פפטיד.
          </div>
        </div>
        <button className="link" onClick={onExit}>← למשחקים</button>
      </div>

      {/* pH slider */}
      <div className="ph-control">
        <div className="ph-readout">pH = <strong>{pH.toFixed(1)}</strong></div>
        <input
          className="ph-slider"
          type="range"
          min="0"
          max="14"
          step="0.1"
          value={pH}
          onChange={(e) => setPH(parseFloat(e.target.value))}
        />
        <div className="ph-scale">
          <span>0 (חומצי)</span><span>7</span><span>14 (בסיסי)</span>
        </div>
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

      {/* the peptide being built */}
      <div className="chain-zone">
        <div className="order-zone-label">הפפטיד שלך (לחיצה על אריח מסירה אותו)</div>
        {chain.length === 0 ? (
          <div className="order-empty">בחר/י חומצות אמינו מהלוח למטה</div>
        ) : (
          <div className="aa-tile-row">
            {chain.map((aa, i) => (
              <Tile key={i} aa={aa} pH={pH} removable onClick={() => removeAt(i)} />
            ))}
          </div>
        )}
        {chain.length > 0 && (
          <button className="link" onClick={() => setChain([])}>נקה הכול</button>
        )}
      </div>

      {/* palette */}
      <div className="palette-zone">
        <div className="order-zone-label">לוח חומצות אמינו (לחיצה מוסיפה לפפטיד)</div>
        <div className="aa-tile-row palette">
          {AMINO_ACIDS.map((aa) => (
            <Tile key={aa.one} aa={aa} pH={pH} onClick={() => add(aa)} />
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
