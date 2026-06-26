"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";

type Chord = { label: string; notes: string[] };
type Instrument = "piano" | "guitar";

const KEY_OF_C_1: Chord = { label: "1", notes: ["C3","E3","G3"] };

const LEVELS: { title: string; description: string; chords: Chord[] }[] = [
  {
    title: "Level 1",
    description: "Major chords — 1, 4, 5",
    chords: [
      { label: "1", notes: ["C3","E3","G3"] },
      { label: "4", notes: ["F3","A3","C4"] },
      { label: "5", notes: ["G3","B3","D4"] },
    ],
  },
  {
    title: "Level 2",
    description: "Add diatonic minors — 2, 3, 6, 7",
    chords: [
      { label: "1", notes: ["C3","E3","G3"] },
      { label: "2", notes: ["D3","F3","A3"] },
      { label: "3", notes: ["E3","G3","B3"] },
      { label: "4", notes: ["F3","A3","C4"] },
      { label: "5", notes: ["G3","B3","D4"] },
      { label: "6", notes: ["A3","C4","E4"] },
      { label: "7", notes: ["B3","D4","F4"] },
    ],
  },
  {
    title: "Level 3",
    description: "Add borrowed & chromatic chords",
    chords: [
      { label: "1",     notes: ["C3","E3","G3"] },
      { label: "4",     notes: ["F3","A3","C4"] },
      { label: "5",     notes: ["G3","B3","D4"] },
      { label: "2",     notes: ["D3","F3","A3"] },
      { label: "6",     notes: ["A3","C4","E4"] },
      { label: "Maj 2", notes: ["D3","F#3","A3"] },
      { label: "Maj 3", notes: ["E3","G#3","B3"] },
      { label: "Maj 6", notes: ["A3","C#4","E4"] },
      { label: "b7",    notes: ["Bb3","D4","F4"] },
      { label: "Min 4", notes: ["F3","Ab3","C4"] },
      { label: "Min 5", notes: ["G3","Bb3","D4"] },
    ],
  },
];

// Sampler configs — Tone.js hosted samples
const SAMPLER_CONFIGS: Record<Instrument, { baseUrl: string; urls: Record<string, string> }> = {
  piano: {
    baseUrl: "https://tonejs.github.io/audio/salamander/",
    urls: {
      A0:"A0.mp3", C1:"C1.mp3", "D#1":"Ds1.mp3", "F#1":"Fs1.mp3",
      A1:"A1.mp3", C2:"C2.mp3", "D#2":"Ds2.mp3", "F#2":"Fs2.mp3",
      A2:"A2.mp3", C3:"C3.mp3", "D#3":"Ds3.mp3", "F#3":"Fs3.mp3",
      A3:"A3.mp3", C4:"C4.mp3", "D#4":"Ds4.mp3", "F#4":"Fs4.mp3",
      A4:"A4.mp3", C5:"C5.mp3",
    },
  },
  guitar: {
    baseUrl: "https://nbrosowsky.github.io/tonejs-instruments/samples/guitar-acoustic/",
    urls: {
      E2:"E2.mp3", A2:"A2.mp3", D3:"D3.mp3", G3:"G3.mp3",
      B3:"B3.mp3", E4:"E4.mp3", A4:"A4.mp3",
    },
  },
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function buildRound(chords: Chord[]) {
  const chord = pickRandom(chords);
  const wrongs = chords.filter(c => c.label !== chord.label).sort(() => Math.random() - 0.5).slice(0, 3);
  const options = [...wrongs, chord].sort(() => Math.random() - 0.5);
  return { chord, options };
}

export default function EarPage() {
  const [levelIdx, setLevelIdx] = useState(0);
  const level = LEVELS[levelIdx];

  const [round, setRound] = useState<ReturnType<typeof buildRound> | null>(null);

  useEffect(() => {
    setRound(buildRound(LEVELS[0].chords));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [playing, setPlaying] = useState<"ref" | "chord" | null>(null);
  const [instrument, setInstrument] = useState<Instrument>("piano");
  const [loading, setLoading] = useState(false);
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  const samplerRef = useRef<import("tone").Sampler | null>(null);
  const toneRef = useRef<typeof import("tone") | null>(null);

  // Load Tone.js and sampler eagerly on instrument change
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    (async () => {
      const Tone = await import("tone");
      toneRef.current = Tone;

      if (samplerRef.current) {
        samplerRef.current.dispose();
        samplerRef.current = null;
      }

      const config = SAMPLER_CONFIGS[instrument];
      const timeout = setTimeout(() => { if (!cancelled) setLoading(false); }, 10000);

      const s = new Tone.Sampler({
        urls: config.urls,
        baseUrl: config.baseUrl,
        onload: () => {
          clearTimeout(timeout);
          if (!cancelled) { samplerRef.current = s; setLoading(false); }
        },
      }).toDestination();
    })();

    return () => { cancelled = true; };
  }, [instrument]);

  // iOS requires AudioContext to be resumed synchronously inside a direct user tap.
  // We show a one-time "Enable Audio" button that does this before anything else.
  const unlockAndPlay = useCallback(async (notes: string[], tag: "ref" | "chord") => {
    if (playing !== null) return;

    // Step 1 — resume AudioContext synchronously in the gesture
    const Tone = toneRef.current;
    if (Tone) {
      const ctx = Tone.getContext().rawContext as AudioContext;
      if (ctx.state !== "running") {
        try { ctx.resume(); } catch { /* ignore */ }
      }
    }

    setPlaying(tag);
    // Step 2 — trigger sampler (already loaded)
    try {
      if (Tone) await Tone.start();
      if (samplerRef.current) samplerRef.current.triggerAttackRelease(notes, "2n");
    } catch { /* ignore */ }
    setTimeout(() => setPlaying(null), 1400);
  }, [playing]);

  const handleUnlock = useCallback(async () => {
    const Tone = toneRef.current;
    if (!Tone) return;
    const ctx = Tone.getContext().rawContext as AudioContext;
    try { await ctx.resume(); } catch { /* ignore */ }
    await Tone.start();
    setAudioUnlocked(true);
  }, []);

  const play = unlockAndPlay;

  const next = useCallback(() => {
    const newRound = buildRound(level.chords);
    setRound(newRound);
    setSelected(null);
    play(newRound.chord.notes, "chord");
  }, [level.chords, play]);

  function handleSelect(label: string) {
    if (selected !== null || !round) return;
    setSelected(label);
    setScore(s => ({ correct: s.correct + (label === round.chord.label ? 1 : 0), total: s.total + 1 }));
  }

  function changeLevel(idx: number) {
    setLevelIdx(idx);
    setRound(buildRound(LEVELS[idx].chords));
    setSelected(null);
    setScore({ correct: 0, total: 0 });
  }

  function changeInstrument(inst: Instrument) {
    setInstrument(inst);
    setSelected(null);
  }

  if (!round) return null;
  const isCorrect = selected === round.chord.label;

  return (
    <main className="min-h-screen bg-[#f5f5f7] px-6 py-12 max-w-md mx-auto">
      <Link href="/" className="text-blue-500 text-sm font-medium mb-8 inline-block">← Back</Link>

      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-4xl font-bold text-[#1d1d1f] tracking-tight mb-1">Ear Training</h1>
          <p className="text-gray-500 text-sm">Key of C — what chord is this?</p>
        </div>
        <div className="bg-white rounded-2xl px-4 py-3 shadow-sm text-center">
          <p className="text-xl font-bold text-[#1d1d1f]">{score.correct}/{score.total}</p>
          <p className="text-xs text-gray-400">score</p>
        </div>
      </div>

      {/* Instrument selector */}
      <div className="bg-white rounded-2xl p-1.5 shadow-sm flex gap-1 mb-4">
        {([["piano","Grand Piano"],["guitar","Acoustic Guitar"]] as [Instrument, string][]).map(([inst, label]) => (
          <button
            key={inst}
            onClick={() => changeInstrument(inst)}
            className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition ${
              inst === instrument ? "bg-[#1d1d1f] text-white shadow-sm" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading && (
        <p className="text-xs text-center text-gray-400 mb-3">Loading samples…</p>
      )}

      {!audioUnlocked && !loading && (
        <button
          onClick={async () => { await handleUnlock(); }}
          className="w-full bg-[#1d1d1f] text-white rounded-2xl py-4 font-semibold mb-4 active:scale-95 transition"
        >
          🔊 Tap to Enable Audio
        </button>
      )}

      {/* Level selector */}
      <div className="bg-white rounded-2xl p-1.5 shadow-sm flex gap-1 mb-2">
        {LEVELS.map((l, i) => (
          <button
            key={i}
            onClick={() => changeLevel(i)}
            className={`flex-1 rounded-xl py-2 text-sm font-semibold transition ${
              i === levelIdx ? "bg-purple-500 text-white shadow-sm" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {l.title}
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-400 text-center mb-6">{level.description}</p>

      {/* 1 chord reference */}
      <div className="bg-white rounded-2xl p-5 shadow-sm mb-3 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-1">Reference</p>
          <p className="font-semibold text-[#1d1d1f]">The <span className="text-purple-500">1</span> chord — C major</p>
        </div>
        <button
          onClick={() => play(KEY_OF_C_1.notes, "ref")}
          disabled={playing !== null || loading}
          className={`w-12 h-12 rounded-full text-lg font-bold flex items-center justify-center transition
            ${playing === "ref" ? "bg-purple-200 text-purple-400 scale-95" : "bg-purple-100 text-purple-500 hover:bg-purple-200 active:scale-95"}`}
        >
          {playing === "ref" ? "♪" : "▶"}
        </button>
      </div>

      {/* Mystery chord */}
      <div className="bg-white rounded-2xl p-5 shadow-sm mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-1">Mystery Chord</p>
          <p className="font-semibold text-[#1d1d1f]">Which number is this?</p>
        </div>
        <button
          onClick={() => play(round.chord.notes, "chord")}
          disabled={playing !== null || loading}
          className={`w-12 h-12 rounded-full text-lg font-bold flex items-center justify-center transition
            ${playing === "chord" ? "bg-purple-500 text-white scale-95 cursor-wait" : "bg-purple-500 text-white hover:bg-purple-600 active:scale-95"}`}
        >
          {playing === "chord" ? "♪" : "▶"}
        </button>
      </div>

      {/* Answer options */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {round.options.map((opt) => {
          let style = "bg-white text-[#1d1d1f] shadow-sm hover:shadow";
          if (selected !== null) {
            if (opt.label === round.chord.label) style = "bg-green-500 text-white";
            else if (opt.label === selected) style = "bg-red-400 text-white";
            else style = "bg-white text-gray-300";
          }
          return (
            <button
              key={opt.label}
              onClick={() => handleSelect(opt.label)}
              className={`${style} rounded-2xl py-4 text-base font-bold transition`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {selected !== null && (
        <p className={`text-center mb-4 font-semibold ${isCorrect ? "text-green-500" : "text-red-400"}`}>
          {isCorrect ? `Correct! That's the ${round.chord.label}` : `That was the ${round.chord.label}`}
        </p>
      )}

      <button
        onClick={selected !== null ? next : () => play(round.chord.notes, "chord")}
        className="w-full bg-purple-500 hover:bg-purple-600 text-white rounded-2xl py-4 font-semibold transition"
      >
        {selected !== null ? "Next Chord →" : "Play Again"}
      </button>
    </main>
  );
}
