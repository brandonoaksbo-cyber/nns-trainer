"use client";

import { useState } from "react";
import Link from "next/link";

const SCALE_MAP: Record<string, string[]> = {
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

const KEYS = Object.keys(SCALE_MAP);

// Root note of each scale degree (no quality suffix)
const ROOT_MAP: Record<string, string[]> = {
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

// Borrowed chord labels → chord name resolver (key of any)
const BORROWED: Record<string, (key: string) => string> = {
  "Maj 2": (k) => SCALE_MAP[k][1].replace("m",""),
  "Maj 3": (k) => SCALE_MAP[k][2].replace("m",""),
  "Maj 6": (k) => SCALE_MAP[k][5].replace("m",""),
  "b7":    (k) => {
    const scale: Record<string,string> = {C:"Bb",D:"C",E:"D",F:"Eb",G:"F",A:"G",B:"A",Bb:"Ab",Eb:"Db",Ab:"Gb",Db:"B","F#":"E"};
    return scale[k] ?? "b7";
  },
  "Min 4": (k) => SCALE_MAP[k][3] + "m",
  "Min 5": (k) => SCALE_MAP[k][4] + "m",
};

type Cell = { num: string; borrowed?: boolean; slash?: boolean };

const LEVELS: {
  title: string;
  description: string;
  charts: { title: string; bars: Cell[][] }[];
}[] = [
  {
    title: "Level 1",
    description: "Major chords only — 1, 4, 5",
    charts: [
      { title: "Simple Praise",   bars: [[{num:"1"},{num:"1"},{num:"4"},{num:"5"}],[{num:"1"},{num:"1"},{num:"5"},{num:"5"}],[{num:"4"},{num:"4"},{num:"1"},{num:"1"}]] },
      { title: "Worship Flow",    bars: [[{num:"1"},{num:"5"},{num:"4"},{num:"4"}],[{num:"1"},{num:"5"},{num:"4"},{num:"5"}],[{num:"1"},{num:"1"},{num:"4"},{num:"5"}]] },
      { title: "Open Skies",      bars: [[{num:"4"},{num:"1"},{num:"5"},{num:"1"}],[{num:"4"},{num:"5"},{num:"1"},{num:"1"}],[{num:"4"},{num:"5"},{num:"4"},{num:"1"}]] },
    ],
  },
  {
    title: "Level 2",
    description: "Add minor & dim chords — 2, 3, 6, 7",
    charts: [
      { title: "Sunday Morning",  bars: [[{num:"1"},{num:"5"},{num:"6"},{num:"4"}],[{num:"1"},{num:"5"},{num:"4"},{num:"4"}],[{num:"6"},{num:"4"},{num:"1"},{num:"5"}]] },
      { title: "Gentle Rain",     bars: [[{num:"1"},{num:"6"},{num:"4"},{num:"5"}],[{num:"1"},{num:"3"},{num:"6"},{num:"5"}],[{num:"4"},{num:"4"},{num:"5"},{num:"1"}]] },
      { title: "Valley Song",     bars: [[{num:"6"},{num:"4"},{num:"1"},{num:"5"}],[{num:"2"},{num:"5"},{num:"1"},{num:"1"}],[{num:"4"},{num:"5"},{num:"6"},{num:"1"}]] },
    ],
  },
  {
    title: "Level 3",
    description: "Add borrowed chords — Maj 2, Maj 3, b7, Min 4, Min 5",
    charts: [
      { title: "New Creation",    bars: [[{num:"1"},{num:"Maj 2",borrowed:true},{num:"4"},{num:"5"}],[{num:"1"},{num:"b7",borrowed:true},{num:"4"},{num:"1"}],[{num:"4"},{num:"Min 4",borrowed:true},{num:"1"},{num:"5"}]] },
      { title: "Overcomer",       bars: [[{num:"1"},{num:"5"},{num:"Maj 6",borrowed:true},{num:"4"}],[{num:"1"},{num:"Maj 2",borrowed:true},{num:"5"},{num:"5"}],[{num:"4"},{num:"4"},{num:"b7",borrowed:true},{num:"1"}]] },
      { title: "Borrowed Light",  bars: [[{num:"1"},{num:"Min 4",borrowed:true},{num:"1"},{num:"5"}],[{num:"b7",borrowed:true},{num:"4"},{num:"1"},{num:"1"}],[{num:"Maj 3",borrowed:true},{num:"4"},{num:"5"},{num:"1"}]] },
    ],
  },
  {
    title: "Level 4",
    description: "Slash chords — chord / bass note",
    charts: [
      { title: "Walking Home",   bars: [[{num:"1"},{num:"1/3",slash:true},{num:"4"},{num:"5"}],[{num:"1"},{num:"5/7",slash:true},{num:"6"},{num:"4"}],[{num:"1/5",slash:true},{num:"4"},{num:"5"},{num:"1"}]] },
      { title: "Gentle Descent", bars: [[{num:"1"},{num:"1/3",slash:true},{num:"4/6",slash:true},{num:"5"}],[{num:"1"},{num:"6"},{num:"4"},{num:"5/7",slash:true}],[{num:"4"},{num:"4/6",slash:true},{num:"1/5",slash:true},{num:"1"}]] },
      { title: "Sunday Walk",    bars: [[{num:"4"},{num:"1/3",slash:true},{num:"2"},{num:"5/7",slash:true}],[{num:"1"},{num:"1/5",slash:true},{num:"4"},{num:"5"}],[{num:"6"},{num:"4/6",slash:true},{num:"5/7",slash:true},{num:"1"}]] },
    ],
  },
];

function resolveCell(cell: Cell, key: string): string {
  if (cell.borrowed) return BORROWED[cell.num]?.(key) ?? cell.num;
  if (cell.slash) {
    const [chord, bass] = cell.num.split("/");
    const chordName = SCALE_MAP[key][parseInt(chord) - 1];
    const bassNote = ROOT_MAP[key][parseInt(bass) - 1];
    return `${chordName}/${bassNote}`;
  }
  const n = parseInt(cell.num);
  if (isNaN(n) || n < 1 || n > 7) return cell.num;
  return SCALE_MAP[key][n - 1];
}

export default function ReadPage() {
  const [key, setKey] = useState("C");
  const [levelIdx, setLevelIdx] = useState(0);
  const [chartIdx, setChartIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const level = LEVELS[levelIdx];
  const chart = level.charts[chartIdx];

  function changeLevel(idx: number) {
    setLevelIdx(idx);
    setChartIdx(0);
    setRevealed(false);
  }

  return (
    <main className="min-h-screen bg-[#f5f5f7] px-6 py-12 max-w-2xl mx-auto">
      <Link href="/" className="text-blue-500 text-sm font-medium mb-8 inline-block">← Back</Link>

      <h1 className="text-4xl font-bold text-[#1d1d1f] tracking-tight mb-2">Read Charts</h1>
      <p className="text-gray-500 mb-6">Pick a key, read the numbers, then reveal to check.</p>

      {/* Key selector */}
      <div className="mb-4">
        <label className="text-xs font-semibold tracking-widest text-gray-400 uppercase block mb-2">Key</label>
        <select
          value={key}
          onChange={(e) => { setKey(e.target.value); setRevealed(false); }}
          className="bg-white border-0 rounded-xl px-4 py-3 text-[#1d1d1f] font-medium shadow-sm appearance-none"
        >
          {KEYS.map((k) => <option key={k}>{k}</option>)}
        </select>
      </div>

      {/* Level tabs */}
      <div className="bg-white rounded-2xl p-1.5 shadow-sm flex gap-1 mb-2">
        {LEVELS.map((l, i) => (
          <button
            key={i}
            onClick={() => changeLevel(i)}
            className={`flex-1 rounded-xl py-2 text-sm font-semibold transition ${
              i === levelIdx ? "bg-green-500 text-white shadow-sm" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {l.title}
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-400 text-center mb-6">{level.description}</p>

      {/* Chart */}
      <div className="mb-2">
        <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-3">{chart.title}</p>
        <div className="space-y-3">
          {chart.bars.map((bar, barIdx) => (
            <div key={barIdx} className="bg-white rounded-2xl p-5 shadow-sm">
              <p className="text-xs text-gray-400 font-medium mb-3">Bar {barIdx + 1}</p>
              <div className="flex gap-3">
                {bar.map((cell, colIdx) => (
                  <div key={colIdx} className="flex-1 text-center">
                    <div className={`text-2xl font-bold mb-2 ${cell.borrowed ? "text-orange-500" : cell.slash ? "text-purple-500" : "text-[#1d1d1f]"}`}>
                      {cell.num}
                    </div>
                    {revealed && (
                      <div className="text-sm font-medium text-green-600 bg-green-50 rounded-lg py-1 px-1">
                        {resolveCell(cell, key)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      {levelIdx === 2 && (
        <p className="text-xs text-orange-400 text-center mb-4">Orange = borrowed chord</p>
      )}
      {levelIdx === 3 && (
        <p className="text-xs text-purple-400 text-center mb-4">Purple = slash chord — chord name / bass note</p>
      )}

      {/* Scale reference */}
      {revealed && (
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-4">
          <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-3">Key of <span className="normal-case">{key}</span></p>
          <div className="flex gap-3">
            {SCALE_MAP[key].map((chord, i) => (
              <div key={i} className="text-center flex-1">
                <p className="text-xs text-gray-400 mb-1">{i + 1}</p>
                <p className="font-semibold text-[#1d1d1f] text-sm">{chord}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 mt-4">
        <button
          onClick={() => setRevealed(!revealed)}
          className="flex-1 bg-green-500 hover:bg-green-600 text-white rounded-2xl py-4 font-semibold transition"
        >
          {revealed ? "Hide Chords" : "Reveal Chords"}
        </button>
        <button
          onClick={() => { setChartIdx((chartIdx + 1) % level.charts.length); setRevealed(false); }}
          className="bg-white hover:bg-gray-50 text-[#1d1d1f] rounded-2xl py-4 px-6 font-semibold shadow-sm transition"
        >
          Next
        </button>
      </div>
    </main>
  );
}
