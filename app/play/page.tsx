"use client";

import { useState } from "react";
import Link from "next/link";
import PianoChord from "./piano";
import GuitarChord, { GUITAR_CHORDS } from "./guitar";

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
  "F#": ["F#","G#m","A#m","B","C#","D#m","Fdim"],
};

const KEYS = Object.keys(SCALE_MAP);
const INSTRUMENTS = ["Piano", "Guitar"] as const;
type Instrument = typeof INSTRUMENTS[number];

// Worship piano voicings — spread, open, modern. Notes include octave number (C3, E4, etc.)
// Left hand = lower octave, right hand = upper octave, avoids stacked triads
const WORSHIP_PIANO: Record<string, { notes: string[]; label: string }> = {
  // Major
  "C":    { notes: ["C3","G3","D4","G4","C4"],       label: "Cadd9 voicing" },
  "D":    { notes: ["D3","A3","D4","F#4","A4"],       label: "D open voicing" },
  "E":    { notes: ["E3","B3","E4","G#4","B4"],       label: "E open voicing" },
  "F":    { notes: ["F3","C4","E4","A4"],             label: "Fmaj7 voicing" },
  "G":    { notes: ["G3","D4","G4","B4"],             label: "G open voicing" },
  "A":    { notes: ["A3","E4","A4","C#4"],            label: "A open voicing" },
  "B":    { notes: ["B3","F#4","B4","D#4"],           label: "B voicing" },
  "Bb":   { notes: ["Bb3","F4","Bb4","D4"],           label: "Bb voicing" },
  "Eb":   { notes: ["Eb3","Bb3","Eb4","G4"],          label: "Eb voicing" },
  "Ab":   { notes: ["Ab3","Eb4","Ab4","C4"],          label: "Ab voicing" },
  "Db":   { notes: ["Db3","Ab3","Db4","F4"],          label: "Db voicing" },
  "F#":   { notes: ["F#3","C#4","F#4","A#4"],         label: "F# voicing" },
  // Minor — often voiced with 7th for worship
  "Dm":   { notes: ["D3","A3","C4","F4","A4"],        label: "Dm7 voicing" },
  "Em":   { notes: ["E3","B3","D4","G4","B4"],        label: "Em7 voicing" },
  "Fm":   { notes: ["F3","C4","Eb4","Ab4"],           label: "Fm voicing" },
  "Gm":   { notes: ["G3","D4","F4","Bb4"],            label: "Gm7 voicing" },
  "Am":   { notes: ["A3","E4","G4","C4"],             label: "Am7 voicing" },
  "Bm":   { notes: ["B3","F#4","A4","D4"],            label: "Bm7 voicing" },
  "Cm":   { notes: ["C3","G3","Eb4","G4"],            label: "Cm voicing" },
  "Bbm":  { notes: ["Bb3","F4","Ab4","Db4"],          label: "Bbm voicing" },
  "C#m":  { notes: ["C#3","G#3","B3","E4","G#4"],     label: "C#m7 voicing" },
  "C#":   { notes: ["C#3","G#3","C#4","F4"],           label: "C# voicing" },
  "A#m":  { notes: ["A#3","F4","G#4","C#4"],           label: "A#m voicing" },
  "D#m":  { notes: ["D#3","A#3","C#4","F#4"],          label: "D#m voicing" },
  "Fdim": { notes: ["F3","G#3","B3"],                   label: "Fdim" },
  "F#m":  { notes: ["F#3","C#4","A4","E4"],           label: "F#m7 voicing" },
  "G#m":  { notes: ["G#3","D#4","F#4","B4"],          label: "G#m7 voicing" },
  "Ebm":  { notes: ["Eb3","Bb3","Db4","Gb4"],         label: "Ebm voicing" },
  "Abm":  { notes: ["Ab3","Eb4","Gb4","Cb4"],         label: "Abm voicing" },
  // Dim
  "Bdim":  { notes: ["B3","D4","F4"],                 label: "Bdim" },
  "C#dim": { notes: ["C#3","E4","G4"],                label: "C#dim" },
  "D#dim": { notes: ["D#3","F#4","A4"],               label: "D#dim" },
  "Edim":  { notes: ["E3","G4","Bb4"],                label: "Edim" },
  "F#dim": { notes: ["F#3","A4","C4"],                label: "F#dim" },
  "Adim":  { notes: ["A3","C4","Eb4"],                label: "Adim" },
};

// Capo recommendations for hard keys — G, C (Cadd9), D (Dsus2), E shapes only
const CAPO_MAP: Record<string, { capo: number; shape: string; key: string }> = {
  Ab: { capo: 4, shape: "G shape",     key: "E" },
  Bb: { capo: 3, shape: "G shape",     key: "G" },
  B:  { capo: 4, shape: "G shape",     key: "G" },
  Db: { capo: 1, shape: "C shape",     key: "C" },
  Eb: { capo: 3, shape: "C shape",     key: "C" },
  F:  { capo: 3, shape: "D shape",     key: "D" },
  "F#": { capo: 2, shape: "E shape",   key: "E" },
};

const PROGRESSIONS = [
  { label: "1 · 5 · 6 · 4",  nums: [1, 5, 6, 4] },
  { label: "1 · 6 · 4 · 5",  nums: [1, 6, 4, 5] },
  { label: "6 · 4 · 1 · 5",  nums: [6, 4, 1, 5] },
  { label: "6 · 2 · 4 · 5",  nums: [6, 2, 4, 5] },
  { label: "1 · 3 · 6 · 4",  nums: [1, 3, 6, 4] },
  { label: "1 · 2 · 6 · 4",  nums: [1, 2, 6, 4] },
];

function getChordName(num: number, key: string): string {
  return SCALE_MAP[key]?.[num - 1] ?? "";
}

// Strip quality to get guitar lookup key (C#m → C#m, Bdim → Bdim, F#m → F#m)
function guitarKey(name: string): string {
  if (GUITAR_CHORDS[name]) return name;
  // try root only
  const root = name.replace(/m$|dim$/, "");
  return root;
}

export default function PlayPage() {
  const [key, setKey] = useState("G");
  const [instrument, setInstrument] = useState<Instrument>("Piano");
  const [progIdx, setProgIdx] = useState(0);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  const progression = PROGRESSIONS[progIdx];

  function toggleChord(i: number) {
    setActiveIdx(activeIdx === i ? null : i);
  }

  return (
    <main className="min-h-screen bg-[#f5f5f7] px-6 py-12 max-w-xl mx-auto">
      <Link href="/" className="text-blue-500 text-sm font-medium mb-8 inline-block">← Back</Link>

      <h1 className="text-4xl font-bold text-[#1d1d1f] tracking-tight mb-1">Play Along</h1>
      <p className="text-gray-500 mb-8">Tap a chord to see where to put your fingers.</p>

      {/* Instrument tabs */}
      <div className="bg-white rounded-2xl p-1.5 shadow-sm flex gap-1 mb-6">
        {INSTRUMENTS.map((ins) => (
          <button
            key={ins}
            onClick={() => { setInstrument(ins); setActiveIdx(null); }}
            className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition ${
              ins === instrument ? "bg-[#1d1d1f] text-white shadow-sm" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {ins}
          </button>
        ))}
      </div>

      {/* Key + Progression selectors */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1">
          <label className="text-xs font-semibold tracking-widest text-gray-400 uppercase block mb-2">Key</label>
          <select
            value={key}
            onChange={(e) => { setKey(e.target.value); setActiveIdx(null); setRevealed(false); }}
            className="w-full bg-white border-0 rounded-xl px-4 py-3 text-[#1d1d1f] font-medium shadow-sm appearance-none"
          >
            {KEYS.map((k) => <option key={k}>{k}</option>)}
          </select>
        </div>
        <div className="flex-[2]">
          <label className="text-xs font-semibold tracking-widest text-gray-400 uppercase block mb-2">Progression</label>
          <select
            value={progIdx}
            onChange={(e) => { setProgIdx(Number(e.target.value)); setActiveIdx(null); setRevealed(false); }}
            className="w-full bg-white border-0 rounded-xl px-4 py-3 text-[#1d1d1f] font-medium shadow-sm appearance-none"
          >
            {PROGRESSIONS.map((p, i) => <option key={i} value={i}>{p.label}</option>)}
          </select>
        </div>
      </div>

      {/* Capo tip — guitar only, hard keys only */}
      {instrument === "Guitar" && CAPO_MAP[key] && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 mb-4 flex items-center gap-3">
          <span className="text-xl">🎸</span>
          <div>
            <p className="text-sm font-semibold text-amber-800">
              Capo {CAPO_MAP[key].capo} — play {CAPO_MAP[key].shape}
            </p>
            <p className="text-xs text-amber-600">Diagrams shown as open {CAPO_MAP[key].shape} shapes</p>
          </div>
        </div>
      )}

      {/* Chord cards */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {progression.nums.map((num, i) => {
          const chordName = getChordName(num, key);
          const isActive = activeIdx === i;
          return (
            <button
              key={i}
              onClick={() => toggleChord(i)}
              className={`rounded-2xl py-5 flex flex-col items-center gap-1 transition shadow-sm ${
                isActive ? "bg-blue-500 text-white shadow-md scale-105" : "bg-white text-[#1d1d1f] hover:shadow"
              }`}
            >
              <span className="text-2xl font-bold">{num}</span>
              {revealed && (
                <span className={`text-xs font-medium ${isActive ? "text-blue-100" : "text-gray-400"}`}>
                  {chordName}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <button
        onClick={() => { setRevealed(!revealed); setActiveIdx(null); }}
        className="w-full bg-white hover:bg-gray-50 text-[#1d1d1f] rounded-2xl py-3 font-semibold shadow-sm transition mb-6 text-sm"
      >
        {revealed ? "Hide chord names" : "Reveal chord names"}
      </button>

      {/* Diagram panel */}
      {activeIdx !== null && (() => {
        const num = progression.nums[activeIdx];
        const chordName = getChordName(num, key);
        const capo = CAPO_MAP[key];
        // For guitar in capo keys, show the open shape from the capo key instead
        const guitarLookupKey = instrument === "Guitar" && capo ? capo.key : key;
        const guitarChordName = getChordName(num, guitarLookupKey);
        const pianoVoicing = WORSHIP_PIANO[chordName];
        const guitarShape = GUITAR_CHORDS[guitarKey(guitarChordName)];

        return (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-start mb-5">
              <div>
                <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-1">
                  {key} · {num} chord
                </p>
                <p className="text-2xl font-bold text-[#1d1d1f]">{chordName}</p>
                {instrument === "Piano" && pianoVoicing && (
                  <p className="text-xs text-blue-500 mt-0.5">{pianoVoicing.label}</p>
                )}
                {instrument === "Guitar" && guitarShape && (
                  <p className="text-xs text-blue-500 mt-0.5">
                    {guitarShape.name} shape{capo ? ` (capo ${capo.capo})` : ""}
                  </p>
                )}
              </div>
              <button onClick={() => setActiveIdx(null)} className="text-gray-300 hover:text-gray-500 text-xl">✕</button>
            </div>

            {instrument === "Piano" && (
              pianoVoicing
                ? <PianoChord notes={pianoVoicing.notes} />
                : <p className="text-sm text-gray-400 text-center py-4">Voicing not available yet.</p>
            )}

            {instrument === "Guitar" && (
              guitarShape
                ? <GuitarChord chord={guitarShape} />
                : <p className="text-sm text-gray-400 text-center py-4">Shape not available yet.</p>
            )}

            {/* Note breakdown */}
            {instrument === "Piano" && pianoVoicing && (
              <div className="mt-5 pt-4 border-t border-[#f5f5f7] flex flex-wrap gap-2 justify-center">
                {[...new Set(pianoVoicing.notes.map(n => n.slice(0,-1)))].map((note) => (
                  <div key={note} className="bg-blue-50 text-blue-600 font-semibold text-sm rounded-lg px-3 py-1">
                    {note}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })()}
    </main>
  );
}
