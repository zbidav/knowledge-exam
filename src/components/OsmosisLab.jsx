import { useState } from 'react'

// Osmosis lab (physiology "live demo").
// Two compartments split by a membrane permeable to water (always) and to
// "permeable" solute, but NOT to "impermeable" solute. We render the EQUILIBRIUM
// state directly (water height animates), so the lesson is visible:
//   - impermeable solute  -> water flows toward the side that has more of it
//                            (osmosis); that side swells, the other shrinks.
//   - permeable solute    -> it diffuses across until equal on both sides;
//                            no sustained net water shift.
//
// Model: total water = 100 units, initially 50/50. At equilibrium water moves so
// total osmolarity is equal on both sides. Permeable solute equalizes its own
// concentration (it can cross), so only IMPERMEABLE solute drives a net shift:
//   V_left / V_right = nImp_left / nImp_right.

const ADD = 6 // units added per click
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x))

export default function OsmosisLab({ onExit }) {
  const [s, setS] = useState({ impL: 0, impR: 0, permL: 0, permR: 0 })

  const totalImp = s.impL + s.impR
  const totalPerm = s.permL + s.permR

  // Equilibrium volumes (% of total water).
  let vL = totalImp === 0 ? 50 : (100 * s.impL) / totalImp
  vL = clamp(vL, 12, 88)
  const vR = 100 - vL

  // Permeable solute spreads to equal concentration -> amount ∝ volume.
  const permL_eq = totalPerm * (vL / 100)
  const permR_eq = totalPerm - permL_eq

  // Osmolarity per side (impermeable is fixed on its side; permeable is equalized).
  const osmL = (s.impL + permL_eq) / vL
  const osmR = (s.impR + permR_eq) / vR

  const add = (key) => setS((p) => ({ ...p, [key]: p[key] + ADD }))
  const reset = () => setS({ impL: 0, impR: 0, permL: 0, permR: 0 })

  let note = 'הוסף/י חומר מומס לאחד הצדדים וצפה/י מה קורה.'
  if (totalImp > 0) {
    const side = s.impL > s.impR ? 'שמאל' : s.impR > s.impL ? 'ימין' : 'שני הצדדים שווה'
    note =
      s.impL === s.impR
        ? '⚖️ כמות החומר הלא-חדיר שווה — אין תזוזת מים נטו.'
        : `💧 מים זרמו לצד ${side} — לשם נמשכים המים כי שם ריכוז החומר הלא-חדיר גבוה יותר (אוסמוזה).`
  } else if (totalPerm > 0) {
    note =
      '↔️ חומר חדיר בלבד: הוא מתפזר דרך הקרום עד שריכוזו שווה משני הצדדים — אין תזוזת מים נטו.'
  }

  return (
    <section className="game osmosis-lab">
      <div className="game-head">
        <div>
          <h2>מעבדת אוסמוזה</h2>
          <div className="progress-line">
            קרום חדיר למחצה: מים וחומר חדיר עוברים, חומר לא-חדיר לא. ראה/י מתי מים זזים.
          </div>
        </div>
        <button className="link" onClick={onExit}>← למשחקים</button>
      </div>

      {/* the two compartments */}
      <div className="osmo-tank">
        <Compartment vol={vL} imp={s.impL} perm={permL_eq} osm={osmL} side="שמאל" />
        <div className="osmo-membrane"><span>קרום חדיר למחצה</span></div>
        <Compartment vol={vR} imp={s.impR} perm={permR_eq} osm={osmR} side="ימין" />
      </div>

      <div className="osmo-note">{note}</div>

      {/* controls */}
      <div className="osmo-controls">
        <div className="osmo-ctrl-group">
          <span className="osmo-ctrl-label">
            <span className="dot dot-imp" /> חומר לא-חדיר (לא עובר קרום)
          </span>
          <div className="chip-row">
            <button className="chip" onClick={() => add('impL')}>+ לשמאל</button>
            <button className="chip" onClick={() => add('impR')}>+ לימין</button>
          </div>
        </div>
        <div className="osmo-ctrl-group">
          <span className="osmo-ctrl-label">
            <span className="dot dot-perm" /> חומר חדיר (עובר קרום)
          </span>
          <div className="chip-row">
            <button className="chip" onClick={() => add('permL')}>+ לשמאל</button>
            <button className="chip" onClick={() => add('permR')}>+ לימין</button>
          </div>
        </div>
      </div>

      <div className="results-actions">
        <button className="primary" onClick={reset}>איפוס</button>
        <button className="link" onClick={onExit}>חזרה למשחקים</button>
      </div>
    </section>
  )
}

function Compartment({ vol, imp, perm, osm, side }) {
  // Render solute as dots inside the water region. Cap dot count for sanity.
  const impDots = Math.min(Math.round(imp), 40)
  const permDots = Math.min(Math.round(perm), 40)
  return (
    <div className="osmo-comp">
      <div className="osmo-beaker">
        <div className="osmo-water" style={{ height: `${vol}%` }}>
          <div className="osmo-dots">
            {Array.from({ length: impDots }, (_, i) => (
              <span key={`i${i}`} className="dot dot-imp" />
            ))}
            {Array.from({ length: permDots }, (_, i) => (
              <span key={`p${i}`} className="dot dot-perm" />
            ))}
          </div>
        </div>
      </div>
      <div className="osmo-stats">
        <strong>{side}</strong>
        <span>נפח: {Math.round(vol)}%</span>
        <span>ריכוז כולל: {osm.toFixed(2)}</span>
      </div>
    </div>
  )
}
