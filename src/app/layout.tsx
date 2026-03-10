import type { Metadata } from "next";
import { DM_Sans, Plus_Jakarta_Sans, Space_Grotesk, Dancing_Script } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import "./globals.css";
import CookieBanner from "@/components/legal/CookieBanner";

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

const dancingScript = Dancing_Script({
  variable: "--font-signature",
  subsets: ["latin"],
  display: "swap",
  weight: ["700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://ophyra.com'),
  title: {
    default: "Ophyra Diagnosis — AI Habit Analysis",
    template: "%s | Ophyra"
  },
  description:
    "Discover the real state of your habits with an AI-powered personalized diagnosis. Get your score and action plan in less than 5 minutes.",
  keywords: ["habits", "AI", "diagnosis", "wellness", "health", "productivity"],
  openGraph: {
    title: "Ophyra Diagnosis — AI Habit Analysis",
    description: "Discover the real state of your habits with an AI-powered personalized diagnosis. Get your score and action plan in less than 5 minutes.",
    url: "/",
    siteName: "Ophyra Diagnosis",
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ophyra Diagnosis — AI Habit Analysis",
    description: "Discover the real state of your habits with an AI-powered personalized diagnosis. Get your score and action plan in less than 5 minutes.",
  },
  alternates: {
    canonical: "/",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  // Structured Data for Personal Brand SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Ophyra",
    "url": process.env.NEXT_PUBLIC_APP_URL || 'https://ophyra.com',
    "sameAs": [
      "https://www.instagram.com/ophyra_secret/",
      "https://www.tiktok.com/@ophyra_secret"
    ],
    "jobTitle": "Creador de Contenido y Experto en Hábitos"
  };

  return (
    <html lang={locale}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${dmSans.variable} ${plusJakarta.variable} ${spaceGrotesk.variable} ${dancingScript.variable} antialiased bg-ofira-bg text-ofira-text min-h-screen relative`}
        style={{ fontFamily: "var(--font-body)" }}
      >
        <NextIntlClientProvider messages={messages}>
          {children}
          <CookieBanner />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
