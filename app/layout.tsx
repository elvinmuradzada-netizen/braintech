import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BrainTech — Onlayn Təhsil Platforması",
  description: "1-9-cu sinif şagirdləri üçün onlayn imtahanlar, bilik yarışları, statistik təhlillər və fərdi inkişaf planı.",
  keywords: ["BrainTech", "onlayn imtahan", "təhsil", "şagird", "müəllim", "1-9 sinif", "Azərbaycan"],
  authors: [{ name: "BrainTech" }],
  openGraph: {
    title: "BrainTech — Onlayn Təhsil Platforması",
    description: "1-9-cu sinif şagirdləri üçün onlayn imtahanlar və bilik yarışları",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="az"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
