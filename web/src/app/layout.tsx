import type { Metadata } from "next";
import { Chakra_Petch, JetBrains_Mono, Allura } from "next/font/google";
import "./globals.css";
import { RecentBookingsTicker } from "@/components/RecentBookingsTicker";

// Chakra Petch — 사이버 디스플레이 + 본문. 모든 weight 단일 패밀리로 통일.
const cyber = Chakra_Petch({
  variable: "--font-cyber",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

// /about 페이지 시그니처 한 곳에만 사용
const signature = Allura({
  variable: "--font-signature",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "마음 (Maeum) — Curated Experiences",
  description:
    "당신의 마음이 향하는 단 한 번의 경험. 슈퍼카 · 요트 · 프라이빗 외승 큐레이션.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      data-scroll-behavior="smooth"
      className={`${cyber.variable} ${mono.variable} ${signature.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <RecentBookingsTicker />
      </body>
    </html>
  );
}
