import type { Metadata } from "next";
import { Space_Grotesk, Caveat, DM_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const heading = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const accent = Caveat({
  variable: "--font-accent",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const body = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "The Becoming Creative",
  description: "A space for creatives to find their rhythm, their voice, and each other.",
  openGraph: {
    title: "The Becoming Creative",
    description: "A space for creatives to find their rhythm, their voice, and each other.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${heading.variable} ${accent.variable} ${body.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        {children}
        <Script src="/_vercel/insights/script.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
