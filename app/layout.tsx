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
  title: "UPI-Shield — Detect UPI Payment Scams Before You Pay",
  description:
    "AI-powered social-engineering scam detector for UPI payments. Analyzes SMS, WhatsApp, and Payment Notes to identify deceptive triggers, compute transparent threat scores, and generate bilingual English & Hindi safety cards.",
  keywords: [
    "UPI scam detection",
    "UPI Shield",
    "fraud prevention",
    "social engineering",
    "bilingual scam warning",
    "India payment security",
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
      className={`${geistSans.variable} ${geistMono.variable} dark antialiased`}
    >
      <body className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
