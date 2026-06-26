import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NNS Trainer",
  description: "Nashville Number System training for worship teams",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
