import type { Metadata } from "next";
import { Instrument_Serif, Manrope } from "next/font/google";
import "./globals.css";

const display = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});

const body = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "FROM.ME — AI 타임캡슐",
  description:
    "목표를 세운 순간, 미래의 내가 오늘을 남긴다. Future Self Persona로 초심을 다시 전달하는 AI 타임캡슐.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${display.variable} ${body.variable} h-full antialiased`}>
      <body className="min-h-full bg-background font-sans text-ink">{children}</body>
    </html>
  );
}
