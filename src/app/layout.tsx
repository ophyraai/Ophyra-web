import type { Metadata } from "next";
import { DM_Sans, Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "700"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ophyra Diagnosis — AI Habit Analysis",
  description:
    "Discover the real state of your habits with an AI-powered personalized diagnosis. Get your score and action plan in less than 5 minutes.",
  keywords: ["habits", "AI", "diagnosis", "wellness", "health", "productivity"],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body
        className={`${dmSans.variable} ${plusJakarta.variable} ${spaceGrotesk.variable} antialiased bg-ofira-bg text-ofira-text min-h-screen`}
        style={{ fontFamily: "var(--font-body)" }}
      >
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
