import type { Metadata } from "next";
import { Cormorant_Garamond, Space_Grotesk } from "next/font/google";
import "./globals.css";

const space = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  weight: ["300", "400", "500", "600", "700"],
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["300", "400"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "LinkAI — Mortgage Technology Q1 2026",
  description: "Board of Directors update — LinkAI platform and AI-augmented delivery.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${space.variable} ${cormorant.variable} bg-[#0c0916] font-[family-name:var(--font-space)] text-[#f0ecff] antialiased`}>
        {children}
      </body>
    </html>
  );
}
