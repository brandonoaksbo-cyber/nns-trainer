import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Number System Trainer",
  description: "Nashville Number System training for worship teams and musicians",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
