"use client";

import { useState, useRef, useEffect, useCallback } from "react";

// The drill caller — simulates a teacher calling numbers in real time while
// the student plays from memory. Hands-free once started: the phone sits on
// a music stand, the app calls the next number on a beat grid, and the
// player reacts. No mic, no grading — an honest self-report at the end.

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

// Mirrors how the drill is taught in person: anchor on 1-4-5, then weave in
// the 6, the 2, and finally the 3 — always coming back to the anchors.
const STAGES = [
  [1, 4, 5],
  [1, 4, 5, 6],
  [1, 4, 5, 6, 2],
  [1, 4, 5, 6, 2, 3],
];
const CALLS_PER_STAGE = 8;
const ANCHORS = new Set([1, 4, 5]);
const BEATS_PER_CALL = 4;
const DRILL_SECONDS = 120;

const WORDS: Record<number, string> = { 1: "one", 2: "two", 3: "three", 4: "four", 5: "five", 6: "six", 7: "seven" };

const BPM_OPTIONS = [
  { bpm: 50,  label: "Relaxed" },
  { bpm: 70,  label: "Steady" },
  { bpm: 90,  label: "Quick" },
  { bpm: 110, label: "Reaction" },
];

const DRILL_STATS_KEY = "nns-drill-stats";
type DrillStats = { sessions: number; cleanSessions: number; bestCleanBpm: number };

function loadDrillStats(): DrillStats {
  try {
    const raw = localStorage.getItem(DRILL_STATS_KEY);
    if (raw) return { sessions: 0, cleanSessions: 0, bestCleanBpm: 0, ...JSON.parse(raw) };
  } catch {}
  return { sessions: 0, cleanSessions: 0, bestCleanBpm: 0 };
}

function nextCall(callIndex: number, prev: number | null): number {
  const stage = STAGES[Math.min(Math.floor(callIndex / CALLS_PER_STAGE), STAGES.length - 1)];
  const pool: number[] = [];
  for (const n of stage) {
    if (n === prev) continue;
    const weight = ANCHORS.has(n) ? 3 : 2;
    for (let i = 0; i < weight; i++) pool.push(n);
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

function speak(text: string) {
  try {
    const synth = window.speechSynthesis;
    if (!synth) return;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1.05;
    synth.speak(u);
  } catch {}
}

type Phase = "setup" | "countdown" | "running" | "report" | "done";

export default function Drill({ keyName }: { keyName: string }) {
  const [phase, setPhase] = useState<Phase>("setup");
  const [bpm, setBpm] = useState(70);
  const [voiceOn, setVoiceOn] = useState(true);
  const [showChords, setShowChords] = useState(false);
  const [current, setCurrent] = useState<number | null>(null);
  const [nextUp, setNextUp] = useState<number | null>(null);
  const [beat, setBeat] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [secondsLeft, setSecondsLeft] = useState(DRILL_SECONDS);
  const [lastResult, setLastResult] = useState<{ clean: boolean; newBest: boolean } | null>(null);
  const [stats, setStats] = useState<DrillStats>({ sessions: 0, cleanSessions: 0, bestCleanBpm: 0 });

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const callIdxRef = useRef(0);
  const currentRef = useRef<number | null>(null);
  const nextUpRef = useRef<number | null>(null);
  const wakeLockRef = useRef<{ release: () => Promise<void> } | null>(null);

  useEffect(() => { setStats(loadDrillStats()); }, []);

  const stopTimers = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    try { wakeLockRef.current?.release(); } catch {}
    wakeLockRef.current = null;
    try { window.speechSynthesis?.cancel(); } catch {}
  }, []);

  useEffect(() => stopTimers, [stopTimers]);

  const start = useCallback(async () => {
    // Keep the screen awake while hands are on the instrument (best effort).
    try {
      const nav = navigator as unknown as { wakeLock?: { request: (t: string) => Promise<{ release: () => Promise<void> }> } };
      if (nav.wakeLock) wakeLockRef.current = await nav.wakeLock.request("screen");
    } catch {}

    setPhase("countdown");
    setCountdown(3);
    let c = 3;
    speak("Ready");
    timerRef.current = setInterval(() => {
      c -= 1;
      if (c > 0) { setCountdown(c); return; }
      if (timerRef.current) clearInterval(timerRef.current);

      // Begin the drill proper
      callIdxRef.current = 0;
      const first = nextCall(0, null);
      const second = nextCall(1, first);
      currentRef.current = first;
      nextUpRef.current = second;
      setCurrent(first);
      setNextUp(second);
      setBeat(0);
      setSecondsLeft(DRILL_SECONDS);
      setPhase("running");
      speak(WORDS[first]);

      const beatMs = 60000 / bpm;
      const startedAt = Date.now();
      let beatCount = 0;

      timerRef.current = setInterval(() => {
        const elapsed = (Date.now() - startedAt) / 1000;
        const remaining = Math.max(0, DRILL_SECONDS - Math.floor(elapsed));
        setSecondsLeft(remaining);
        if (remaining <= 0) {
          stopTimers();
          speak("Nice work");
          setPhase("report");
          return;
        }
        beatCount += 1;
        setBeat(beatCount % BEATS_PER_CALL);
        if (beatCount % BEATS_PER_CALL === 0) {
          callIdxRef.current += 1;
          const idx = callIdxRef.current;
          const curr = nextUpRef.current as number;
          const nxt = nextCall(idx + 1, curr);
          currentRef.current = curr;
          nextUpRef.current = nxt;
          setCurrent(curr);
          setNextUp(nxt);
          speakIfOn(curr);
        }
      }, beatMs);

      function speakIfOn(n: number) {
        if (voiceOn) speak(WORDS[n]);
      }
    }, 1000);
  }, [bpm, voiceOn, stopTimers]);

  const stopEarly = useCallback(() => {
    stopTimers();
    setPhase("setup");
  }, [stopTimers]);

  function report(missed: "0" | "1-2" | "3+") {
    const clean = missed === "0";
    const next: DrillStats = {
      sessions: stats.sessions + 1,
      cleanSessions: stats.cleanSessions + (clean ? 1 : 0),
      bestCleanBpm: clean ? Math.max(stats.bestCleanBpm, bpm) : stats.bestCleanBpm,
    };
    const newBest = clean && bpm > stats.bestCleanBpm;
    setStats(next);
    try { localStorage.setItem(DRILL_STATS_KEY, JSON.stringify(next)); } catch {}
    setLastResult({ clean, newBest });
    setPhase("done");
  }

  const chordName = (n: number | null) =>
    n === null ? "" : SCALE_MAP[keyName]?.[n - 1] ?? "";

  if (phase === "setup") {
    return (
      <div>
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-4">
          <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-2">The Drill</p>
          <p className="text-[#1d1d1f] font-semibold mb-1">Grab your instrument. The app calls the numbers.</p>
          <p className="text-sm text-gray-500 leading-relaxed">
            2 minutes. A new number every 4 beats in <span className="font-semibold normal-case">{keyName}</span>.
            Starts easy (1·4·5), sneaks in the 6, the 2, then the 3. Don&apos;t think — react.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-1.5 shadow-sm flex gap-1 mb-4">
          {BPM_OPTIONS.map((o) => (
            <button
              key={o.bpm}
              onClick={() => setBpm(o.bpm)}
              className={`flex-1 rounded-xl py-2.5 text-xs font-semibold transition ${
                bpm === o.bpm ? "bg-rose-500 text-white shadow-sm" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <span className="block text-sm">{o.bpm}</span>
              <span className="block opacity-80">{o.label}</span>
            </button>
          ))}
        </div>

        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setVoiceOn(!voiceOn)}
            className={`flex-1 rounded-2xl py-3 text-sm font-semibold shadow-sm transition ${voiceOn ? "bg-white text-[#1d1d1f]" : "bg-white text-gray-300"}`}
          >
            🗣 Voice {voiceOn ? "on" : "off"}
          </button>
          <button
            onClick={() => setShowChords(!showChords)}
            className={`flex-1 rounded-2xl py-3 text-sm font-semibold shadow-sm transition ${showChords ? "bg-white text-[#1d1d1f]" : "bg-white text-gray-300"}`}
          >
            Chord names {showChords ? "on" : "off"}
          </button>
        </div>

        {stats.sessions > 0 && (
          <p className="text-xs text-gray-400 text-center mb-4">
            {stats.sessions} drill{stats.sessions === 1 ? "" : "s"} completed
            {stats.bestCleanBpm > 0 ? ` · clean at ${stats.bestCleanBpm} BPM` : ""}
          </p>
        )}

        <button
          onClick={start}
          className="w-full bg-rose-500 hover:bg-rose-600 text-white rounded-2xl py-4 font-semibold transition active:scale-95"
        >
          Start the Drill
        </button>
      </div>
    );
  }

  if (phase === "countdown") {
    return (
      <div className="bg-white rounded-3xl p-10 shadow-sm text-center">
        <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-6">Get ready</p>
        <p className="text-8xl font-bold text-rose-500">{countdown}</p>
      </div>
    );
  }

  if (phase === "running") {
    return (
      <div>
        <div className="flex justify-between items-center mb-3 px-1">
          <p className="text-sm font-semibold text-gray-400">
            {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, "0")}
          </p>
          <div className="flex gap-1.5">
            {Array.from({ length: BEATS_PER_CALL }, (_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full ${i === beat ? "bg-rose-500" : "bg-gray-200"}`} />
            ))}
          </div>
          <p className="text-sm font-medium text-gray-400">
            Next: <span className="font-bold text-[#1d1d1f]">{nextUp}</span>
          </p>
        </div>

        <div className="bg-white rounded-3xl py-14 shadow-sm text-center mb-4">
          <p className="font-bold text-[#1d1d1f] leading-none" style={{ fontSize: "160px" }}>{current}</p>
          {showChords && (
            <p className="text-2xl font-semibold text-gray-400 mt-4 normal-case">{chordName(current)}</p>
          )}
        </div>

        <button
          onClick={stopEarly}
          className="w-full bg-white text-gray-400 rounded-2xl py-3 text-sm font-semibold shadow-sm transition"
        >
          Stop
        </button>
      </div>
    );
  }

  if (phase === "report") {
    return (
      <div className="bg-white rounded-3xl p-8 shadow-sm text-center">
        <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-2">Time!</p>
        <p className="text-xl font-bold text-[#1d1d1f] mb-6">Honest answer — how many did you miss?</p>
        <div className="grid grid-cols-3 gap-3">
          {(["0", "1-2", "3+"] as const).map((m) => (
            <button
              key={m}
              onClick={() => report(m)}
              className="bg-[#f5f5f7] hover:bg-gray-100 text-[#1d1d1f] rounded-2xl py-5 text-lg font-bold transition active:scale-95"
            >
              {m === "0" ? "0 🎯" : m}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // done
  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm text-center">
      {lastResult?.newBest ? (
        <>
          <p className="text-4xl mb-3">🏆</p>
          <p className="text-xl font-bold text-[#1d1d1f] mb-1">Clean run at {bpm} BPM — new personal best!</p>
          <p className="text-gray-500 text-sm mb-6">You&apos;re reacting, not thinking. That&apos;s the whole point.</p>
        </>
      ) : lastResult?.clean ? (
        <>
          <p className="text-4xl mb-3">🎯</p>
          <p className="text-xl font-bold text-[#1d1d1f] mb-1">Clean run.</p>
          <p className="text-gray-500 text-sm mb-6">Ready to push the tempo?</p>
        </>
      ) : (
        <>
          <p className="text-4xl mb-3">💪</p>
          <p className="text-xl font-bold text-[#1d1d1f] mb-1">That&apos;s how it&apos;s supposed to feel.</p>
          <p className="text-gray-500 text-sm mb-6">A miss just means the drill is working. Run it back.</p>
        </>
      )}
      <button
        onClick={() => setPhase("setup")}
        className="w-full bg-rose-500 hover:bg-rose-600 text-white rounded-2xl py-4 font-semibold transition active:scale-95"
      >
        Run It Again
      </button>
    </div>
  );
}
