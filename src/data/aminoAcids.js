// aminoAcids.js
// -----------------------------------------------------------------------------
// The 20 standard amino acids in all three naming forms (full / 3-letter /
// 1-letter), Hebrew name, polarity class, and ionizable side-chain pKa. Used by
// the abbreviation game and the pH/charge lab. pKa values follow Lehninger
// (representative textbook values; exact numbers vary slightly by source).
// -----------------------------------------------------------------------------

// type:   charge behavior — 'nonpolar' | 'polar' | 'aromatic' | 'acidic' | 'basic'
//         (acidic side chains go NEGATIVE when deprotonated; basic go POSITIVE when protonated).
// family: grouping for the palette — 'aliphatic' | 'aromatic' | 'polar' | 'acidic' | 'basic'
//         (decoupled from `type`: e.g. Cys/Tyr ionize as acids but group as polar/aromatic).
// sidePka: side-chain pKa (null if the side chain doesn't ionize).
export const AMINO_ACIDS = [
  { one: 'A', three: 'Ala', en: 'Alanine',       he: 'אלנין',      type: 'nonpolar', family: 'aliphatic', sidePka: null },
  { one: 'R', three: 'Arg', en: 'Arginine',      he: 'ארגינין',    type: 'basic',    family: 'basic',     sidePka: 12.5 },
  { one: 'N', three: 'Asn', en: 'Asparagine',    he: 'אספרגין',    type: 'polar',    family: 'polar',     sidePka: null },
  { one: 'D', three: 'Asp', en: 'Aspartate',     he: 'אספרטט',     type: 'acidic',   family: 'acidic',    sidePka: 3.65 },
  { one: 'C', three: 'Cys', en: 'Cysteine',      he: 'ציסטאין',    type: 'acidic',   family: 'polar',     sidePka: 8.3 },
  { one: 'Q', three: 'Gln', en: 'Glutamine',     he: 'גלוטמין',    type: 'polar',    family: 'polar',     sidePka: null },
  { one: 'E', three: 'Glu', en: 'Glutamate',     he: 'גלוטמט',     type: 'acidic',   family: 'acidic',    sidePka: 4.25 },
  { one: 'G', three: 'Gly', en: 'Glycine',       he: 'גליצין',     type: 'nonpolar', family: 'aliphatic', sidePka: null },
  { one: 'H', three: 'His', en: 'Histidine',     he: 'היסטידין',   type: 'basic',    family: 'basic',     sidePka: 6.0 },
  { one: 'I', three: 'Ile', en: 'Isoleucine',    he: 'איזולאוצין', type: 'nonpolar', family: 'aliphatic', sidePka: null },
  { one: 'L', three: 'Leu', en: 'Leucine',       he: 'לאוצין',     type: 'nonpolar', family: 'aliphatic', sidePka: null },
  { one: 'K', three: 'Lys', en: 'Lysine',        he: 'ליזין',      type: 'basic',    family: 'basic',     sidePka: 10.5 },
  { one: 'M', three: 'Met', en: 'Methionine',    he: 'מתיונין',    type: 'nonpolar', family: 'aliphatic', sidePka: null },
  { one: 'F', three: 'Phe', en: 'Phenylalanine', he: 'פנילאלנין',  type: 'aromatic', family: 'aromatic',  sidePka: null },
  { one: 'P', three: 'Pro', en: 'Proline',       he: 'פרולין',     type: 'nonpolar', family: 'aliphatic', sidePka: null },
  { one: 'S', three: 'Ser', en: 'Serine',        he: 'סרין',       type: 'polar',    family: 'polar',     sidePka: null },
  { one: 'T', three: 'Thr', en: 'Threonine',     he: 'תראונין',    type: 'polar',    family: 'polar',     sidePka: null },
  { one: 'W', three: 'Trp', en: 'Tryptophan',    he: 'טריפטופן',   type: 'aromatic', family: 'aromatic',  sidePka: null },
  { one: 'Y', three: 'Tyr', en: 'Tyrosine',      he: 'טירוזין',    type: 'acidic',   family: 'aromatic',  sidePka: 10.07 },
  { one: 'V', three: 'Val', en: 'Valine',        he: 'ולין',       type: 'nonpolar', family: 'aliphatic', sidePka: null },
]

// Family display order + Hebrew labels (for the palette grouping).
export const FAMILIES = [
  { key: 'aliphatic', he: 'לא-קוטביות (אליפטיות)' },
  { key: 'aromatic',  he: 'ארומטיות' },
  { key: 'polar',     he: 'קוטביות ללא מטען' },
  { key: 'acidic',    he: 'חומציות (−)' },
  { key: 'basic',     he: 'בסיסיות (+)' },
]

export const byOne = Object.fromEntries(AMINO_ACIDS.map((a) => [a.one, a]))

// --- charge model (Henderson–Hasselbalch) -----------------------------------
// alpha-carboxyl and alpha-amino pKa for the chain termini (free amino acid).
const C_TERM_PKA = 2.3 // -COOH  -> negative when deprotonated
const N_TERM_PKA = 9.6 // -NH3+  -> positive when protonated

// Fractional charge of an acidic group (max -1) at a given pH.
const acidicCharge = (pKa, pH) => -1 / (1 + Math.pow(10, pKa - pH))
// Fractional charge of a basic group (max +1) at a given pH.
const basicCharge = (pKa, pH) => 1 / (1 + Math.pow(10, pH - pKa))

// Charge contributed by ONE residue's side chain at a given pH (0 if non-ionizable).
export function sideChainCharge(aa, pH) {
  if (aa.sidePka == null) return 0
  return aa.type === 'acidic' ? acidicCharge(aa.sidePka, pH) : basicCharge(aa.sidePka, pH)
}

// FULL net charge of a single FREE amino acid at a given pH: its own α-amino (+)
// and α-carboxyl (−) termini PLUS its side chain. Ranges roughly +2…−2. (At
// extreme pH the termini dominate: ~+1 near pH 0, ~−1 near pH 14, even for
// non-ionizable side chains.)
export function freeAminoAcidCharge(aa, pH) {
  return basicCharge(N_TERM_PKA, pH) + acidicCharge(C_TERM_PKA, pH) + sideChainCharge(aa, pH)
}

// Charge of a residue WITHIN a peptide. Only the first residue carries the free
// α-amino group and only the last carries the free α-carboxyl; internal residues
// have both locked in peptide bonds, so ONLY their side chain counts. (A single
// residue, isFirst && isLast, reduces to the free amino acid.)
export function peptideResidueCharge(aa, pH, isFirst, isLast) {
  let q = sideChainCharge(aa, pH)
  if (isFirst) q += basicCharge(N_TERM_PKA, pH)
  if (isLast) q += acidicCharge(C_TERM_PKA, pH)
  return q
}

// Net charge of the residues treated as ONE peptide chain: every side chain plus
// a single free N-terminus (+) and C-terminus (−). For a single residue this
// equals the net charge of the free amino acid.
export function peptideNetCharge(residues, pH) {
  if (residues.length === 0) return 0
  let q = basicCharge(N_TERM_PKA, pH) + acidicCharge(C_TERM_PKA, pH)
  for (const aa of residues) q += sideChainCharge(aa, pH)
  return q
}

// Estimate the isoelectric point (pH where net charge ≈ 0) by scanning 0–14.
export function isoelectricPoint(residues) {
  if (residues.length === 0) return null
  let lo = 0, hi = 14
  // net charge is monotonically decreasing in pH, so bisect.
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2
    if (peptideNetCharge(residues, mid) > 0) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}
