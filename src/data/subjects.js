// The four exam subjects. The `key` MUST match the folder name under content/
// and the `subject="..."` attribute inside each XML file. `he` is the Hebrew
// label shown in the UI; `color` is just an accent for the subject card.
export const SUBJECTS = [
  { key: 'biochemistry',      he: 'ביוכימיה',          en: 'Biochemistry',      color: '#c0392b' },
  { key: 'molecular-biology', he: 'ביולוגיה מולקולרית', en: 'Molecular Biology', color: '#2980b9' },
  { key: 'cell-biology',      he: 'ביולוגיה של התא',    en: 'Cell Biology',      color: '#27ae60' },
  { key: 'physiology',        he: 'פיזיולוגיה',         en: 'Physiology',        color: '#8e44ad' },
]

// Lookup helper: subject key -> metadata object.
export const subjectByKey = Object.fromEntries(SUBJECTS.map((s) => [s.key, s]))
