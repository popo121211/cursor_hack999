import type { Metadata } from "next";
import { IBM_Plex_Sans_KR, Song_Myung } from "next/font/google";
import "./globals.css";

const display = Song_Myung({
  weight: "400",
  variable: "--font-display",
});

const body = IBM_Plex_Sans_KR({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "FROM.ME",
  description:
    "오늘의 선택이 미래의 나를 가른다. 목표와 이유를 바탕으로 지킨 나 / 미룬 나의 목소리를 남기는 타임캡슐.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${display.variable} ${body.variable} h-full antialiased`}>
      <body className="min-h-full bg-background font-sans text-ink">{children}</body>
    </html>
  );
}
