import type { Metadata } from "next";

const APP_STORE_URL = "https://apps.apple.com/us/app/number-system-trainer/id6786437503";

export const metadata: Metadata = {
  title: "Number System Trainer — Learn Nashville Numbers",
  description:
    "If you can count to 7, you can learn Nashville Numbers. The training app worship musicians use to learn any song, in any key, on the spot.",
  openGraph: {
    title: "Number System Trainer — Learn Nashville Numbers",
    description:
      "If you can count to 7, you can learn Nashville Numbers. Learn any song, in any key, on the spot.",
    images: ["/og-image.png"], // TODO: add 1200x630 og-image.png to /public
  },
};

const modules = [
  { icon: "♩", label: "Learn",          sub: "Start here — 5-step intro to how numbers work",        color: "text-blue-500",   screenshot: "/screenshots/learn.png" },
  { icon: "♪", label: "Read Charts",    sub: "4 levels — basic triads up to slash chords",           color: "text-green-500",  screenshot: "/screenshots/read.png" },
  { icon: "⇄", label: "Transpose",      sub: "Move a full progression to any key",                   color: "text-orange-500", screenshot: "/screenshots/transpose.png" },
  { icon: "◎", label: "Ear Training",   sub: "3 levels — can you name the chord just by listening?", color: "text-purple-500", screenshot: "/screenshots/ear.png" },
  { icon: "♫", label: "Play Along",     sub: "Piano & guitar shapes in every key — capo tips too",   color: "text-rose-500",   screenshot: "/screenshots/play.png" },
  { icon: "◉", label: "Circle of 5ths", sub: "Tap any key to see all 7 chords",                      color: "text-teal-500",   screenshot: "/screenshots/circle.png" },
];

const demoKeys = [
  { key: "C", chords: ["C", "F", "G", "C"] },
  { key: "G", chords: ["G", "C", "D", "G"] },
  { key: "A", chords: ["A", "D", "E", "A"] },
];

function AppStoreBadge() {
  return (
    <a
      href={APP_STORE_URL}
      className="inline-flex items-center gap-3 bg-[#1d1d1f] text-white rounded-2xl px-6 py-3.5 hover:opacity-90 transition active:scale-95"
    >
      <span className="text-2xl"></span>
      <span className="text-left leading-tight">
        <span className="block text-[10px] uppercase tracking-wide opacity-70">Download on the</span>
        <span className="block text-lg font-semibold -mt-0.5">App Store</span>
      </span>
    </a>
  );
}

function Screenshot({ src, label }: { src: string; label: string }) {
  return (
    <div className="w-full aspect-[4/5] rounded-xl bg-gray-100 overflow-hidden">
      <img src={src} alt={`${label} screenshot`} className="w-full h-full object-cover object-top" loading="lazy" />
    </div>
  );
}

export default function Landing() {
  return (
    <main className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
      {/* ── Hero ─────────────────────────────────────── */}
      <section className="px-6 pt-20 pb-16 max-w-2xl mx-auto text-center">
        <p className="text-sm font-semibold tracking-widest text-gray-400 uppercase mb-3">Worship Team</p>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight mb-4">
          If you can count to 7, you can learn Nashville Numbers.
        </h1>
        <p className="text-lg text-gray-500 mb-8">
          The training app worship musicians use to learn any song, in any key, on the spot.
        </p>
        <AppStoreBadge />
      </section>

      {/* ── The hook ─────────────────────────────────── */}
      <section className="px-6 pb-16 max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl p-8 shadow-sm flex flex-col sm:flex-row gap-6 items-start">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-2xl font-bold text-blue-500 shrink-0">
            1
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight mb-2">One language. Every key.</h2>
            <p className="text-gray-500 leading-relaxed">
              Numbers are a shared language across keys. &ldquo;Play the 5&rdquo; means the same thing
              whether you&apos;re in C, G, or B. No letters to relearn for every song.
              That&apos;s it. No music theory degree required.
            </p>
          </div>
        </div>
      </section>

      {/* ── Feature cards ────────────────────────────── */}
      <section className="px-6 pb-16 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-10">Six ways to practice.</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((m) => (
            <div key={m.label} className="bg-white rounded-2xl p-6 shadow-sm flex flex-col gap-3">
              <span className={`text-3xl ${m.color}`}>{m.icon}</span>
              <div>
                <p className="font-semibold text-base">{m.label}</p>
                <p className="text-sm text-gray-400 mt-0.5">{m.sub}</p>
              </div>
              <Screenshot src={m.screenshot} label={m.label} />
            </div>
          ))}
        </div>
      </section>

      {/* ── Same chart, any key ──────────────────────── */}
      <section className="px-6 pb-16 max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold tracking-tight text-center mb-2">Same chart. Any key.</h2>
          <p className="text-gray-500 text-center mb-8">
            Learn a progression once as numbers. Play it anywhere.
          </p>

          <div className="flex justify-center gap-3 mb-8">
            {["1", "4", "5", "1"].map((n, i) => (
              <div key={i} className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-2xl font-bold text-blue-500">
                {n}
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            {demoKeys.map(({ key, chords }) => (
              <div key={key} className="flex items-center gap-4">
                <span className="text-sm font-semibold text-gray-400 w-10 shrink-0 normal-case">In {key}</span>
                <div className="flex gap-2 flex-1 justify-center">
                  {chords.map((c, i) => (
                    <div key={i} className="flex-1 max-w-14 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-base font-semibold normal-case">
                      {c}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Closing CTA ──────────────────────────────── */}
      <section className="px-6 pb-16 max-w-2xl mx-auto">
        <div className="bg-blue-500 rounded-2xl p-10 shadow-sm text-center text-white">
          <h2 className="text-3xl font-bold tracking-tight mb-2">You already get it. 🎉</h2>
          <p className="text-blue-100 mb-8">Now go play it.</p>
          <a
            href={APP_STORE_URL}
            className="inline-block bg-white text-blue-500 rounded-2xl px-8 py-4 font-semibold hover:bg-blue-50 transition active:scale-95"
          >
            Download on the App Store
          </a>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────── */}
      <footer className="px-6 pb-14 max-w-2xl mx-auto flex flex-col items-center gap-6 text-center">
        <AppStoreBadge />
        <a
          href="https://www.iubenda.com/privacy-policy/90712919"
          className="text-sm text-gray-400 hover:text-gray-500 transition"
        >
          Privacy Policy
        </a>
        <p className="text-xs text-gray-400 leading-relaxed">
          Piano samples: Salamander Grand Piano (CC-BY). Guitar samples: nbrosowsky/tonejs-instruments (CC-BY 3.0).
        </p>
      </footer>
    </main>
  );
}
