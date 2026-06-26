"use client";

import { useState } from "react";
import Link from "next/link";

// Clockwise from top: C at 12 o'clock
const CIRCLE_KEYS = ["C","G","D","A","E","B","F#","Db","Ab","Eb","Bb","F"];

const SCALE_MAP: Record<string, string[]> = {
  C:  ["C","Dm","Em","F","G","Am","Bdim"],
  G:  ["G","Am","Bm","C","D","Em","F#dim"],
  D:  ["D","Em","F#m","G","A","Bm","C#dim"],
  A:  ["A","Bm","C#m","D","E","F#m","G#dim"],
  E:  ["E","F#m","G#m","A","B","C#m","D#dim"],
  B:  ["B","C#m","D#m","E","F#","G#m","A#dim"],
  "F#": ["F#","G#m","A#m","B","C#","D#m","Fdim"],
  Db: ["Db","Ebm","Fm","Gb","Ab","Bbm","Cdim"],
  Ab: ["Ab","Bbm","Cm","Db","Eb","Fm","Gdim"],
  Eb: ["Eb","Fm","Gm","Ab","Bb","Cm","Ddim"],
  Bb: ["Bb","Cm","Dm","Eb","F","Gm","Adim"],
  F:  ["F","Gm","Am","Bb","C","Dm","Edim"],
};

const RELATIVE_MINOR: Record<string, string> = {
  C:"Am", G:"Em", D:"Bm", A:"F#m", E:"C#m", B:"G#m",
  "F#":"D#m", Db:"Bbm", Ab:"Fm", Eb:"Cm", Bb:"Gm", F:"Dm",
};

const SHARPS_FLATS: Record<string, string> = {
  C:"No sharps or flats", G:"1 sharp (F#)", D:"2 sharps (F#, C#)",
  A:"3 sharps (F#, C#, G#)", E:"4 sharps (F#, C#, G#, D#)", B:"5 sharps (F#, C#, G#, D#, A#)",
  "F#":"6 sharps (F#, C#, G#, D#, A#, E#)", Db:"5 flats (Bb, Eb, Ab, Db, Gb)", Ab:"4 flats (Bb, Eb, Ab, Db)",
  Eb:"3 flats (Bb, Eb, Ab)", Bb:"2 flats (Bb, Eb)", F:"1 flat (Bb)",
};

const SLICE_BADGE: Record<string, string> = {
  C:"0", G:"1♯", D:"2♯", A:"3♯", E:"4♯", B:"5♯",
  "F#":"6♯", Db:"5♭", Ab:"4♭", Eb:"3♭", Bb:"2♭", F:"1♭",
};

// Common worship keys
const WORSHIP_KEYS = new Set(["G","D","A","E","C","B","F#"]);

const QUALITY_COLORS = [
  "bg-blue-50 text-blue-600",
  "bg-rose-50 text-rose-500",
  "bg-rose-50 text-rose-500",
  "bg-blue-50 text-blue-600",
  "bg-blue-50 text-blue-600",
  "bg-rose-50 text-rose-500",
  "bg-gray-100 text-gray-400",
];

const CX = 150;
const CY = 150;
const R_OUTER = 128;
const R_INNER = 72;
const R_LABEL = (R_OUTER + R_INNER) / 2;
const R_MINOR = R_INNER - 14;

function polarToXY(angleDeg: number, r: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}

function slicePath(i: number) {
  const gap = 1.5; // degrees of gap between slices
  const startDeg = i * 30 + gap / 2;
  const endDeg = (i + 1) * 30 - gap / 2;

  const o1 = polarToXY(startDeg, R_OUTER);
  const o2 = polarToXY(endDeg, R_OUTER);
  const i1 = polarToXY(startDeg, R_INNER);
  const i2 = polarToXY(endDeg, R_INNER);

  return `M ${o1.x} ${o1.y} A ${R_OUTER} ${R_OUTER} 0 0 1 ${o2.x} ${o2.y} L ${i2.x} ${i2.y} A ${R_INNER} ${R_INNER} 0 0 0 ${i1.x} ${i1.y} Z`;
}

export default function CheatPage() {
  const [selectedKey, setSelectedKey] = useState<string | null>("G");

  return (
    <main className="min-h-screen bg-[#f5f5f7] px-6 py-12 max-w-lg mx-auto">
      <Link href="/" className="text-blue-500 text-sm font-medium mb-8 inline-block">← Back</Link>

      <h1 className="text-4xl font-bold text-[#1d1d1f] tracking-tight mb-1">Circle of 4ths & 5ths</h1>
      <p className="text-gray-500 mb-8">Tap a key to see all 7 chords. Clockwise = 5ths. Counter-clockwise = 4ths.</p>

      {/* Circle */}
      <div className="bg-white rounded-3xl shadow-sm p-4 mb-6">
        <svg viewBox="0 0 300 300" className="w-full max-w-sm mx-auto">
          {/* Direction labels */}
          <text x={150} y={13} textAnchor="middle" fontSize={7.5} fill="#9ca3af" fontWeight="600">← Circle of 4ths &nbsp;&nbsp; Circle of 5ths →</text>

          {/* Slices */}
          {CIRCLE_KEYS.map((key, i) => {
            const isSelected = selectedKey === key;
            const isWorship = WORSHIP_KEYS.has(key);
            const midDeg = i * 30 + 15;
            const labelPos = polarToXY(midDeg, R_LABEL);
            const minorPos = polarToXY(midDeg, R_MINOR);

            let fill = isWorship ? "#eff6ff" : "#f9fafb";
            if (isSelected) fill = "#3b82f6";

            return (
              <g key={key} onClick={() => setSelectedKey(key)} className="cursor-pointer">
                <path
                  d={slicePath(i)}
                  fill={fill}
                  stroke="white"
                  strokeWidth={2}
                />
                {/* Key label */}
                <text
                  x={labelPos.x} y={labelPos.y}
                  textAnchor="middle"
                  fontSize={isSelected ? 12 : 11}
                  fontWeight="700"
                  fill={isSelected ? "white" : isWorship ? "#3b82f6" : "#6b7280"}
                >
                  {key}
                </text>
                {/* Sharps/flats badge */}
                <text
                  x={labelPos.x} y={labelPos.y + 11}
                  textAnchor="middle"
                  fontSize={7.5}
                  fontWeight="600"
                  fill={isSelected ? "rgba(255,255,255,0.7)" : "#9ca3af"}
                >
                  {SLICE_BADGE[key]}
                </text>
              </g>
            );
          })}

          {/* Center circle */}
          <circle cx={CX} cy={CY} r={R_MINOR} fill="white" />
          {selectedKey ? (
            <>
              <text x={CX} y={CY - 6} textAnchor="middle" fontSize={22} fontWeight="800" fill="#1d1d1f">{selectedKey}</text>
              <text x={CX} y={CY + 10} textAnchor="middle" fontSize={8} fill="#9ca3af">{RELATIVE_MINOR[selectedKey]}</text>
              <text x={CX} y={CY + 22} textAnchor="middle" fontSize={7} fill="#d1d5db">rel. minor</text>
            </>
          ) : (
            <text x={CX} y={CY + 4} textAnchor="middle" fontSize={9} fill="#d1d5db">tap a key</text>
          )}

        </svg>
      </div>

      {/* Selected key detail */}
      {selectedKey && (
        <div className="bg-white rounded-3xl shadow-sm p-6 mb-4">
          <div className="flex justify-between items-start mb-5">
            <div>
              <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-1">Key of {selectedKey}</p>
              <p className="text-xs text-gray-400">{SHARPS_FLATS[selectedKey]}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Relative minor</p>
              <p className="text-sm font-semibold text-rose-400">{RELATIVE_MINOR[selectedKey]}</p>
            </div>
          </div>

          {/* 7 chords */}
          <div className="grid grid-cols-7 gap-1.5">
            {SCALE_MAP[selectedKey].map((chord, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className="w-full text-center rounded-lg py-1 text-xs font-bold text-gray-400 bg-[#f5f5f7]">
                  {i + 1}
                </div>
                <div className={`w-full text-center rounded-lg py-2 text-xs font-bold ${QUALITY_COLORS[i]}`}>
                  {chord}
                </div>
              </div>
            ))}
          </div>

          {/* 1-4-5 callout */}
          <div className="mt-4 pt-4 border-t border-[#f5f5f7]">
            <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-2">Most used in worship</p>
            <div className="flex gap-2">
              {[0, 3, 4, 5].map((i) => (
                <div key={i} className="flex-1 bg-blue-50 text-blue-600 rounded-xl py-2 text-center">
                  <p className="text-xs text-blue-300 mb-0.5">{i + 1}</p>
                  <p className="font-bold text-sm">{SCALE_MAP[selectedKey][i]}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
