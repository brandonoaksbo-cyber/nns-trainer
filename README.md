This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## In-App Purchase (v1.1)

One non-consumable product unlocks everything: `com.brandonoaks.nnstrainer.fullunlock`
(Family Sharing enabled). Free tier: Learn (full), Read Charts Level 1, Ear Training Level 1.

- Plugin: `cordova-plugin-purchase` (StoreKit via Capacitor)
- Entitlement logic: `app/components/EntitlementProvider.tsx` — StoreKit is re-checked on
  every launch; localStorage (`nns-unlocked`) is only a fast cache for first paint.
- The web build treats everything as unlocked (the unlock applies to the iOS app only).

### Testing purchases (Sandbox)

Never test with a real Apple ID — sandbox purchases don't bill.

1. App Store Connect → Users and Access → Sandbox Testers → create a test account.
2. On the test device: Settings → App Store → Sandbox Account → sign in with the tester.
3. Build and run from Xcode (`npm run build && npx cap sync ios`, then run on device).

Manual test checklist:
- [ ] Fresh install: locked modules show paywall, Level 1s are free
- [ ] Purchase via "Unlock Everything" → content unlocks immediately
- [ ] Relaunch app → still unlocked
- [ ] Delete and reinstall → tap Restore Purchases → unlock returns
- [ ] Family Sharing member → Restore Purchases unlocks without a charge
