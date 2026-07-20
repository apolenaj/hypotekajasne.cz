import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Providers } from "@/components/Providers";
import { JsonLdScript } from "@/components/seo/JsonLdScript";
import { organizationJsonLd, webSiteJsonLd } from "@/lib/seo/json-ld";
import { rootMetadata } from "@/lib/seo/metadata";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = rootMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs" className={`${inter.variable} ${playfair.variable} h-full antialiased`}>
      <body className="flex min-h-full max-w-full min-w-0 flex-col font-sans">
        <JsonLdScript data={[organizationJsonLd(), webSiteJsonLd()]} />
        <Providers>
          <Navbar />
          <main className="min-w-0 flex-1 pb-[var(--cookie-banner-pad,0px)]">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
