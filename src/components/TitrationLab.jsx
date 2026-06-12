import { useState } from 'react'

// Titration lab (biochemistry "live demo").
// Pick a biological buffer; see its titration curve (pH vs equivalents of strong
// base added), the buffering region around each pKa, and the physiological pH
// 7.4 line. A slider adds base and shows the current pH + whether you're inside a
// buffering zone (where the buffer resists pH change).
//
// Model: for a polyprotic acid, the equivalents of OH⁻ added at a given pH is the
// sum over ionizable groups of the deprotonated fraction:
//   eq(pH) = Σ_i 1 / (1 + 10^(pKa_i − pH))
// This is monotonic in pH, so sweeping pH traces the whole curve and each pKa
// produces a flat (buffering) plateau.

const BUFFERS = [
  { key: 'phosphate',   he: 'פוספט', en: 'Phosphate',        pKas: [2.15, 7.20, 12.35] },
  { key: 'bicarbonate', he: 'ביקרבונט', en: 'Bicarbonate',   pKas: [6.10] },
  { key: 'acetate',     he: 'אצטט', en: 'Acetate',           pKas: [4.76] },
  { key: 'citrate',     he: 'ציטרט', en: 'Citrate',          pKas: [3.13, 4.76, 6.40] },
  { key: 'glycine',     he: 'גליצין', en: 'Glycine',         pKas: [2.34, 9.60] },
  { key: 'histidine',   he: 'היסטידין', en: 'Histidine',     pKas: [1.82, 6.00, 9.17] },
  { key: 'hepes',       he: 'HEPES', en: 'HEPES',            pKas: [7.50] },
  { key: 'tris',        he: 'Tris', en: 'Tris',              pKas: [8.06] },
]
const PHYS_PH = 7.4

const eqAtPH = (pKas, pH) => pKas.reduce((s, p) => s + 1 / (1 + Math.pow(10, p - pH)), 0)

// Invert eq(pH) = target by bisection (monotonic increasing).
function phForEq(pKas, target) {
  let lo = -1, hi = 15
  for (let i = 0; i < 50; i++) {
    const mid = (lo + hi) / 2
    if (eqAtPH(pKas, mid) < target) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}

// SVG plot geometry.
const W = 320, H = 260, M = { l: 34, r: 12, t: 12, b: 26 }
const PW = W - M.l - M.r, PH = H - M.t - M.b

export default function TitrationLab({ onExit }) {
  const [key, setKey] = useState('phosphate')
  const buf = BUFFERS.find((b) => b.key === key)
  const nMax = buf.pKas.length
  const [eq, setEq] = useState(nMax / 2) // equivalents of base added

  const x = (e) => M.l + (e / nMax) * PW // equivalents -> px
  const y = (pH) => M.t + (1 - pH / 14) * PH // pH (0..14) -> py

  // Curve points (sweep pH, compute equivalents).
  const pts = []
  for (let pH = 0; pH <= 14.0001; pH += 0.05) pts.push(`${x(eqAtPH(buf.pKas, pH)).toFixed(1)},${y(pH).toFixed(1)}`)
  const curve = pts.join(' ')

  const curPH = phForEq(buf.pKas, eq)
  const nearest = buf.pKas.reduce((a, p) => (Math.abs(p - curPH) < Math.abs(a - curPH) ? p : a), buf.pKas[0])
  const inBuffer = Math.abs(curPH - nearest) <= 1
  const physicalBuffers = buf.pKas.some((p) => Math.abs(p - PHYS_PH) <= 1)

  return (
    <section className="game titration-lab">
      <div className="game-head">
        <div>
          <h2>מעבדת טיטרציה ובופרים</h2>
          <div className="progress-line">בחר/י בופר ביולוגי, הוסף/י בסיס וצפה/י בעקומת הטיטרציה ובאזורי הבופר</div>
        </div>
        <button className="link" onClick={onExit}>← למשחקים</button>
      </div>

      <div className="chip-row buf-chips">
        {BUFFERS.map((b) => (
          <button key={b.key} className={`chip ${key === b.key ? 'chip-on' : ''}`}
            onClick={() => { setKey(b.key); setEq(b.pKas.length / 2) }}>
            {b.he}
          </button>
        ))}
      </div>

      <svg className="titration-plot" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="עקומת טיטרציה">
        {/* buffering regions (pKa ± 1) */}
        {buf.pKas.map((p, i) => (
          <rect key={`b${i}`} x={M.l} y={y(Math.min(14, p + 1))}
            width={PW} height={Math.abs(y(Math.max(0, p - 1)) - y(Math.min(14, p + 1)))}
            className="tit-buffer-zone" />
        ))}
        {/* axes */}
        <line x1={M.l} y1={M.t} x2={M.l} y2={M.t + PH} className="tit-axis" />
        <line x1={M.l} y1={M.t + PH} x2={M.l + PW} y2={M.t + PH} className="tit-axis" />
        {[0, 7, 14].map((p) => (
          <g key={`yl${p}`}>
            <text x={M.l - 6} y={y(p) + 3} textAnchor="end" className="tit-tick">{p}</text>
          </g>
        ))}
        {/* physiological pH line */}
        <line x1={M.l} y1={y(PHYS_PH)} x2={M.l + PW} y2={y(PHYS_PH)} className="tit-phys" />
        <text x={M.l + PW} y={y(PHYS_PH) - 3} textAnchor="end" className="tit-phys-label">pH 7.4</text>
        {/* pKa markers */}
        {buf.pKas.map((p, i) => (
          <text key={`k${i}`} x={M.l + 3} y={y(p) - 2} className="tit-pka">pKa {p}</text>
        ))}
        {/* the curve */}
        <polyline points={curve} className="tit-curve" />
        {/* current point */}
        <circle cx={x(eq)} cy={y(curPH)} r="5" className="tit-point" />
        {/* axis labels */}
        <text x={M.l + PW / 2} y={H - 4} textAnchor="middle" className="tit-axislabel">← בסיס שנוסף (שווה-ערכים)</text>
        <text x={10} y={M.t + PH / 2} className="tit-axislabel" transform={`rotate(-90 10 ${M.t + PH / 2})`} textAnchor="middle">pH</text>
      </svg>

      <div className="tit-readout">
        <div className={`readout-card ${inBuffer ? 'net-zero' : ''}`}>
          <span className="readout-label">pH נוכחי</span>
          <span className="readout-value">{curPH.toFixed(2)}</span>
        </div>
        <div className="tit-status">
          {inBuffer
            ? `✅ באזור בופר (קרוב ל-pKa ${nearest}) — הבופר מתנגד לשינוי pH`
            : '⚠️ מחוץ לאזור בופר — שינוי קטן בבסיס משנה הרבה את ה-pH'}
        </div>
      </div>

      <label className="tit-slider">
        <span>בסיס שנוסף: <strong>{eq.toFixed(2)}</strong> שווה-ערכים</span>
        <input type="range" dir="ltr" min="0.02" max={nMax - 0.02} step="0.01"
          value={eq} onChange={(e) => setEq(parseFloat(e.target.value))} />
      </label>

      <p className="tit-note">
        <strong>{buf.he} ({buf.en})</strong> · pKa: {buf.pKas.join(', ')}.{' '}
        {physicalBuffers
          ? 'בעל pKa קרוב ל-7.4 — בופר פיזיולוגי יעיל (כמו פוספט וביקרבונט בגוף).'
          : 'אין לו pKa קרוב ל-7.4 — פחות יעיל כבופר בדם, אך שימושי בתחומי pH אחרים.'}{' '}
        אזור הבופר היעיל הוא pKa ± 1 (מוצל בגרף).
      </p>

      <div className="results-actions">
        <button className="link" onClick={onExit}>חזרה למשחקים</button>
      </div>
    </section>
  )
}
