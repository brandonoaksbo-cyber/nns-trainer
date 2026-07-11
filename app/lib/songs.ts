// Song library — the spine of v2.
//
// Legal note: chord progressions, song titles, artist names, and keys are
// facts and are not copyrightable. This library must NEVER contain lyrics,
// melodies, or audio from the original recordings. Playback uses the app's
// own generic chord voicings only.
//
// Number notation used in `bars`:
//   "1"     major chord on that scale degree
//   "6m"    minor (m suffix; the UI can also infer quality from the degree)
//   "b7"    borrowed flat-seven major
//   "1/3"   slash chord — 1 chord with the 3rd scale degree in the bass
//   "4/6"   4 chord over 6 in the bass
// One array entry = one bar. Repeat entries to show a chord held for
// multiple bars.

export type SongSection = {
  label: string;          // "Verse", "Chorus", "Bridge", "Pre-Chorus"...
  bars: string[];         // number notation per bar, e.g. ["1","5","4","6m","5"]
  repeat?: number;        // how many times the section typically loops
};

export type Song = {
  id: string;             // kebab-case slug
  title: string;
  artist: string;         // factual reference only — no affiliation implied
  originalKey: string;    // e.g. "E"
  tempo?: number;         // BPM, optional
  difficulty: 1 | 2 | 3;  // 1 = triads only, 2 = adds minors/2-3-6, 3 = slash/borrowed
  sections: SongSection[];
};

export const SONGS: Song[] = [
  {
    id: "holy-forever",
    title: "Holy Forever",
    artist: "Chris Tomlin",
    originalKey: "C",
    difficulty: 2,
    sections: [
      // Simplified from the published chart — decorations like Am7 / F2 /
      // Gsus are intentionally stripped; the app teaches the skeleton.
      { label: "Verse",      bars: ["1", "4", "1", "6m", "5", "4"] },
      { label: "Pre-Chorus", bars: ["4", "6m", "5", "4", "6m", "2m"] },
      { label: "Chorus",     bars: ["4", "6m", "5", "1/3", "6m", "2m", "5", "1"] },
    ],
  },
];

export function getSong(id: string): Song | undefined {
  return SONGS.find((s) => s.id === id);
}

// ————— Key math shared by Read Charts / Transpose / Learn —————

export const SCALE_MAP: Record<string, string[]> = {
  C:  ["C","Dm","Em","F","G","Am","Bdim"],
  D:  ["D","Em","F#m","G","A","Bm","C#dim"],
  E:  ["E","F#m","G#m","A","B","C#m","D#dim"],
  F:  ["F","Gm","Am","Bb","C","Dm","Edim"],
  G:  ["G","Am","Bm","C","D","Em","F#dim"],
  A:  ["A","Bm","C#m","D","E","F#m","G#dim"],
  B:  ["B","C#m","D#m","E","F#","G#m","A#dim"],
  Bb: ["Bb","Cm","Dm","Eb","F","Gm","Adim"],
  Eb: ["Eb","Fm","Gm","Ab","Bb","Cm","Ddim"],
  Ab: ["Ab","Bbm","Cm","Db","Eb","Fm","Gdim"],
  Db: ["Db","Ebm","Fm","Gb","Ab","Bbm","Cdim"],
  "F#": ["F#","G#m","A#m","B","C#","D#m","Fdim"],
};

export const ROOT_MAP: Record<string, string[]> = {
  C:  ["C","D","E","F","G","A","B"],
  D:  ["D","E","F#","G","A","B","C#"],
  E:  ["E","F#","G#","A","B","C#","D#"],
  F:  ["F","G","A","Bb","C","D","E"],
  G:  ["G","A","B","C","D","E","F#"],
  A:  ["A","B","C#","D","E","F#","G#"],
  B:  ["B","C#","D#","E","F#","G#","A#"],
  Bb: ["Bb","C","D","Eb","F","G","A"],
  Eb: ["Eb","F","G","Ab","Bb","C","D"],
  Ab: ["Ab","Bb","C","Db","Eb","F","G"],
  Db: ["Db","Eb","F","Gb","Ab","Bb","C"],
  "F#": ["F#","G#","A#","B","C#","D#","E#"],
};

// Resolve a number token ("1", "6m", "2m", "1/3") to a chord name in a key.
// Quality (m/dim) comes from SCALE_MAP, so the m suffix in the token is
// display-only; slash bass notes resolve through ROOT_MAP.
export function resolveToken(token: string, key: string): string {
  const [base, bass] = token.split("/");
  const deg = parseInt(base, 10);
  if (isNaN(deg) || deg < 1 || deg > 7) return token;
  let name = SCALE_MAP[key][deg - 1];
  if (bass) {
    const bassDeg = parseInt(bass, 10);
    if (!isNaN(bassDeg) && bassDeg >= 1 && bassDeg <= 7) {
      name += "/" + ROOT_MAP[key][bassDeg - 1];
    }
  }
  return name;
}
