import { useState } from 'react'

// Membrane-potential lab (physiology "live demo").
// Adjust BOTH intracellular and extracellular concentrations for each ion. Shows
// per-ion Nernst potentials, the resting Vm (Goldman), the electrochemical
// driving force on each ion (which way it's pushed, drawn on a simple cell
// diagram), and the firing threshold — so cases like hyperkalemia become visible.
//
// Physics (37 °C): 2.303·RT/F ≈ 61.5 mV.
//   Nernst:  E_ion = (61.5 / z) · log10([out]/[in])
//   Goldman: Vm = 61.5 · log10( (P_K·Ko + P_Na·Nao + P_Cl·Cli) /
//                               (P_K·Ki + P_Na·Nai + P_Cl·Clo) )
//   Driving force DF = Vm − E_ion. Cation: DF>0 → efflux (out), DF<0 → influx.
//   Anion (Cl): the direction flips.

const RT_F = 61.5
const log10 = (x) => Math.log10(x)
const PERM = { K: 1, Na: 0.04, Cl: 0.45 } // resting relative permeabilities
const THRESHOLD = -55 // approximate firing threshold, mV

// Each ion: separate out/in slider configs. Ca's tiny intracellular value is
// entered in nM (converted to mM for the math).
const IONS = [
  { key: 'K',  he: 'אשלגן',  sym: 'K⁺',  z: 1,  color: '#8e44ad',
    out: { min: 1, max: 10, step: 0.5, def: 4.5, unit: 'mM' },
    in:  { min: 100, max: 160, step: 1, def: 140, unit: 'mM' } },
  { key: 'Na', he: 'נתרן',   sym: 'Na⁺', z: 1,  color: '#e67e22',
    out: { min: 100, max: 160, step: 1, def: 145, unit: 'mM' },
    in:  { min: 5, max: 30, step: 1, def: 12, unit: 'mM' } },
  { key: 'Ca', he: 'סידן',   sym: 'Ca²⁺', z: 2, color: '#27ae60',
    out: { min: 0.2, max: 3, step: 0.1, def: 1.2, unit: 'mM' },
    in:  { min: 50, max: 1000, step: 10, def: 100, unit: 'nM' } },
  { key: 'Cl', he: 'כלוריד', sym: 'Cl⁻', z: -1, color: '#16a085',
    out: { min: 70, max: 130, step: 1, def: 110, unit: 'mM' },
    in:  { min: 3, max: 40, step: 1, def: 10, unit: 'mM' } },
]
const ionByKey = Object.fromEntries(IONS.map((i) => [i.key, i]))
const toMM = (cfg, v) => v * (cfg.unit === 'nM' ? 1e-6 : 1)

const normalConc = () =>
  Object.fromEntries(IONS.map((i) => [i.key, { out: i.out.def, in: i.in.def }]))

const PRESETS = [
  { label: 'תקין', set: {} },
  { label: 'היפרקלמיה (K⁺ חוץ ↑)', set: { K: { out: 8 } } },
  { label: 'היפוקלמיה (K⁺ חוץ ↓)', set: { K: { out: 2 } } },
]

const V_MIN = -100, V_MAX = 130
const vpos = (v) => ((Math.max(V_MIN, Math.min(V_MAX, v)) - V_MIN) / (V_MAX - V_MIN)) * 100

export default function MembranePotentialLab({ onExit }) {
  const [conc, setConc] = useState(normalConc)

  const mmOut = (k) => toMM(ionByKey[k].out, conc[k].out)
  const mmIn = (k) => toMM(ionByKey[k].in, conc[k].in)
  const nernst = (ion) => (RT_F / ion.z) * log10(mmOut(ion.key) / mmIn(ion.key))

  const num = PERM.K * mmOut('K') + PERM.Na * mmOut('Na') + PERM.Cl * mmIn('Cl')
  const den = PERM.K * mmIn('K') + PERM.Na * mmIn('Na') + PERM.Cl * mmOut('Cl')
  const Vm = RT_F * log10(num / den)

  // Driving force & flux direction for an ion at the current Vm.
  const flux = (ion) => {
    const E = nernst(ion)
    const df = Vm - E
    const dir = ion.z > 0 ? (df > 0 ? 'out' : 'in') : df > 0 ? 'in' : 'out'
    return { E, df, dir, mag: Math.abs(df) }
  }

  const setVal = (k, side, v) => setConc((c) => ({ ...c, [k]: { ...c[k], [side]: v } }))
  const resetIon = (k) => setConc((c) => ({ ...c, [k]: { out: ionByKey[k].out.def, in: ionByKey[k].in.def } }))
  const applyPreset = (p) => {
    const base = normalConc()
    for (const [k, ov] of Object.entries(p.set)) base[k] = { ...base[k], ...ov }
    setConc(base)
  }

  const aboveThreshold = Vm >= THRESHOLD

  return (
    <section className="game mp-lab">
      <div className="game-head">
        <div>
          <h2>מעבדת פוטנציאל ממברנה</h2>
          <div className="progress-line">
            שלוט/י בריכוזים בפנים ובחוץ; צפה/י בפוטנציאל שיווי-המשקל של כל יון, בכוח המניע ובפוטנציאל המנוחה
          </div>
        </div>
        <button className="link" onClick={onExit}>← למשחקים</button>
      </div>

      <div className="mp-top">
        <CellDiagram ions={IONS} flux={flux} />
        <div className="mp-top-right">
          <div className="vm-headline">
            <span className="vm-label">פוטנציאל מנוחה (Vm)</span>
            <span className="vm-value">{Vm.toFixed(1)} mV</span>
            <span className={`vm-thresh ${aboveThreshold ? 'over' : ''}`}>
              סף ירי ≈ {THRESHOLD} mV — {aboveThreshold ? '⚡ מעל הסף!' : `${(THRESHOLD - Vm).toFixed(0)} mV מתחת לסף`}
            </span>
          </div>

          {/* voltage scale with E_ion markers, threshold, and Vm */}
          <div className="v-scale">
            <div className="v-track">
              {IONS.map((ion) => {
                const e = nernst(ion)
                return (
                  <span key={ion.key} className="v-marker" style={{ left: `${vpos(e)}%`, color: ion.color }} title={`${ion.sym}: ${e.toFixed(0)} mV`}>
                    <span className="v-tick" style={{ background: ion.color }} />
                    <span className="v-tag">{ion.sym}</span>
                  </span>
                )
              })}
              <span className="v-marker thr-marker" style={{ left: `${vpos(THRESHOLD)}%` }}>
                <span className="v-tick thr-tick" />
                <span className="v-tag thr-tag">סף</span>
              </span>
              <span className="v-marker vm-marker" style={{ left: `${vpos(Vm)}%` }}>
                <span className="v-tick vm-tick" />
                <span className="v-tag vm-tag">Vm</span>
              </span>
            </div>
            <div className="v-axis"><span>−100</span><span>0</span><span>+130 mV</span></div>
          </div>
        </div>
      </div>

      <div className="chip-row mp-presets">
        {PRESETS.map((p) => (
          <button key={p.label} className="chip" onClick={() => applyPreset(p)}>{p.label}</button>
        ))}
      </div>

      <div className="ion-controls">
        {IONS.map((ion) => {
          const f = flux(ion)
          const arrow = f.dir === 'in' ? '⬇ פנימה' : '⬆ החוצה'
          return (
            <div className="ion-row2" key={ion.key} style={{ borderInlineStartColor: ion.color }}>
              <div className="ion-head">
                <span className="ion-name" style={{ color: ion.color }}>
                  {ion.sym} <span className="ion-he">{ion.he}</span>
                </span>
                <button className="ion-reset" onClick={() => resetIon(ion.key)} title="חזרה לערך תקין">↺ נורמה</button>
              </div>
              <div className="ion-sliders">
                <label className="ion-slider">
                  <span>בחוץ: <strong>{conc[ion.key].out}</strong> {ion.out.unit}</span>
                  <input type="range" dir="ltr" min={ion.out.min} max={ion.out.max} step={ion.out.step}
                    value={conc[ion.key].out} style={{ accentColor: ion.color }}
                    onChange={(e) => setVal(ion.key, 'out', parseFloat(e.target.value))} />
                </label>
                <label className="ion-slider">
                  <span>בפנים: <strong>{conc[ion.key].in}</strong> {ion.in.unit}</span>
                  <input type="range" dir="ltr" min={ion.in.min} max={ion.in.max} step={ion.in.step}
                    value={conc[ion.key].in} style={{ accentColor: ion.color }}
                    onChange={(e) => setVal(ion.key, 'in', parseFloat(e.target.value))} />
                </label>
              </div>
              <div className="ion-out">
                <span className="ion-nernst" style={{ color: ion.color }}>E = {f.E.toFixed(0)} mV</span>
                <span className="ion-drive">כוח מניע: {arrow}</span>
              </div>
            </div>
          )
        })}
      </div>

      <p className="mp-note">
        ⚠️ פוטנציאל המנוחה מחושב לפי גולדמן עבור K⁺, Na⁺ ו-Cl⁻ (Ca²⁺ מוצג כ-Nernst בלבד). החצים מראים
        לאן כל יון "נדחף" ב-Vm הנוכחי (כוח מניע = Vm − E). דוגמה: בהיפרקלמיה ה-K⁺ בחוץ עולה → E_K עולה →
        Vm מתקרב לסף; בהתחלה התא נרגש יותר, ואז תעלות ה-Na⁺ עוברות אינאקטיבציה והתא נעשה פחות נרגש.
      </p>

      <div className="results-actions">
        <button className="primary" onClick={() => setConc(normalConc())}>איפוס מלא לערכים תקינים</button>
        <button className="link" onClick={onExit}>חזרה למשחקים</button>
      </div>
    </section>
  )
}

// Simple schematic: a circle = the cell. Each ion sits at a compass position with
// an arrow across the membrane showing which way it's driven and how strongly.
function CellDiagram({ ions, flux }) {
  const cx = 150, cy = 150, R = 88
  const angles = { K: -90, Na: 0, Ca: 90, Cl: 180 } // top / right / bottom / left
  return (
    <svg className="cell-diagram" viewBox="0 0 300 300" role="img" aria-label="תרשים תא">
      <defs>
        {ions.map((ion) => (
          <marker key={ion.key} id={`ah-${ion.key}`} markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill={ion.color} />
          </marker>
        ))}
      </defs>
      {/* extracellular label + cell */}
      <text x="150" y="16" textAnchor="middle" className="cd-label">חוץ-תאי</text>
      <circle cx={cx} cy={cy} r={R} className="cd-cell" />
      <text x={cx} y={cy + 4} textAnchor="middle" className="cd-inside">תוך-תאי</text>

      {ions.map((ion) => {
        const f = flux(ion)
        const a = (angles[ion.key] * Math.PI) / 180
        const ux = Math.cos(a), uy = Math.sin(a)
        // arrow spans from just outside to just inside the membrane
        const rOut = R + 28, rIn = R - 28
        const pOut = [cx + ux * rOut, cy + uy * rOut]
        const pIn = [cx + ux * rIn, cy + uy * rIn]
        const [from, to] = f.dir === 'in' ? [pOut, pIn] : [pIn, pOut]
        const w = 1.5 + Math.min(f.mag / 25, 4) // thicker = stronger drive
        const lx = cx + ux * (R + 22), ly = cy + uy * (R + 22)
        return (
          <g key={ion.key}>
            <line x1={from[0]} y1={from[1]} x2={to[0]} y2={to[1]}
              stroke={ion.color} strokeWidth={w} markerEnd={`url(#ah-${ion.key})`} opacity="0.9" />
            <text x={lx} y={ly} textAnchor="middle" className="cd-ion" fill={ion.color}>{ion.sym}</text>
          </g>
        )
      })}
    </svg>
  )
}
