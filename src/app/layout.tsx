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
  description: "For creatives figuring it out — resources, tools, and a space to find your rhythm, your worth, and each other.",
  metadataBase: new URL("https://thebecomingcreative.com"),
  openGraph: {
    title: "The Becoming Creative",
    description: "For creatives figuring it out — resources, tools, and a space to find your rhythm, your worth, and each other.",
    url: "https://thebecomingcreative.com",
    siteName: "The Becoming Creative",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${heading.variable} ${accent.variable} ${body.variable} h-full`} style={{ colorScheme: "light" }}>
      <body className="min-h-full flex flex-col">
        {children}
        <Script src="/_vercel/insights/script.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
