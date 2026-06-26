import Link from "next/link";

const NUMBERS = ["1","2","3","4","5","6","7"];
const LETTERS = ["C","D","E","F","G","A","B"];
const QUALITIES = ["M","m","m","M","M","m","d"];
const QUALITY_COLORS = [
  "bg-blue-100 text-blue-600",
  "bg-rose-100 text-rose-500",
  "bg-rose-100 text-rose-500",
  "bg-blue-100 text-blue-600",
  "bg-blue-100 text-blue-600",
  "bg-rose-100 text-rose-500",
  "bg-gray-100 text-gray-400",
];
const QUALITY_LABELS = ["Major","minor","minor","Major","Major","minor","dim"];

export default function LearnPage() {
  return (
    <main className="min-h-screen bg-[#f5f5f7] px-6 py-12 max-w-xl mx-auto">
      <Link href="/" className="text-blue-500 text-sm font-medium mb-10 inline-block">← Back</Link>

      {/* Hero */}
      <div className="bg-white rounded-3xl p-8 shadow-sm mb-6 text-center">
        <p className="text-5xl mb-5">🎵</p>
        <h1 className="text-3xl font-bold text-[#1d1d1f] tracking-tight leading-snug mb-4">
          If you can count to 7 and say the alphabet, you can learn Nashville Numbers.
        </h1>
        <p className="text-gray-400 text-base leading-relaxed">
          That's it. No music theory degree required.
        </p>
      </div>

      {/* Step 1 — Numbers */}
      <div className="bg-white rounded-3xl p-7 shadow-sm mb-4">
        <div className="flex items-center gap-3 mb-5">
          <span className="w-8 h-8 rounded-full bg-blue-500 text-white text-sm font-bold flex items-center justify-center">1</span>
          <h2 className="text-xl font-bold text-[#1d1d1f]">Count to 7</h2>
        </div>
        <p className="text-gray-500 mb-5 leading-relaxed">
          Every major key has 7 notes — and each one becomes a chord.
        </p>
        <div className="flex gap-2 justify-center">
          {NUMBERS.map((n) => (
            <div key={n} className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-xl font-bold text-blue-600">
              {n}
            </div>
          ))}
        </div>
      </div>

      {/* Step 2 — Letters */}
      <div className="bg-white rounded-3xl p-7 shadow-sm mb-4">
        <div className="flex items-center gap-3 mb-5">
          <span className="w-8 h-8 rounded-full bg-blue-500 text-white text-sm font-bold flex items-center justify-center">2</span>
          <h2 className="text-xl font-bold text-[#1d1d1f]">Say the alphabet (part of it)</h2>
        </div>
        <p className="text-gray-500 mb-5 leading-relaxed">
          Music uses 7 letters. They go <strong className="text-[#1d1d1f]">C D E F G A B</strong> — and then start over.
        </p>
        <div className="flex gap-2 justify-center">
          {LETTERS.map((l) => (
            <div key={l} className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-xl font-bold text-green-600">
              {l}
            </div>
          ))}
        </div>
      </div>

      {/* Step 3 — Connect them */}
      <div className="bg-white rounded-3xl p-7 shadow-sm mb-4">
        <div className="flex items-center gap-3 mb-5">
          <span className="w-8 h-8 rounded-full bg-blue-500 text-white text-sm font-bold flex items-center justify-center">3</span>
          <h2 className="text-xl font-bold text-[#1d1d1f]">Match them up</h2>
        </div>
        <p className="text-gray-500 mb-5 leading-relaxed">
          Let's start with the key of C as an example. Each number gets a letter — <strong className="text-[#1d1d1f]">1 = C, 2 = D</strong>, and so on.
        </p>
        <div className="flex gap-2 justify-center">
          {NUMBERS.map((n, i) => (
            <div key={n} className="flex flex-col items-center gap-1.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-lg font-bold text-blue-600">{n}</div>
              <div className="text-gray-300 text-xs">↕</div>
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-lg font-bold text-green-600">{LETTERS[i]}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Step 4 — Quality */}
      <div className="bg-white rounded-3xl p-7 shadow-sm mb-4">
        <div className="flex items-center gap-3 mb-5">
          <span className="w-8 h-8 rounded-full bg-blue-500 text-white text-sm font-bold flex items-center justify-center">4</span>
          <h2 className="text-xl font-bold text-[#1d1d1f]">Big, small, tiny</h2>
        </div>
        <p className="text-gray-500 mb-2 leading-relaxed">
          Each chord has a personality — <strong className="text-blue-600">Major</strong> (bright & big), <strong className="text-rose-500">minor</strong> (softer & smaller), or <span className="text-gray-400">dim</span> (rare, tense).
        </p>
        <p className="text-gray-500 mb-5 leading-relaxed">
          The pattern is always the same — <strong className="text-[#1d1d1f]">M m m M M m d</strong>.
        </p>
        <div className="flex gap-2 justify-center mb-4">
          {QUALITIES.map((q, i) => (
            <div key={i} className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold ${QUALITY_COLORS[i]}`}>
              {q}
            </div>
          ))}
        </div>
        <div className="flex gap-2 justify-center">
          {NUMBERS.map((n, i) => (
            <div key={n} className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded-xl bg-[#f5f5f7] flex items-center justify-center text-sm font-bold text-gray-500">{n}</div>
              <p className="text-[10px] text-gray-400 text-center w-10 leading-tight">{QUALITY_LABELS[i]}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Step 5 — Why it matters */}
      <div className="bg-white rounded-3xl p-7 shadow-sm mb-4">
        <div className="flex items-center gap-3 mb-5">
          <span className="w-8 h-8 rounded-full bg-blue-500 text-white text-sm font-bold flex items-center justify-center">5</span>
          <h2 className="text-xl font-bold text-[#1d1d1f]">Why not just use letters?</h2>
        </div>
        <p className="text-gray-500 mb-4 leading-relaxed">
          Numbers are a shared language for your whole team. Instead of saying <em>"play a G"</em> — which means nothing in a different key — you say <em>"play the 5."</em> <strong className="text-[#1d1d1f]">Everyone knows exactly where to go, no matter what key you're in.</strong>
        </p>
        <p className="text-gray-500 mb-4 leading-relaxed">
          It also trains your ear. Once you know what a 1→4→5 feels like, you'll start hearing it everywhere — and learning new songs gets much faster.
        </p>
        <div className="bg-[#f5f5f7] rounded-2xl p-5">
          <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-3">Same chart, any key</p>
          <div className="flex gap-3 mb-3">
            {["1","4","5","1"].map((n, i) => (
              <div key={i} className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-xl font-bold text-[#1d1d1f] shadow-sm">{n}</div>
            ))}
          </div>
          <p className="text-sm text-gray-400">In C: &nbsp;<span className="font-medium text-[#1d1d1f]">C · F · G · C</span></p>
          <p className="text-sm text-gray-400">In G: &nbsp;<span className="font-medium text-[#1d1d1f]">G · C · D · G</span></p>
          <p className="text-sm text-gray-400">In A: &nbsp;<span className="font-medium text-[#1d1d1f]">A · D · E · A</span></p>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-blue-500 rounded-3xl p-7 shadow-sm text-center text-white mb-4">
        <p className="text-2xl font-bold mb-2">You already get it. 🎉</p>
        <p className="text-blue-100 mb-6">Now let's put it into practice.</p>
        <Link
          href="/read"
          className="inline-block bg-white text-blue-500 font-bold rounded-2xl px-8 py-3 hover:bg-blue-50 transition"
        >
          Read Your First Chart →
        </Link>
      </div>
    </main>
  );
}
