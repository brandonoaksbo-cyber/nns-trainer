"use client";

import { useState, useCallback } from "react";
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

const PROGRESSIONS = [
  { name: "The Big Four",    nums: [1, 5, 6, 4] },
  { name: "Classic Worship", nums: [1, 4, 5, 1] },
  { name: "Minor Feel",      nums: [6, 4, 1, 5] },
];

function getChord(num: number, key: string) {
  return SCALE_MAP[key][num - 1];
}

function randomKey() {
  return KEYS[Math.floor(Math.random() * KEYS.length)];
}

function buildRound(progNums: number[]) {
  const fromKey = randomKey();
  let toKey = randomKey();
  while (toKey === fromKey) toKey = randomKey();
  return { fromKey, toKey };
}

export default function TransposePage() {
  const [progIdx, setProgIdx] = useState(0);
  const [round, setRound] = useState(() => buildRound(PROGRESSIONS[0].nums));
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const progression = PROGRESSIONS[progIdx];
  const { fromKey, toKey } = round;

  const next = useCallback(() => {
    setRound(buildRound(progression.nums));
    setRevealed(false);
  }, [progression.nums]);

  function handleReveal() {
    if (!revealed) {
      setScore(s => ({ correct: s.correct + 1, total: s.total + 1 }));
    }
    setRevealed(true);
  }

  function changeProgression(idx: number) {
    setProgIdx(idx);
    setRound(buildRound(PROGRESSIONS[idx].nums));
    setRevealed(false);
  }

  return (
    <main className="min-h-screen bg-[#f5f5f7] px-6 py-12 max-w-lg mx-auto">
      <Link href="/" className="text-blue-500 text-sm font-medium mb-8 inline-block">← Back</Link>

      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-4xl font-bold text-[#1d1d1f] tracking-tight mb-1">Transpose</h1>
          <p className="text-gray-500 text-sm">Move the whole progression to a new key</p>
        </div>
        <div className="bg-white rounded-2xl px-4 py-3 shadow-sm text-center">
          <p className="text-xl font-bold text-[#1d1d1f]">{score.correct}/{score.total}</p>
          <p className="text-xs text-gray-400">revealed</p>
        </div>
      </div>

      {/* Progression selector */}
      <div className="bg-white rounded-2xl p-1.5 shadow-sm flex gap-1 mb-8">
        {PROGRESSIONS.map((p, i) => (
          <button
            key={i}
            onClick={() => changeProgression(i)}
            className={`flex-1 rounded-xl py-2 text-xs font-semibold transition ${
              i === progIdx ? "bg-orange-500 text-white shadow-sm" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* From key */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-3">
        <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-4">
          Original — Key of <span className="text-orange-500">{fromKey}</span>
        </p>
        <div className="grid grid-cols-4 gap-3">
          {progression.nums.map((num, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="w-full aspect-square rounded-xl bg-[#f5f5f7] flex items-center justify-center text-2xl font-bold text-[#1d1d1f]">
                {num}
              </div>
              <p className="text-sm font-medium text-gray-500">{getChord(num, fromKey)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Arrow */}
      <div className="text-center text-gray-300 text-2xl mb-3">↓</div>

      {/* To key */}
      <div className={`rounded-2xl p-6 shadow-sm mb-6 transition ${revealed ? "bg-white" : "bg-white"}`}>
        <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-4">
          Transposed — Key of <span className="text-blue-500">{toKey}</span>
        </p>
        <div className="grid grid-cols-4 gap-3">
          {progression.nums.map((num, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="w-full aspect-square rounded-xl bg-[#f5f5f7] flex items-center justify-center text-2xl font-bold text-[#1d1d1f]">
                {num}
              </div>
              {revealed ? (
                <p className="text-sm font-semibold text-blue-500">{getChord(num, toKey)}</p>
              ) : (
                <div className="h-5 w-12 bg-gray-100 rounded-md" />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        {!revealed ? (
          <button
            onClick={handleReveal}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl py-4 font-semibold transition"
          >
            Reveal Answer
          </button>
        ) : (
          <button
            onClick={next}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl py-4 font-semibold transition"
          >
            Next Progression →
          </button>
        )}
      </div>
    </main>
  );
}
