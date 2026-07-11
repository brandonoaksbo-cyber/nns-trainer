"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Capacitor } from "@capacitor/core";

// One-time non-consumable unlock. Family Sharing is enabled on this product
// in App Store Connect, so "owned" can come from a family member's purchase.
export const PRODUCT_ID = "com.brandonoaks.nnstrainer.fullunlock";

// localStorage cache is a fast local read for first paint only — StoreKit is
// re-checked on every launch so reinstalls/device changes stay correct.
const CACHE_KEY = "nns-unlocked";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Ctx = {
  isUnlocked: boolean;
  price: string | null;       // localized price from StoreKit — never hardcode
  busy: "purchase" | "restore" | null;
  ready: boolean;              // StoreKit catalog has loaded — gate the buy button on this
  isNative: boolean;
  purchase: () => Promise<void>;
  restore: () => Promise<void>;
};

const EntitlementContext = createContext<Ctx | null>(null);

export function EntitlementProvider({ children }: { children: React.ReactNode }) {
  const isNative = Capacitor.isNativePlatform();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [price, setPrice] = useState<string | null>(null);
  const [busy, setBusy] = useState<"purchase" | "restore" | null>(null);
  const [ready, setReady] = useState(false);
  const storeRef = useRef<any>(null);

  useEffect(() => {
    // The web version stays fully free — the unlock only applies in the iOS app.
    if (!isNative) {
      setIsUnlocked(true);
      setReady(true);
      return;
    }

    // Fast paint from cache while StoreKit initializes
    if (localStorage.getItem(CACHE_KEY) === "1") setIsUnlocked(true);

    const markUnlocked = (owned: boolean) => {
      setIsUnlocked(owned);
      localStorage.setItem(CACHE_KEY, owned ? "1" : "0");
    };

    const init = () => {
      const CdvPurchase = (window as any).CdvPurchase;
      if (!CdvPurchase) return;
      const { store, ProductType, Platform } = CdvPurchase;
      storeRef.current = store;

      // Surface plugin internals in the Xcode console while we debug the
      // sandbox "store isn't ready" issue. Harmless in production.
      store.verbosity = CdvPurchase.LogLevel.DEBUG;
      store.error((err: any) => console.error("[IAP] store error", err?.code, err?.message));

      store.register([{ id: PRODUCT_ID, type: ProductType.NON_CONSUMABLE, platform: Platform.APPLE_APPSTORE }]);

      store
        .when()
        // No receipt-validation server in this app, so finish the transaction
        // directly on approval. Calling verify() with no validator configured
        // leaves the purchase stuck in "approved" and surfaces an error to the
        // buyer — which is what App Review hit in build 3.
        .approved((transaction: any) => transaction.finish())
        .finished(() => markUnlocked(true))
        .productUpdated((product: any) => {
          if (product.id === PRODUCT_ID) {
            if (product.pricing?.price) setPrice(product.pricing.price);
            // Ready means "this product can actually be bought right now" —
            // not merely "the store booted". Build 4's sandbox test showed
            // initialize() can resolve before (or without) the product loading.
            if (product.canPurchase) setReady(true);
            if (product.owned) markUnlocked(true);
          }
        })
        .receiptUpdated(() => {
          const p = store.get(PRODUCT_ID, Platform.APPLE_APPSTORE);
          if (p) markUnlocked(!!p.owned);
        });

      store.initialize([Platform.APPLE_APPSTORE]).then(() => {
        // If the catalog didn't arrive with initialize, poll for it — slow
        // networks and freshly-created sandbox products can lag. Give up
        // after ~90s; the button stays in its "Loading…" state meanwhile.
        let attempts = 0;
        const poll = setInterval(() => {
          const p = store.get(PRODUCT_ID, Platform.APPLE_APPSTORE);
          if (p?.canPurchase || attempts++ >= 18) {
            clearInterval(poll);
            if (p?.canPurchase) setReady(true);
            return;
          }
          console.warn(`[IAP] product not loaded yet (attempt ${attempts}) — refreshing`);
          store.update();
        }, 5000);
      });
    };

    if ((window as any).CdvPurchase) init();
    else document.addEventListener("deviceready", init, { once: true });
  }, [isNative]);

  const purchase = useCallback(async () => {
    const CdvPurchase = (window as any).CdvPurchase;
    const store = storeRef.current;
    if (!store || !CdvPurchase) {
      alert("Store isn't ready yet. Please try again in a moment.");
      return;
    }
    const product = store.get(PRODUCT_ID, CdvPurchase.Platform.APPLE_APPSTORE);
    const offer = product?.getOffer();
    if (!offer) {
      // Never fail silently — this is exactly the bug Apple's reviewer hit:
      // tapping the button with no product loaded yet produced no feedback at all.
      alert("Store isn't ready yet. Please try again in a moment.");
      return;
    }
    setBusy("purchase");
    try {
      const err = await offer.order();
      // User cancelling the sheet is not an error state — dismiss quietly
      if (err && err.code !== CdvPurchase.ErrorCode.PAYMENT_CANCELLED) {
        alert("Purchase didn't go through. Please try again.");
      }
    } finally {
      setBusy(null);
    }
  }, []);

  const restore = useCallback(async () => {
    const store = storeRef.current;
    if (!store) return;
    setBusy("restore");
    try {
      await store.restorePurchases();
    } finally {
      setBusy(null);
    }
  }, []);

  return (
    <EntitlementContext.Provider value={{ isUnlocked, price, busy, ready, isNative, purchase, restore }}>
      {children}
    </EntitlementContext.Provider>
  );
}

export function useEntitlement() {
  const ctx = useContext(EntitlementContext);
  if (!ctx) throw new Error("useEntitlement must be used inside EntitlementProvider");
  return ctx;
}
