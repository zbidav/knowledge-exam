import { useState } from 'react'

// Membrane-potential lab (physiology "live demo").
// Adjust each ion's EXTRACELLULAR concentration; intracellular values are held
// fixed (homeostatically defended by pumps/transporters). It shows each ion's
// Nernst equilibrium potential and the combined resting Vm via the Goldman
// (GHK) equation, plotted on a shared voltage scale.
//
// Physics (37 °C): 2.303·RT/F ≈ 61.5 mV.
//   Nernst: E_ion = (61.5 / z) · log10([out]/[in])
//   Goldman (monovalent K, Na, Cl; Ca excluded — negligible resting permeability
//   and divalent GHK is non-trivial):
//   Vm = 61.5 · log10( (P_K·Ko + P_Na·Nao + P_Cl·Cli) /
//                      (P_K·Ki + P_Na·Nai + P_Cl·Clo) )

const RT_F = 61.5
const log10 = (x) => Math.log10(x)

// Resting relative permeabilities (Hodgkin–Katz, K-dominated).
const PERM = { K: 1, Na: 0.04, Cl: 0.45 }

const IONS = [
  { key: 'K',  he: 'אשלגן',  sym: 'K⁺',  z: 1,  inside: 140,    color: '#8e44ad', min: 1,   max: 10,  step: 0.5, def: 4.5 },
  { key: 'Na', he: 'נתרן',   sym: 'Na⁺', z: 1,  inside: 12,     color: '#e67e22', min: 100, max: 160, step: 1,   def: 145 },
  { key: 'Ca', he: 'סידן',   sym: 'Ca²⁺', z: 2, inside: 0.0001, color: '#27ae60', min: 0.2, max: 3,   step: 0.1, def: 1.2 },
  { key: 'Cl', he: 'כלוריד', sym: 'Cl⁻', z: -1, inside: 10,     color: '#16a085', min: 70,  max: 130, step: 1,   def: 110 },
]
const insideOf = Object.fromEntries(IONS.map((i) => [i.key, i.inside]))

const PRESETS = [
  { label: 'תקין', out: { K: 4.5, Na: 145, Ca: 1.2, Cl: 110 } },
  { label: 'היפרקלמיה (K⁺ גבוה)', out: { K: 8, Na: 145, Ca: 1.2, Cl: 110 } },
  { label: 'היפוקלמיה (K⁺ נמוך)', out: { K: 2, Na: 145, Ca: 1.2, Cl: 110 } },
]

// Map a voltage to a 0–100% position on the scale (−100…+130 mV).
const V_MIN = -100, V_MAX = 130
const vpos = (v) => ((Math.max(V_MIN, Math.min(V_MAX, v)) - V_MIN) / (V_MAX - V_MIN)) * 100

export default function MembranePotentialLab({ onExit }) {
  const [out, setOut] = useState(() => Object.fromEntries(IONS.map((i) => [i.key, i.def])))

  const nernst = (ion) => (RT_F / ion.z) * log10(out[ion.key] / ion.inside)

  // Goldman resting potential (K, Na, Cl).
  const num = PERM.K * out.K + PERM.Na * out.Na + PERM.Cl * insideOf.Cl
  const den = PERM.K * insideOf.K + PERM.Na * insideOf.Na + PERM.Cl * out.Cl
  const Vm = RT_F * log10(num / den)

  const setIon = (k, v) => setOut((o) => ({ ...o, [k]: v }))
  const applyPreset = (p) => setOut({ ...p.out })

  return (
    <section className="game mp-lab">
      <div className="game-head">
        <div>
          <h2>מעבדת פוטנציאל ממברנה</h2>
          <div className="progress-line">
            שנה/י ריכוזים חוץ-תאיים וצפה/י בפוטנציאל שיווי המשקל של כל יון ובפוטנציאל המנוחה (Vm)
          </div>
        </div>
        <button className="link" onClick={onExit}>← למשחקים</button>
      </div>

      {/* resting Vm headline */}
      <div className="vm-headline">
        <span className="vm-label">פוטנציאל מנוחה (Vm)</span>
        <span className="vm-value">{Vm.toFixed(1)} mV</span>
      </div>

      {/* shared voltage scale with E_ion markers + Vm */}
      <div className="v-scale">
        <div className="v-track">
          {IONS.map((ion) => {
            const e = nernst(ion)
            return (
              <span
                key={ion.key}
                className="v-marker"
                style={{ left: `${vpos(e)}%`, color: ion.color }}
                title={`${ion.sym}: ${e.toFixed(0)} mV`}
              >
                <span className="v-tick" style={{ background: ion.color }} />
                <span className="v-tag">{ion.sym}</span>
              </span>
            )
          })}
          <span className="v-marker vm-marker" style={{ left: `${vpos(Vm)}%` }}>
            <span className="v-tick vm-tick" />
            <span className="v-tag vm-tag">Vm</span>
          </span>
        </div>
        <div className="v-axis"><span>−100</span><span>0</span><span>+130 mV</span></div>
      </div>

      {/* presets */}
      <div className="chip-row mp-presets">
        {PRESETS.map((p) => (
          <button key={p.label} className="chip" onClick={() => applyPreset(p)}>{p.label}</button>
        ))}
      </div>

      {/* per-ion controls */}
      <div className="ion-controls">
        {IONS.map((ion) => {
          const e = nernst(ion)
          const inDisplay = ion.key === 'Ca' ? '100 nM' : `${ion.inside} mM`
          return (
            <div className="ion-row" key={ion.key} style={{ borderInlineStartColor: ion.color }}>
              <div className="ion-name" style={{ color: ion.color }}>
                {ion.sym} <span className="ion-he">{ion.he}</span>
              </div>
              <div className="ion-conc">
                <label>
                  בחוץ: <strong>{out[ion.key]}</strong> mM
                  <input
                    type="range" dir="ltr"
                    min={ion.min} max={ion.max} step={ion.step}
                    value={out[ion.key]}
                    style={{ accentColor: ion.color }}
                    onChange={(ev) => setIon(ion.key, parseFloat(ev.target.value))}
                  />
                </label>
                <span className="ion-inside">בפנים: {inDisplay} (קבוע)</span>
              </div>
              <div className="ion-nernst" style={{ color: ion.color }}>
                E = {e.toFixed(0)} mV
              </div>
            </div>
          )
        })}
      </div>

      <p className="mp-note">
        ⚠️ הריכוזים התוך-תאיים מוחזקים קבועים על ידי משאבות (למשל Na⁺/K⁺-ATPase). פוטנציאל
        המנוחה מחושב לפי משוואת גולדמן עבור K⁺, Na⁺ ו-Cl⁻ (ה-Ca²⁺ מוצג כ-Nernst אך תרומתו
        למנוחה זניחה). שים/י לב: K⁺ הוא היון השליט — לכן Vm קרוב ל-E_K.
      </p>

      <div className="results-actions">
        <button className="primary" onClick={() => applyPreset(PRESETS[0])}>איפוס לערכים תקינים</button>
        <button className="link" onClick={onExit}>חזרה למשחקים</button>
      </div>
    </section>
  )
}
