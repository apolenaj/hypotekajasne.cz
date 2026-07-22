import Link from "next/link";
import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { routes } from "@/lib/routes";

export const metadata: Metadata = buildPageMetadata({
  title: "Stránka nenalezena (404)",
  description:
    "Požadovaná stránka neexistuje nebo byla přesunuta. Pokračujte na úvod, témata hypoték nebo magazín.",
  path: "/404",
  noIndex: true,
});

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-start px-4 py-20 sm:px-6">
      <p className="text-xs font-bold uppercase tracking-wide text-deep-teal">
        404
      </p>
      <h1 className="mt-2 font-heading text-3xl font-bold text-text-dark">
        Stránka nenalezena
      </h1>
      <p className="mt-4 text-muted-foreground">
        Odkaz je neplatný, zastaralý, nebo stránka ještě neexistuje. Zkuste
        některou z hlavních sekcí níže.
      </p>
      <ul className="mt-8 space-y-2 text-sm font-semibold text-deep-teal">
        <li>
          <Link href={routes.home} className="underline">
            Domů
          </Link>
        </li>
        <li>
          <Link href={routes.temata} className="underline">
            Témata hypoték
          </Link>
        </li>
        <li>
          <Link href={routes.clanky} className="underline">
            Magazín
          </Link>
        </li>
        <li>
          <Link href={routes.mojeMoznosti} className="underline">
            Zjistit moje možnosti
          </Link>
        </li>
        <li>
          <Link href={routes.kontakt} className="underline">
            Kontakt
          </Link>
        </li>
      </ul>
    </div>
  );
}
