"use client";

import { useEntitlement } from "./EntitlementProvider";

// Persistent Restore Purchases entry point outside the paywall (Apple
// guideline + Family Sharing/reinstall recovery). Native app only.
export default function RestoreLink() {
  const { isNative, isUnlocked, busy, restore } = useEntitlement();

  if (!isNative || isUnlocked) return null;

  return (
    <button
      onClick={restore}
      disabled={busy !== null}
      className="mt-10 text-xs text-gray-400 font-medium disabled:opacity-60"
    >
      {busy === "restore" ? "Restoring…" : "Restore Purchases"}
    </button>
  );
}
