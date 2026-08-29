import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { headers } from "next/headers";
import { Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Providers } from "@/components/Providers";
import { ConsentDefaultsScript } from "@/components/consent/ConsentDefaultsScript";
import { JsonLdScript } from "@/components/seo/JsonLdScript";
import { organizationJsonLd, webSiteJsonLd } from "@/lib/seo/json-ld";
import { rootMetadata } from "@/lib/seo/metadata";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  display: "swap",
  weight: ["400", "500", "600"],
  preload: true,
  adjustFontFallback: true,
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "latin-ext"],
  display: "swap",
  weight: ["700"],
  preload: false,
  adjustFontFallback: true,
});

export const metadata: Metadata = rootMetadata;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const h = await headers();
  const lang = h.get("x-hj-locale") === "en" ? "en" : "cs";

  return (
    <html
      lang={lang}
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="flex min-h-full max-w-full min-w-0 flex-col font-sans">
        <ConsentDefaultsScript />
        <JsonLdScript data={[organizationJsonLd(), webSiteJsonLd()]} />
        <Providers>
          <Suspense fallback={null}>
            <Navbar />
          </Suspense>
          <main className="min-w-0 flex-1 pb-[var(--cookie-banner-pad,0px)]">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
