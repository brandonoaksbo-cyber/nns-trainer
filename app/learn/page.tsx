"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";

// ————— Audio —————

const PIANO_CONFIG = {
  baseUrl: "https://tonejs.github.io/audio/salamander/",
  urls: {
    A0:"A0.mp3", C1:"C1.mp3", "D#1":"Ds1.mp3", "F#1":"Fs1.mp3",
    A1:"A1.mp3", C2:"C2.mp3", "D#2":"Ds2.mp3", "F#2":"Fs2.mp3",
    A2:"A2.mp3", C3:"C3.mp3", "D#3":"Ds3.mp3", "F#3":"Fs3.mp3",
    A3:"A3.mp3", C4:"C4.mp3", "D#4":"Ds4.mp3", "F#4":"Fs4.mp3",
    A4:"A4.mp3", C5:"C5.mp3",
  },
};

function usePiano() {
  const samplerRef = useRef<import("tone").Sampler | null>(null);
  const toneRef = useRef<typeof import("tone") | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const Tone = await import("tone");
      if (cancelled) return;
      toneRef.current = Tone;
      const s = new Tone.Sampler({
        urls: PIANO_CONFIG.urls,
        baseUrl: PIANO_CONFIG.baseUrl,
        onload: () => { if (!cancelled) samplerRef.current = s; },
      }).toDestination();
    })();
    return () => { cancelled = true; };
  }, []);

  // Must be called from inside a user tap so iOS lets us start audio.
  const play = useCallback(async (notes: string[], dur: string = "2n") => {
    const Tone = toneRef.current;
    if (!Tone) return;
    const ctx = Tone.getContext().rawContext as AudioContext;
    if (ctx.state !== "running") { try { ctx.resume(); } catch {} }
    try {
      await Tone.start();
      samplerRef.current?.triggerAttackRelease(notes, dur);
    } catch {}
  }, []);

  const transpose = useCallback((notes: string[], semitones: number): string[] => {
    const Tone = toneRef.current;
    if (!Tone || semitones === 0) return notes;
    return notes.map(n => Tone.Frequency(n).transpose(semitones).toNote());
  }, []);

  return { play, transpose };
}

// ————— Music data (key of C) —————

const SCALE_NOTES = ["C4","D4","E4","F4","G4","A4","B4"];
const SCALE_LETTERS = ["C","D","E","F","G","A","B"];

const CHORD_NOTES: Record<string, string[]> = {
  "1":   ["C3","E3","G3"],
  "2m":  ["D3","F3","A3"],
  "4":   ["F3","A3","C4"],
  "5":   ["G3","B3","D4"],
  "6m":  ["A3","C4","E4"],
  "1/3": ["E2","C3","E3","G3"],
  "1-bass": ["C2","C3","E3","G3"],
};

// Holy Forever (Chris Tomlin) — progressions and keys are facts; no lyrics.
const VERSE_LETTERS = ["C","F","C","Am","G","F"];
const VERSE_NUMBERS = ["1","4","1","6m","5","4"];
const CHORUS_NUMBERS = ["4","6m","5","1/3","6m","2m","5","1"];

const SCALES: Record<string, string[]> = {
  C: ["C","D","E","F","G","A","B"],
  G: ["G","A","B","C","D","E","F#"],
  D: ["D","E","F#","G","A","B","C#"],
  A: ["A","B","C#","D","E","F#","G#"],
  E: ["E","F#","G#","A","B","C#","D#"],
};
const KEY_OFFSETS: Record<string, number> = { C: 0, G: -5, D: 2, A: -3, E: 4 };

function degreeToChord(token: string, key: string): string {
  const [base, bass] = token.split("/");
  const minor = base.endsWith("m");
  const deg = parseInt(base, 10);
  let name = SCALES[key][deg - 1] + (minor ? "m" : "");
  if (bass) name += "/" + SCALES[key][parseInt(bass, 10) - 1];
  return name;
}

// ————— Small shared pieces —————

function Tag({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-3">{children}</p>;
}

function QuizOptions({
  options, answer, onCorrect, prompt,
}: { options: string[]; answer: string; onCorrect: () => void; prompt?: string }) {
  const [picked, setPicked] = useState<string | null>(null);
  const solved = picked === answer;

  function pick(opt: string) {
    if (solved) return;
    setPicked(opt);
    if (opt === answer) onCorrect();
  }

  return (
    <div>
      {prompt && <p className="text-gray-500 mb-4 leading-relaxed">{prompt}</p>}
      <div className="grid grid-cols-4 gap-2">
        {options.map(opt => {
          let style = "bg-white text-[#1d1d1f] shadow-sm";
          if (picked !== null) {
            if (opt === answer && solved) style = "bg-green-500 text-white";
            else if (opt === picked) style = "bg-red-400 text-white";
          }
          return (
            <button key={opt} onClick={() => pick(opt)}
              className={`${style} rounded-2xl py-3.5 text-base font-bold transition active:scale-95 normal-case`}>
              {opt}
            </button>
          );
        })}
      </div>
      {picked !== null && !solved && (
        <p className="text-sm text-red-400 font-medium mt-3 text-center">Almost — count it out and try again.</p>
      )}
    </div>
  );
}

// ————— Steps —————

function Step1({ play, onDone }: { play: (n: string[]) => void; onDone: () => void }) {
  const [tapped, setTapped] = useState<Set<number>>(new Set());
  const allTapped = tapped.size === 7;
  useEffect(() => { if (allTapped) onDone(); }, [allTapped, onDone]);

  return (
    <div>
      <Tag>Step 1 · The Foundation</Tag>
      <h2 className="text-3xl font-bold text-[#1d1d1f] tracking-tight leading-tight mb-3">Count to 7.</h2>
      <p className="text-gray-500 mb-6 leading-relaxed">
        The key of C has 7 notes. Number them 1 to 7. Tap each one — that&apos;s the whole foundation.
      </p>
      <div className="grid grid-cols-7 gap-1.5 mb-4">
        {SCALE_NOTES.map((note, i) => (
          <button key={note}
            onClick={() => { play([note]); setTapped(prev => new Set(prev).add(i)); }}
            className={`aspect-square rounded-xl flex flex-col items-center justify-center font-bold transition active:scale-95
              ${tapped.has(i) ? "bg-blue-500 text-white" : "bg-blue-50 text-blue-600"}`}>
            <span className="text-xl">{i + 1}</span>
            <span className={`text-[10px] font-medium ${tapped.has(i) ? "text-blue-100" : "text-blue-400"}`}>{SCALE_LETTERS[i]}</span>
          </button>
        ))}
      </div>
      {allTapped && (
        <p className="text-center text-green-500 font-semibold">That&apos;s it. You just numbered the key of C. 🎉</p>
      )}
    </div>
  );
}

function Step2({ play, onDone }: { play: (n: string[]) => void; onDone: () => void }) {
  const QUESTIONS: { letter: string; answer: string; note: string }[] = [
    { letter: "G",  answer: "5",  note: "Count it: C-1, D-2, E-3, F-4, G-5." },
    { letter: "F",  answer: "4",  note: "F is the 4th note — so F is the 4." },
    { letter: "Am", answer: "6m", note: "A is the 6th — and minor chords get a little m. Am = 6m." },
  ];
  const [qIdx, setQIdx] = useState(0);
  const [showNote, setShowNote] = useState(false);
  const done = qIdx >= QUESTIONS.length;
  useEffect(() => { if (done) onDone(); }, [done, onDone]);

  const q = QUESTIONS[Math.min(qIdx, QUESTIONS.length - 1)];

  return (
    <div>
      <Tag>Step 2 · Your Chords Have Numbers</Tag>
      <h2 className="text-3xl font-bold text-[#1d1d1f] tracking-tight leading-tight mb-3">
        You already play these.
      </h2>
      <p className="text-gray-500 mb-6 leading-relaxed">
        Every chord you know has a number in the key of C. C is the 1st note, so C is the <strong className="text-[#1d1d1f]">1</strong> chord.
      </p>

      {!done ? (
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <p className="text-center text-5xl font-bold text-[#1d1d1f] mb-1 normal-case">{q.letter}</p>
          <p className="text-center text-xs text-gray-400 mb-5">({qIdx + 1} of {QUESTIONS.length})</p>
          <QuizOptions
            key={qIdx}
            prompt={`You've played ${q.letter} a thousand times. What number is it in C?`}
            options={["1","4","5","6m"]}
            answer={q.answer}
            onCorrect={() => {
              play(CHORD_NOTES[q.answer]);
              setShowNote(true);
              setTimeout(() => { setShowNote(false); setQIdx(i => i + 1); }, 1800);
            }}
          />
          {showNote && <p className="text-sm text-green-600 font-medium mt-4 text-center">{q.note}</p>}
        </div>
      ) : (
        <p className="text-center text-green-500 font-semibold">G is the 5. F is the 4. Am is the 6m. You just learned the language. 🎉</p>
      )}
    </div>
  );
}

function Step3({ play, onDone }: { play: (n: string[]) => void; onDone: () => void }) {
  const [converted, setConverted] = useState(0);
  const [playingIdx, setPlayingIdx] = useState(-1);
  const allDone = converted >= VERSE_LETTERS.length;
  useEffect(() => { if (allDone) onDone(); }, [allDone, onDone]);

  async function playBack() {
    for (let i = 0; i < VERSE_NUMBERS.length; i++) {
      setPlayingIdx(i);
      play(CHORD_NOTES[VERSE_NUMBERS[i]]);
      await new Promise(r => setTimeout(r, 900));
    }
    setPlayingIdx(-1);
  }

  return (
    <div>
      <Tag>Step 3 · A Real Chart</Tag>
      <h2 className="text-3xl font-bold text-[#1d1d1f] tracking-tight leading-tight mb-3">
        This is a song you know.
      </h2>
      <p className="text-gray-500 mb-6 leading-relaxed">
        The verse of <strong className="text-[#1d1d1f]">Holy Forever</strong> (key of C). Convert it, one chord at a time.
      </p>

      <div className="grid grid-cols-6 gap-1.5 mb-6">
        {VERSE_LETTERS.map((letter, i) => (
          <div key={i}
            className={`aspect-square rounded-xl flex items-center justify-center text-lg font-bold transition normal-case
              ${i < converted
                ? (playingIdx === i ? "bg-blue-500 text-white scale-105" : "bg-green-50 text-green-600")
                : i === converted ? "bg-white text-[#1d1d1f] shadow-md ring-2 ring-blue-400" : "bg-white text-gray-300 shadow-sm"}`}>
            {i < converted ? VERSE_NUMBERS[i] : letter}
          </div>
        ))}
      </div>

      {!allDone ? (
        <QuizOptions
          key={converted}
          prompt={`${VERSE_LETTERS[converted]} → which number?`}
          options={["1","4","5","6m"]}
          answer={VERSE_NUMBERS[converted]}
          onCorrect={() => {
            play(CHORD_NOTES[VERSE_NUMBERS[converted]]);
            setTimeout(() => setConverted(c => c + 1), 600);
          }}
        />
      ) : (
        <div className="text-center">
          <p className="text-green-500 font-semibold mb-4">You just read your first number chart — and it was a real song. 🎉</p>
          <button onClick={playBack} disabled={playingIdx >= 0}
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-2xl px-8 py-3.5 font-semibold transition active:scale-95 disabled:opacity-60">
            {playingIdx >= 0 ? "Playing…" : "▶ Hear the verse"}
          </button>
        </div>
      )}
    </div>
  );
}

function Step4({ play, onDone }: { play: (n: string[]) => void; onDone: () => void }) {
  const QUESTIONS: { fancy: string; answer: string }[] = [
    { fancy: "Am7",  answer: "6m" },
    { fancy: "F2",   answer: "4" },
    { fancy: "Gsus", answer: "5" },
  ];
  const [qIdx, setQIdx] = useState(0);
  const done = qIdx >= QUESTIONS.length;
  useEffect(() => { if (done) onDone(); }, [done, onDone]);
  const q = QUESTIONS[Math.min(qIdx, QUESTIONS.length - 1)];

  return (
    <div>
      <Tag>Step 4 · The Decorations</Tag>
      <h2 className="text-3xl font-bold text-[#1d1d1f] tracking-tight leading-tight mb-3">
        Ignore the outfit.
      </h2>
      <p className="text-gray-500 mb-6 leading-relaxed">
        Real charts dress chords up — Am<sup>7</sup>, F<sup>2</sup>, G<sup>sus</sup>. The little stuff is optional flavor.
        <strong className="text-[#1d1d1f]"> Play the big number and you&apos;re right.</strong>
      </p>

      {!done ? (
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <p className="text-center text-5xl font-bold text-[#1d1d1f] mb-1 normal-case">{q.fancy}</p>
          <p className="text-center text-xs text-gray-400 mb-5">({qIdx + 1} of {QUESTIONS.length})</p>
          <QuizOptions
            key={qIdx}
            prompt="Underneath the decoration — what's the number?"
            options={["1","4","5","6m"]}
            answer={q.answer}
            onCorrect={() => {
              play(CHORD_NOTES[q.answer]);
              setTimeout(() => setQIdx(i => i + 1), 1200);
            }}
          />
        </div>
      ) : (
        <p className="text-center text-green-500 font-semibold">
          Everything scary on a chart is skippable. You always know the skeleton. 🎉
        </p>
      )}
    </div>
  );
}

function Step5({ play, onDone }: { play: (n: string[]) => void; onDone: () => void }) {
  const [heard, setHeard] = useState<Set<string>>(new Set());
  const [solved, setSolved] = useState(false);
  useEffect(() => { if (solved) onDone(); }, [solved, onDone]);

  function hear(label: string, notes: string[]) {
    play(notes);
    setHeard(prev => new Set(prev).add(label));
  }

  return (
    <div>
      <Tag>Step 5 · The Slash</Tag>
      <h2 className="text-3xl font-bold text-[#1d1d1f] tracking-tight leading-tight mb-3">
        Chord on the left, bass on the right.
      </h2>
      <p className="text-gray-500 mb-6 leading-relaxed">
        The chorus has one new thing: <strong className="text-[#1d1d1f] normal-case">C/E</strong>. It means play C, but put an E in the bass.
        In numbers: <strong className="text-[#1d1d1f]">1/3</strong>. Hear the difference:
      </p>

      <div className="flex gap-3 mb-6">
        <button onClick={() => hear("1", CHORD_NOTES["1-bass"])}
          className={`flex-1 rounded-2xl py-4 font-bold transition active:scale-95 ${heard.has("1") ? "bg-blue-500 text-white" : "bg-white text-[#1d1d1f] shadow-sm"}`}>
          <span className="block text-xl">1</span>
          <span className={`block text-xs font-medium normal-case ${heard.has("1") ? "text-blue-100" : "text-gray-400"}`}>C — bass on C</span>
        </button>
        <button onClick={() => hear("1/3", CHORD_NOTES["1/3"])}
          className={`flex-1 rounded-2xl py-4 font-bold transition active:scale-95 ${heard.has("1/3") ? "bg-blue-500 text-white" : "bg-white text-[#1d1d1f] shadow-sm"}`}>
          <span className="block text-xl normal-case">1/3</span>
          <span className={`block text-xs font-medium normal-case ${heard.has("1/3") ? "text-blue-100" : "text-gray-400"}`}>C/E — bass moves to E</span>
        </button>
      </div>

      {heard.size >= 2 && !solved && (
        <QuizOptions
          prompt="Your turn — F/A in numbers?"
          options={["4/6","1/3","5/7","6m"]}
          answer={"4/6"}
          onCorrect={() => setSolved(true)}
        />
      )}
      {solved && (
        <p className="text-center text-green-500 font-semibold mt-4">
          Exactly. F is the 4, A is the 6 — F/A is 4/6. Slash chords: solved forever. 🎉
        </p>
      )}
    </div>
  );
}

function Step6({ play, transpose }: { play: (n: string[]) => void; transpose: (n: string[], s: number) => string[] }) {
  const [songKey, setSongKey] = useState("C");
  const [playingIdx, setPlayingIdx] = useState(-1);

  async function playChorus() {
    for (let i = 0; i < CHORUS_NUMBERS.length; i++) {
      setPlayingIdx(i);
      play(transpose(CHORD_NOTES[CHORUS_NUMBERS[i]], KEY_OFFSETS[songKey]));
      await new Promise(r => setTimeout(r, 850));
    }
    setPlayingIdx(-1);
  }

  return (
    <div>
      <Tag>Step 6 · The Payoff</Tag>
      <h2 className="text-3xl font-bold text-[#1d1d1f] tracking-tight leading-tight mb-3">
        &ldquo;Can we do it in G? C is too high.&rdquo;
      </h2>
      <p className="text-gray-500 mb-6 leading-relaxed">
        Every worship musician hears this. Watch what happens to the chorus — the numbers <strong className="text-[#1d1d1f]">don&apos;t move</strong>.
      </p>

      <div className="bg-white rounded-2xl p-1.5 shadow-sm flex gap-1 mb-5">
        {Object.keys(SCALES).map(k => (
          <button key={k} onClick={() => setSongKey(k)}
            className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition ${k === songKey ? "bg-blue-500 text-white shadow-sm" : "text-gray-400 hover:text-gray-600"}`}>
            {k}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl p-5 shadow-sm mb-5">
        <Tag>Chorus · Key of {songKey}</Tag>
        <div className="grid grid-cols-8 gap-1 mb-3">
          {CHORUS_NUMBERS.map((num, i) => (
            <div key={i} className={`aspect-square rounded-lg flex items-center justify-center text-sm font-bold transition normal-case
              ${playingIdx === i ? "bg-blue-500 text-white scale-110" : "bg-blue-50 text-blue-600"}`}>
              {num}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-8 gap-1">
          {CHORUS_NUMBERS.map((num, i) => (
            <div key={i} className="text-center text-[10px] font-medium text-gray-400 normal-case leading-tight">
              {degreeToChord(num, songKey)}
            </div>
          ))}
        </div>
      </div>

      <button onClick={playChorus} disabled={playingIdx >= 0}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-2xl py-4 font-semibold transition active:scale-95 disabled:opacity-60 mb-6">
        {playingIdx >= 0 ? "Playing…" : `▶ Play the chorus in ${songKey}`}
      </button>

      <div className="bg-blue-500 rounded-3xl p-7 text-center text-white">
        <p className="text-2xl font-bold mb-2">You didn&apos;t learn a new song.</p>
        <p className="text-blue-100 mb-6">You already knew it. That&apos;s the number system. 🎉</p>
        <div className="flex gap-3 justify-center">
          <Link href="/read" className="bg-white text-blue-500 font-bold rounded-2xl px-6 py-3 hover:bg-blue-50 transition">
            Read Charts →
          </Link>
          <Link href="/transpose" className="bg-blue-400 text-white font-bold rounded-2xl px-6 py-3 hover:bg-blue-300 transition">
            Transpose →
          </Link>
        </div>
      </div>
    </div>
  );
}

// ————— Page —————

const TOTAL_STEPS = 6;

export default function LearnPage() {
  const { play, transpose } = usePiano();
  const [step, setStep] = useState(0);
  const [maxUnlocked, setMaxUnlocked] = useState(0);
  const [stepDone, setStepDone] = useState(false);

  const markDone = useCallback(() => setStepDone(true), []);

  function goTo(idx: number) {
    if (idx > maxUnlocked) return;
    setStep(idx);
    setStepDone(idx < maxUnlocked);
  }

  function next() {
    const n = Math.min(step + 1, TOTAL_STEPS - 1);
    setMaxUnlocked(m => Math.max(m, n));
    setStep(n);
    setStepDone(n < maxUnlocked);
  }

  return (
    <main className="min-h-screen bg-[#f5f5f7] px-6 py-12 max-w-md mx-auto flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <Link href="/" className="text-blue-500 text-sm font-medium">← Back</Link>
        <div className="flex gap-1.5">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <button key={i} onClick={() => goTo(i)}
              className={`rounded-full transition-all duration-300 ${i === step ? "w-5 h-2 bg-blue-500" : i <= maxUnlocked ? "w-2 h-2 bg-blue-300" : "w-2 h-2 bg-gray-200"}`} />
          ))}
        </div>
      </div>

      {step === 0 && (
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#1d1d1f] tracking-tight leading-tight mb-2">
            If you can count to 7, you can do this.
          </h1>
          <p className="text-gray-400">One song. Six small steps. About 3 minutes.</p>
        </div>
      )}

      <div className="flex-1">
        {step === 0 && <Step1 play={play} onDone={markDone} />}
        {step === 1 && <Step2 play={play} onDone={markDone} />}
        {step === 2 && <Step3 play={play} onDone={markDone} />}
        {step === 3 && <Step4 play={play} onDone={markDone} />}
        {step === 4 && <Step5 play={play} onDone={markDone} />}
        {step === 5 && <Step6 play={play} transpose={transpose} />}
      </div>

      {step < TOTAL_STEPS - 1 && (
        <button onClick={next}
          className={`w-full rounded-2xl py-4 font-semibold transition active:scale-95 mt-8
            ${stepDone ? "bg-blue-500 hover:bg-blue-600 text-white" : "bg-white text-gray-400 shadow-sm"}`}>
          {stepDone ? "Next →" : "Skip ahead →"}
        </button>
      )}
    </main>
  );
}
