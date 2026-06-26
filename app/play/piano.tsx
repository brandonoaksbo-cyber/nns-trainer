"use client";

// Piano keyboard: C3–B4 (2 octaves). Notes specified with octave: "C3", "E4", etc.
// Enharmonic normalization
const ENHARMONIC: Record<string, string> = {
  "Bb3":"A#3","Eb3":"D#3","Ab3":"G#3","Db3":"C#3","Gb3":"F#3",
  "Bb4":"A#4","Eb4":"D#4","Ab4":"G#4","Db4":"C#4","Gb4":"F#4",
  "Cb4":"B3","Fb4":"E3","Cb5":"B4","Fb5":"E4",
};

const WHITE_PATTERN = ["C","D","E","F","G","A","B"];
const BLACK_PATTERN: (string|null)[] = ["C#","D#",null,"F#","G#","A#",null];
const OCTAVES = [3, 4];
const KEY_W = 26;
const KEY_H = 86;
const BLACK_W = 17;
const BLACK_H = 54;
const TOTAL_WHITE = WHITE_PATTERN.length * OCTAVES.length;

interface Props { notes: string[]; label?: string }

export default function PianoChord({ notes, label }: Props) {
  const normalized = new Set(notes.map(n => ENHARMONIC[n] ?? n));

  const whites: { id: string; x: number }[] = [];
  const blacks: { id: string; x: number }[] = [];

  OCTAVES.forEach((oct, oi) => {
    WHITE_PATTERN.forEach((n, i) => {
      whites.push({ id: `${n}${oct}`, x: (oi * 7 + i) * KEY_W });
    });
    BLACK_PATTERN.forEach((n, i) => {
      if (n) blacks.push({ id: `${n}${oct}`, x: (oi * 7 + i) * KEY_W + KEY_W - BLACK_W / 2 });
    });
  });

  const svgW = TOTAL_WHITE * KEY_W;

  return (
    <div className="text-center">
      {label && <p className="text-xs text-gray-400 mb-2 font-medium">{label}</p>}
      <svg viewBox={`0 0 ${svgW} ${KEY_H + 4}`} className="w-full max-w-sm mx-auto">
        {whites.map(({ id, x }) => {
          const active = normalized.has(id);
          return (
            <g key={id}>
              <rect x={x+1} y={1} width={KEY_W-2} height={KEY_H} rx={3}
                fill={active ? "#3b82f6" : "white"} stroke="#e5e7eb" strokeWidth={1} />
              {active && (
                <text x={x+KEY_W/2} y={KEY_H-8} textAnchor="middle" fontSize={8} fill="white" fontWeight="bold">
                  {id.slice(0,-1)}
                </text>
              )}
            </g>
          );
        })}
        {blacks.map(({ id, x }) => {
          const active = normalized.has(id);
          return (
            <g key={id}>
              <rect x={x} y={1} width={BLACK_W} height={BLACK_H} rx={2}
                fill={active ? "#3b82f6" : "#1d1d1f"} />
              {active && (
                <text x={x+BLACK_W/2} y={BLACK_H-5} textAnchor="middle" fontSize={7} fill="white" fontWeight="bold">
                  {id.slice(0,-1)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
