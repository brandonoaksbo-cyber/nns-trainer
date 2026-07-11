"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useEntitlement } from "../components/EntitlementProvider";
import Paywall from "../components/Paywall";
import { SONGS, SCALE_MAP, resolveToken } from "../lib/songs";

const KEYS = Object.keys(SCALE_MAP);
const SONG = SONGS[0];
const SONG_SECTION = SONG.sections.find(s => s.label === "Chorus") ?? SONG.sections[0];

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

function randomToKey(exclude: string): string {
  let k = randomKey();
  while (k === exclude) k = randomKey();
  return k;
}

export default function TransposePage() {
  const [mode, setMode] = useState<"song" | "practice">("song");
  const [progIdx, setProgIdx] = useState(0);
  const [round, setRound] = useState<ReturnType<typeof buildRound> | null>(null);
  const [songToKey, setSongToKey] = useState<string | null>(null);

  useEffect(() => {
    setRound(buildRound(PROGRESSIONS[0].nums));
    setSongToKey(randomToKey(SONG.originalKey));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const next = useCallback(() => {
    if (mode === "song") {
      setSongToKey(prev => randomToKey(prev ?? SONG.originalKey));
    } else {
      setRound(buildRound(PROGRESSIONS[progIdx].nums));
    }
    setRevealed(false);
  }, [mode, progIdx]);

  const { isUnlocked } = useEntitlement();

  if (!isUnlocked) return <Paywall />;
  if (!round || !songToKey) return null;
  const progression = PROGRESSIONS[progIdx];

  const isSong = mode === "song";
  const fromKey = isSong ? SONG.originalKey : round.fromKey;
  const toKey = isSong ? songToKey : round.toKey;
  const tokens = isSong ? SONG_SECTION.bars : progression.nums.map(String);

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

      {/* Mode toggle */}
      <div className="bg-white rounded-2xl p-1.5 shadow-sm flex gap-1 mb-3">
        {([["song", SONG.title], ["practice", "Practice"]] as const).map(([m, label]) => (
          <button
            key={m}
            onClick={() => { setMode(m); setRevealed(false); }}
            className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition ${
              mode === m ? "bg-orange-500 text-white shadow-sm" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Progression selector (practice only) */}
      {!isSong && (
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
      )}

      {isSong && (
        <p className="text-sm text-gray-500 mb-5 leading-relaxed">
          <strong className="text-[#1d1d1f]">{SONG_SECTION.label} of {SONG.title}</strong> — your vocalist wants it in{" "}
          <strong className="text-blue-500 normal-case">{toKey}</strong>. Same numbers, new letters.
        </p>
      )}

      {/* From key */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-3">
        <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-4">
          Original — Key of <span className="text-orange-500 normal-case">{fromKey}</span>
        </p>
        <div className="grid grid-cols-4 gap-3">
          {tokens.map((token, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="w-full aspect-square rounded-xl bg-[#f5f5f7] flex items-center justify-center text-2xl font-bold text-[#1d1d1f] normal-case">
                {token}
              </div>
              <p className="text-sm font-medium text-gray-500 normal-case">{resolveToken(token, fromKey)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Arrow */}
      <div className="text-center text-gray-300 text-2xl mb-3">↓</div>

      {/* To key */}
      <div className="rounded-2xl p-6 shadow-sm mb-6 bg-white">
        <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-4">
          Transposed — Key of <span className="text-blue-500 normal-case">{toKey}</span>
        </p>
        <div className="grid grid-cols-4 gap-3">
          {tokens.map((token, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="w-full aspect-square rounded-xl bg-[#f5f5f7] flex items-center justify-center text-2xl font-bold text-[#1d1d1f] normal-case">
                {token}
              </div>
              {revealed ? (
                <p className="text-sm font-semibold text-blue-500 normal-case">{resolveToken(token, toKey)}</p>
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
            {isSong ? "New Key →" : "Next Progression →"}
          </button>
        )}
      </div>
    </main>
  );
}
