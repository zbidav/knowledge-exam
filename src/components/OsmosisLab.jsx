import { useState } from 'react'

// Osmosis lab (physiology "live demo"), quantitative version.
// Two compartments, each starting at 1.0 L, split by a membrane permeable to
// water (always) and to "permeable" solute, but NOT to "impermeable" solute.
//
// THE KEY POINT (the classic exam trick):
//   A PERMEABLE solute crosses the membrane and equalizes its concentration on
//   both sides. Equal on both sides => it adds the SAME osmolarity to each side
//   => it does NOT create a net gradient => it does NOT move water.
//   Only the IMPERMEABLE solute drives net water movement — water flows to the
//   side that has more of it.
//
// Model: total water = 2.0 L (1.0 each at start). At equilibrium water moves so
// total osmolarity is equal on both sides. Since permeable solute is already
// equal, only impermeable solute sets the final volumes:
//   V_left / V_right = nImp_left / nImp_right.

const TOTAL_L = 2.0
const DOSE = 1 // osmole-units added per click
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x))

export default function OsmosisLab({ onExit }) {
  const [s, setS] = useState({ impL: 0, impR: 0, permL: 0, permR: 0 })

  const totalImp = s.impL + s.impR
  const totalPerm = s.permL + s.permR

  // Final volume fraction of the left side (%).
  let vLpct = totalImp === 0 ? 50 : (100 * s.impL) / totalImp
  vLpct = clamp(vLpct, 12, 88)
  const vRpct = 100 - vLpct
  const VL = (TOTAL_L * vLpct) / 100
  const VR = TOTAL_L - VL

  // Permeable solute equalizes its CONCENTRATION -> amount ∝ each side's volume.
  const permL_eq = totalPerm * (VL / TOTAL_L)
  const permR_eq = totalPerm - permL_eq
  const permConc = totalPerm / TOTAL_L // equal on both sides (per L)

  // Final osmolarity per side (should match — that's the equilibrium condition).
  const osmL = (s.impL + permL_eq) / VL
  const osmR = (s.impR + permR_eq) / VR

  const add = (key) => setS((p) => ({ ...p, [key]: p[key] + DOSE }))
  const reset = () => setS({ impL: 0, impR: 0, permL: 0, permR: 0 })

  // Explanatory verdict.
  let note = 'הוסף/י חומר מומס לאחד הצדדים וצפה/י מה קורה לנפח.'
  if (totalImp > 0 || totalPerm > 0) {
    const parts = []
    if (totalPerm > 0)
      parts.push(
        `החומר החדיר התאזן ל-${permConc.toFixed(1)} לכל צד — לכן אינו מזיז מים נטו.`,
      )
    if (totalImp === 0)
      parts.push('אין חומר לא-חדיר → אין הפרש אוסמוטי מתמשך → המים נשארים 1.0 ל\' בכל צד.')
    else if (s.impL === s.impR)
      parts.push('כמות החומר הלא-חדיר שווה בשני הצדדים → אין תזוזת מים נטו.')
    else {
      const side = s.impL > s.impR ? 'שמאל' : 'ימין'
      parts.push(`החומר הלא-חדיר מרוכז יותר בצד ${side} → מים זרמו לשם (אוסמוזה).`)
    }
    note = parts.join(' ')
  }

  return (
    <section className="game osmosis-lab">
      <div className="game-head">
        <div>
          <h2>מעבדת אוסמוזה</h2>
          <div className="progress-line">
            קרום חדיר למחצה. כל צד מתחיל ב-1.0 ל'. ראה/י איזה חומר באמת מזיז מים.
          </div>
        </div>
        <button className="link" onClick={onExit}>← למשחקים</button>
      </div>

      <div className="osmo-tank">
        <Compartment vol={vLpct} liters={VL} imp={s.impL} perm={permL_eq} osm={osmL} side="שמאל" />
        <div className="osmo-membrane"><span>קרום חדיר למחצה</span></div>
        <Compartment vol={vRpct} liters={VR} imp={s.impR} perm={permR_eq} osm={osmR} side="ימין" />
      </div>

      <div className="osmo-note">{note}</div>

      {/* numeric ledger */}
      <div className="osmo-ledger">
        <div className="ledger-row ledger-head"><span></span><span>שמאל</span><span>ימין</span></div>
        <div className="ledger-row">
          <span><span className="dot dot-imp" /> לא-חדיר (מזיז מים)</span>
          <span>{s.impL}</span><span>{s.impR}</span>
        </div>
        <div className="ledger-row">
          <span><span className="dot dot-perm" /> חדיר (מתאזן)</span>
          <span>{permL_eq.toFixed(1)}</span><span>{permR_eq.toFixed(1)}</span>
        </div>
        <div className="ledger-row ledger-strong">
          <span>נפח סופי</span>
          <span>{VL.toFixed(2)} ל'</span><span>{VR.toFixed(2)} ל'</span>
        </div>
        <div className="ledger-row">
          <span>אוסמולריות (לכל ל')</span>
          <span>{osmL.toFixed(1)}</span><span>{osmR.toFixed(1)}</span>
        </div>
      </div>

      <div className="osmo-controls">
        <div className="osmo-ctrl-group">
          <span className="osmo-ctrl-label"><span className="dot dot-imp" /> חומר לא-חדיר</span>
          <div className="chip-row">
            <button className="chip" onClick={() => add('impL')}>+ לשמאל</button>
            <button className="chip" onClick={() => add('impR')}>+ לימין</button>
          </div>
        </div>
        <div className="osmo-ctrl-group">
          <span className="osmo-ctrl-label"><span className="dot dot-perm" /> חומר חדיר (P)</span>
          <div className="chip-row">
            <button className="chip" onClick={() => add('permL')}>+ לשמאל</button>
            <button className="chip" onClick={() => add('permR')}>+ לימין</button>
          </div>
        </div>
      </div>

      <p className="osmo-hint">
        💡 טיפ למבחן: כשמוסיפים גם חומר חדיר וגם לא-חדיר — התעלם/י מהחדיר (הוא משתווה בין הצדדים).
        רק החומר הלא-חדיר קובע לאן ובכמה זזים המים. (וזכור/י: מה שקובע הוא מספר החלקיקים/אוסמולים,
        לא המסה ב-mg.)
      </p>

      <div className="results-actions">
        <button className="primary" onClick={reset}>איפוס</button>
        <button className="link" onClick={onExit}>חזרה למשחקים</button>
      </div>
    </section>
  )
}

function Compartment({ vol, liters, imp, perm, osm, side }) {
  const impDots = Math.min(Math.round(imp), 40)
  const permDots = Math.min(Math.round(perm), 40)
  return (
    <div className="osmo-comp">
      <div className="osmo-beaker">
        <div className="osmo-water" style={{ height: `${vol}%` }}>
          <div className="osmo-dots">
            {Array.from({ length: impDots }, (_, i) => <span key={`i${i}`} className="dot dot-imp" />)}
            {Array.from({ length: permDots }, (_, i) => <span key={`p${i}`} className="dot dot-perm" />)}
          </div>
        </div>
      </div>
      <div className="osmo-stats">
        <strong>{side}</strong>
        <span>{liters.toFixed(2)} ל'</span>
        <span>ריכוז: {osm.toFixed(1)}</span>
      </div>
    </div>
  )
}
