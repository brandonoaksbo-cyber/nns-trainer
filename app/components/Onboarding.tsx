"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "nns-onboarding-complete";

const SCREENS = [
  {
    tag: "Welcome",
    title: "The language of worship teams.",
    body: "The Nashville Number System lets musicians play together in any key — no sheet music required. This app teaches you how.",
    visual: (
      <div className="flex justify-center gap-3 flex-wrap">
        {["1","4","5","6"].map((n) => (
          <div key={n} className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-2xl font-bold text-blue-500">
            {n}
          </div>
        ))}
      </div>
    ),
  },
  {
    tag: "The Numbers",
    title: "Learn once. Play in any key.",
    body: "Every major key has 7 chords numbered 1–7. Learn a progression as numbers and you can instantly play it in any key.",
    visual: (
      <div className="grid grid-cols-7 gap-1.5 w-full">
        {[
          { n: "1", q: "maj" }, { n: "2", q: "min" }, { n: "3", q: "min" },
          { n: "4", q: "maj" }, { n: "5", q: "maj" }, { n: "6", q: "min" },
          { n: "7", q: "dim" },
        ].map(({ n, q }) => (
          <div key={n} className="flex flex-col items-center gap-1">
            <div className={`w-full aspect-square rounded-xl flex items-center justify-center text-lg font-bold
              ${q === "maj" ? "bg-blue-50 text-blue-500" : q === "min" ? "bg-rose-50 text-rose-400" : "bg-gray-100 text-gray-400"}`}>
              {n}
            </div>
            <span className="text-[9px] text-gray-400 font-medium">{q}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    tag: "Play Along",
    title: "See where to put your fingers.",
    body: "Pick your instrument — piano or guitar. Tap any chord to see the exact shape. Playing a tricky key? Capo tips are built in.",
    visual: (
      <div className="flex gap-4 justify-center">
        <div className="flex-1 bg-white rounded-2xl p-4 shadow-sm flex flex-col items-center gap-2">
          <span className="text-3xl">🎹</span>
          <p className="text-sm font-semibold text-[#1d1d1f]">Piano</p>
          <p className="text-xs text-gray-400 text-center">Worship voicings with open, spread chords</p>
        </div>
        <div className="flex-1 bg-white rounded-2xl p-4 shadow-sm flex flex-col items-center gap-2">
          <span className="text-3xl">🎸</span>
          <p className="text-sm font-semibold text-[#1d1d1f]">Guitar</p>
          <p className="text-xs text-gray-400 text-center">Open shapes + capo tips for every key</p>
        </div>
      </div>
    ),
  },
  {
    tag: "Skill Levels",
    title: "Start simple. Level up as you go.",
    body: "Ear Training and Read Charts both have 3 levels — so beginners and experienced players all have something to work on.",
    visual: (
      <div className="flex flex-col gap-3 w-full">
        {[
          { level: "Level 1", desc: "Major chords — 1, 4, 5",              color: "bg-purple-50 text-purple-500",  dot: "bg-purple-500" },
          { level: "Level 2", desc: "Add minor chords — 2, 3, 6, 7",       color: "bg-purple-100 text-purple-600", dot: "bg-purple-600" },
          { level: "Level 3", desc: "Borrowed chords & slash chords",       color: "bg-purple-200 text-purple-700", dot: "bg-purple-700" },
        ].map(({ level, desc, color, dot }) => (
          <div key={level} className={`${color} rounded-2xl px-4 py-3 flex items-center gap-3`}>
            <div className={`w-2 h-2 rounded-full ${dot} shrink-0`} />
            <div>
              <p className="text-sm font-bold">{level}</p>
              <p className="text-xs opacity-70">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    ),
  },
];

export default function Onboarding() {
  const [visible, setVisible] = useState(false);
  const [screen, setScreen] = useState(0);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  function finish() {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  }

  function next() {
    if (screen < SCREENS.length - 1) {
      setScreen(screen + 1);
    } else {
      finish();
    }
  }

  if (!visible) return null;

  const s = SCREENS[screen];
  const isLast = screen === SCREENS.length - 1;

  return (
    <div className="fixed inset-0 z-50 bg-[#f5f5f7] flex flex-col px-6 py-14 max-w-md mx-auto">
      {/* Skip */}
      <button onClick={finish} className="absolute top-12 right-6 text-sm text-gray-400 font-medium">
        Skip
      </button>

      {/* Tag */}
      <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-4">{s.tag}</p>

      {/* Title */}
      <h2 className="text-3xl font-bold text-[#1d1d1f] tracking-tight leading-tight mb-3">{s.title}</h2>

      {/* Body */}
      <p className="text-gray-500 text-base mb-8 leading-relaxed">{s.body}</p>

      {/* Visual */}
      <div className="mb-auto">{s.visual}</div>

      {/* Dots */}
      <div className="flex gap-2 justify-center mb-6 mt-10">
        {SCREENS.map((_, i) => (
          <div key={i} className={`rounded-full transition-all duration-300 ${i === screen ? "w-5 h-2 bg-blue-500" : "w-2 h-2 bg-gray-200"}`} />
        ))}
      </div>

      {/* CTA */}
      <button
        onClick={next}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-2xl py-4 font-semibold transition active:scale-95"
      >
        {isLast ? "Get Started" : "Next →"}
      </button>
    </div>
  );
}
