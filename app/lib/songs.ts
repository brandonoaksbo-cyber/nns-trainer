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
