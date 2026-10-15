import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SnapBond | Online LDR & Solo Photobooth",
  description: "Platform photobooth online estetik untuk pasangan LDR dan solo. Abadikan momen berdua meski terpisah jarak dengan photostrip estetik.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${plusJakartaSans.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-[#FFFDF9] text-zinc-900 font-sans antialiased selection:bg-rose-300 selection:text-zinc-900">
        {children}
      </body>
    </html>
  );
}
