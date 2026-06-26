import Link from "next/link";

const modules = [
  { href: "/learn",     icon: "♩",  label: "Learn",         sub: "How Nashville Numbers work",        color: "text-blue-500" },
  { href: "/read",      icon: "♪",  label: "Read Charts",   sub: "Practice reading in any key",       color: "text-green-500" },
  { href: "/transpose", icon: "⇄",  label: "Transpose",     sub: "Quiz across keys",                  color: "text-orange-500" },
  { href: "/ear",       icon: "◎",  label: "Ear Training",  sub: "Identify chords by sound",          color: "text-purple-500" },
  { href: "/play",      icon: "♫",  label: "Play Along",    sub: "See chord shapes on your instrument", color: "text-rose-500" },
  { href: "/cheat",     icon: "◉",  label: "Circle of 5ths", sub: "Interactive key reference",          color: "text-teal-500" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f5f5f7] flex flex-col items-center justify-center px-6 py-16">
      <p className="text-sm font-semibold tracking-widest text-gray-400 uppercase mb-3">Worship Team</p>
      <h1 className="text-5xl font-bold text-[#1d1d1f] tracking-tight mb-2 text-center">NNS Trainer</h1>
      <p className="text-lg text-gray-500 mb-14 text-center">Nashville Number System</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
        {modules.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col gap-3 group"
          >
            <span className={`text-3xl ${m.color}`}>{m.icon}</span>
            <div>
              <p className="font-semibold text-[#1d1d1f] text-base">{m.label}</p>
              <p className="text-sm text-gray-400 mt-0.5">{m.sub}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
