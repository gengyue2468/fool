import type { Metadata } from "next";
import {
  Noto_Serif_SC,
  Noto_Sans_SC,
  Playfair_Display,
  Mona_Sans,
} from "next/font/google";
import "./globals.css";
import "./highlight.css";
import Hero from "@/components/hero/hero";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { ThemeProvider } from "next-themes";
import dayjs from "dayjs";

const notoSerifSC = Noto_Serif_SC({
  variable: "--font-noto-serif-sc",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const notoSansSC = Noto_Sans_SC({
  variable: "--font-noto-sans-sc",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const monaSans = Mona_Sans({
  variable: "--font-mona-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "若智 AI",
  description: "一本正经地说些弱智的话",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const fontVariables = `${notoSerifSC.variable} ${playfairDisplay.variable} ${notoSansSC.variable} ${monaSans.variable}`;

  return (
    <html lang="zh-CN" className="font-sans" suppressHydrationWarning>
      <body
        className={`${fontVariables} antialiased selection:bg-neutral-900 selection:text-neutral-100 dark:selection:bg-neutral-200 dark:selection:text-neutral-900 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 min-h-screen`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SettingsProvider>
            <div className="flex flex-col min-h-screen">
              <Hero />
              <main className="flex-1 flex justify-center items-center w-full">
                {children}
              </main>
              <footer className="text-center py-8 text-xs opacity-50">
                © {dayjs().year()} Made with ❤️ by{" "}
                <a href="https://gengyue.site/" className="underline">Yue Geng</a>. LLM models
                provided by <a href="https://ppio.com/" className="underline">PPIO</a>.
              </footer>
            </div>
          </SettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
