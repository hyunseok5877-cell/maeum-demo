import type { Metadata } from "next";
import { Inter, EB_Garamond, Playfair_Display } from "next/font/google";
import "./globals.css";
import { RecentBookingsTicker } from "@/components/RecentBookingsTicker";

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const serif = EB_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  style: ["normal", "italic"],
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
      className={`${sans.variable} ${serif.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <RecentBookingsTicker />
      </body>
    </html>
  );
}
