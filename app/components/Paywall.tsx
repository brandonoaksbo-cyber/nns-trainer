"use client";

import Link from "next/link";
import { useEntitlement } from "./EntitlementProvider";

const INCLUDED = [
  { icon: "♪", label: "Read Charts", detail: "All 4 levels", color: "text-green-500" },
  { icon: "◎", label: "Ear Training", detail: "All 3 levels", color: "text-purple-500" },
  { icon: "♫", label: "Play Along", detail: "Every key, piano & guitar", color: "text-rose-500" },
  { icon: "⇄", label: "Transpose", detail: "Full module", color: "text-orange-500" },
  { icon: "◉", label: "Circle of 5ths", detail: "Full module", color: "text-teal-500" },
];

// Full-screen paywall. Rendered in place of locked content (module gate) or
// on top of it (level gate, via onClose).
export default function Paywall({ onClose }: { onClose?: () => void }) {
  const { price, busy, ready, isNative, purchase, restore } = useEntitlement();
  // On native, wait for StoreKit to finish loading the product catalog before
  // the button is tappable — this is what caused Apple's review rejection
  // (tapping before the catalog loaded produced no response at all).
  const buyDisabled = busy !== null || (isNative && !ready);

  return (
    <div className="fixed inset-0 z-50 bg-[#f5f5f7] overflow-y-auto">
      <div className="max-w-md mx-auto px-6 py-14 flex flex-col min-h-full">
        {onClose ? (
          <button onClick={onClose} className="absolute top-12 right-6 text-sm text-gray-400 font-medium">
            Not now
          </button>
        ) : (
          <Link href="/" className="absolute top-12 left-6 text-sm text-blue-500 font-medium">
            ← Back
          </Link>
        )}

        <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-4 mt-6">Unlock Everything</p>
        <h2 className="text-3xl font-bold text-[#1d1d1f] tracking-tight leading-tight mb-3">
          You&apos;ve got the basics. Unlock the rest.
        </h2>
        <p className="text-gray-500 text-base mb-8 leading-relaxed">
          One purchase. Every level, every module, every key. No subscription — yours for good, and shared with your family.
        </p>

        <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-100 mb-8">
          {INCLUDED.map((f) => (
            <div key={f.label} className="flex items-center gap-4 px-5 py-3.5">
              <span className={`text-2xl ${f.color}`}>{f.icon}</span>
              <div>
                <p className="font-semibold text-[#1d1d1f] text-sm">{f.label}</p>
                <p className="text-xs text-gray-400">{f.detail}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-auto">
          <button
            onClick={purchase}
            disabled={buyDisabled}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-2xl py-4 font-semibold transition active:scale-95 disabled:opacity-60"
          >
            {busy === "purchase"
              ? "Opening…"
              : isNative && !ready
              ? "Loading…"
              : price
              ? `Unlock Everything — ${price}`
              : "Unlock Everything"}
          </button>
          <button
            onClick={restore}
            disabled={busy !== null || (isNative && !ready)}
            className="w-full py-4 text-sm text-gray-400 font-medium disabled:opacity-60"
          >
            {busy === "restore" ? "Restoring…" : "Already purchased? Restore Purchases"}
          </button>
        </div>
      </div>
    </div>
  );
}
