"use client";

export type GuitarShape = {
  frets: number[];    // [low E, A, D, G, B, high e] — -1=mute, 0=open
  barre?: number;     // fret number for full barre
  baseFret?: number;  // display offset for higher shapes
  name: string;       // display name e.g. "Cadd9"
};

// Worship-specific guitar shapes — full, open, modern voicings
export const GUITAR_CHORDS: Record<string, GuitarShape> = {
  // C family
  "C":    { name: "Cadd9",   frets: [-1, 3, 2, 0, 3, 0] },           // x32030 — adds the 9th, very open
  "Cm":   { name: "Cm",      frets: [-1, 3, 5, 5, 4, 3], barre: 3, baseFret: 3 },

  // D family
  "D":    { name: "Dsus2",   frets: [-1, -1, 0, 2, 3, 0] },          // xx0230 — worship staple
  "Dm":   { name: "Dm7",     frets: [-1, -1, 0, 2, 1, 1] },          // xx0211 — lighter, airy

  // E family
  "E":    { name: "Eadd9",   frets: [0, 2, 2, 1, 0, 2] },            // 022102 — adds the 9th
  "Em":   { name: "Em7",     frets: [0, 2, 2, 0, 3, 0] },            // 022030 — beautiful worship voicing
  "Eb":   { name: "Eb",      frets: [-1, -1, 5, 3, 4, 3], baseFret: 3 },

  // F family
  "F":    { name: "Fmaj7",   frets: [-1, -1, 3, 2, 1, 0] },          // xx3210 — no barre, bright
  "Fm":   { name: "Fm",      frets: [1, 1, 1, 1, 0, 1], barre: 1 },

  // G family
  "G":    { name: "G",       frets: [3, 2, 0, 0, 3, 3] },            // 320033 — fuller G voicing
  "Gm":   { name: "Gm",      frets: [3, 5, 5, 3, 3, 3], barre: 3, baseFret: 3 },

  // A family
  "A":    { name: "Asus2",   frets: [-1, 0, 2, 2, 0, 0] },           // x02200 — worship staple
  "Am":   { name: "Am7",     frets: [-1, 0, 2, 0, 1, 0] },           // x02010 — softer, floaty
  "Ab":   { name: "Ab",      frets: [-1, -1, 1, 1, 1, 4], barre: 4, baseFret: 4 },

  // B family
  "B":    { name: "Bsus4",   frets: [-1, 2, 4, 4, 5, 2], barre: 2, baseFret: 2 },
  "Bm":   { name: "Bm7",     frets: [-1, 2, 0, 2, 0, 2] },           // x20202 — lighter barre-free option
  "Bb":   { name: "Bb",      frets: [-1, 1, 3, 3, 3, 1], barre: 1, baseFret: 1 },

  // Flat/sharp keys
  "Db":   { name: "Db",      frets: [-1, 4, 3, 1, 2, 1], barre: 1, baseFret: 1 },
  "F#":   { name: "F#",      frets: [2, 4, 4, 3, 2, 2], barre: 2, baseFret: 2 },
  "F#m":  { name: "F#m7",    frets: [2, 0, 4, 2, 2, 2], barre: 2, baseFret: 2 },
  "C#m":  { name: "C#m7",    frets: [-1, 4, 2, 4, 2, 2], baseFret: 4 },
  "G#m":  { name: "G#m",     frets: [4, 6, 6, 4, 4, 4], barre: 4, baseFret: 4 },
  "Bbm":  { name: "Bbm",     frets: [-1, 1, 3, 3, 2, 1], barre: 1, baseFret: 1 },

  // Dim
  "Bdim":  { name: "Bdim",   frets: [-1, -1, 0, 1, 0, 1] },
  "C#dim": { name: "C#dim",  frets: [-1, -1, 1, 2, 1, 2] },
  "Adim":  { name: "Adim",   frets: [-1, 0, 1, 2, 1, -1] },
  "Edim":  { name: "Edim",   frets: [-1, -1, 2, 3, 2, 3] },
  "F#dim": { name: "F#dim",  frets: [-1, -1, 3, 4, 3, 4] },
};

const STRING_SPACING = 22;
const FRET_SPACING = 24;
const FRETS_SHOWN = 4;
const STRINGS = 6;
const MARGIN_TOP = 36;
const MARGIN_LEFT = 26;
const SVG_W = MARGIN_LEFT + (STRINGS - 1) * STRING_SPACING + 20;
const SVG_H = MARGIN_TOP + FRETS_SHOWN * FRET_SPACING + 20;

interface Props { chord: GuitarShape }

export default function GuitarChord({ chord }: Props) {
  const { frets, barre, baseFret = 1, name } = chord;
  const activeFrets = frets.filter(f => f > 0);
  const minFret = activeFrets.length ? Math.min(...activeFrets) : 1;
  const startFret = baseFret > 1 ? baseFret : minFret > 4 ? minFret : 1;
  const isOpen = startFret === 1;

  return (
    <div className="flex flex-col items-center">
      <p className="text-xs text-blue-500 font-semibold mb-2">{name}</p>
      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-32">
        {/* Nut */}
        {isOpen
          ? <rect x={MARGIN_LEFT} y={MARGIN_TOP} width={(STRINGS-1)*STRING_SPACING} height={4} fill="#1d1d1f" rx={1} />
          : <text x={MARGIN_LEFT-4} y={MARGIN_TOP+FRET_SPACING*0.65} textAnchor="end" fontSize={9} fill="#9ca3af">{startFret}fr</text>
        }

        {/* Fret lines */}
        {Array.from({length: FRETS_SHOWN+1}).map((_,i) => (
          <line key={i}
            x1={MARGIN_LEFT} y1={MARGIN_TOP + i*FRET_SPACING + (isOpen ? 4 : 0)}
            x2={MARGIN_LEFT+(STRINGS-1)*STRING_SPACING} y2={MARGIN_TOP + i*FRET_SPACING + (isOpen ? 4 : 0)}
            stroke={i===0 && isOpen ? "none" : "#d1d5db"} strokeWidth={1} />
        ))}

        {/* Strings */}
        {Array.from({length: STRINGS}).map((_,i) => (
          <line key={i}
            x1={MARGIN_LEFT+i*STRING_SPACING} y1={MARGIN_TOP + (isOpen ? 4 : 0)}
            x2={MARGIN_LEFT+i*STRING_SPACING} y2={MARGIN_TOP+FRETS_SHOWN*FRET_SPACING + (isOpen ? 4 : 0)}
            stroke="#d1d5db" strokeWidth={1.2} />
        ))}

        {/* Barre bar */}
        {barre && (
          <rect
            x={MARGIN_LEFT+3}
            y={MARGIN_TOP + (barre-startFret)*FRET_SPACING + (isOpen?4:0) + FRET_SPACING*0.22}
            width={(STRINGS-1)*STRING_SPACING-6}
            height={FRET_SPACING*0.52}
            rx={9} fill="#3b82f6" />
        )}

        {/* Open / muted strings */}
        {frets.map((fret, i) => {
          const x = MARGIN_LEFT + i*STRING_SPACING;
          if (fret === 0) return <circle key={i} cx={x} cy={MARGIN_TOP-10} r={5} fill="none" stroke="#9ca3af" strokeWidth={1.5} />;
          if (fret === -1) return <text key={i} x={x} y={MARGIN_TOP-5} textAnchor="middle" fontSize={11} fill="#d1d5db">×</text>;
          return null;
        })}

        {/* Finger dots */}
        {frets.map((fret, i) => {
          if (fret <= 0) return null;
          const rel = fret - startFret + 1;
          if (rel < 1 || rel > FRETS_SHOWN) return null;
          if (barre && fret === barre) return null;
          const x = MARGIN_LEFT + i*STRING_SPACING;
          const y = MARGIN_TOP + (rel-0.5)*FRET_SPACING + (isOpen?4:0);
          return <circle key={i} cx={x} cy={y} r={8} fill="#3b82f6" />;
        })}
      </svg>
    </div>
  );
}
