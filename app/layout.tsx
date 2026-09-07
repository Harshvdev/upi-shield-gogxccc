import type { Metadata } from "next";
import { Inter, Source_Serif_4, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const sourceSerif4 = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const notoSansDevanagari = Noto_Sans_Devanagari({
  variable: "--font-noto-devanagari",
  subsets: ["devanagari"],
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "UPI-Shield — Before you pay, check the message.",
  description:
    "Official UPI scam and psychological manipulation detector. Examines suspicious SMS, WhatsApp, payment notes, and QR codes before you authorize payments.",
  keywords: [
    "UPI scam detection",
    "UPI Shield",
    "fraud prevention",
    "social engineering",
    "bilingual scam warning",
    "India payment security",
    "Cyber helpline 1930",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${sourceSerif4.variable} ${notoSansDevanagari.variable} antialiased`}
    >
      <body className="min-h-screen bg-[var(--paper)] text-[var(--ink)] font-sans flex flex-col selection:bg-[#E4E0D6] selection:text-[#201F1C]">
        {children}
      </body>
    </html>
  );
}
