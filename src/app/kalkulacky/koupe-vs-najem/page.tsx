import type { Metadata } from "next";
import Link from "next/link";
import { KalkulackyView } from "@/components/pages/KalkulackyView";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { crumbs } from "@/lib/seo/breadcrumbs";
import { getStaticPageSeo } from "@/lib/seo/pages";
import { routes } from "@/lib/routes";

export const metadata: Metadata = getStaticPageSeo(
  routes.kalkulacky.koupeVsNajem
);

export default function KoupeVsNajemPage() {
  return (
    <>
      <div className="border-b border-border bg-[#f7f8f7]">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={crumbs(
              { name: "Kalkulačky", path: routes.kalkulacky.root },
              {
                name: "Koupě vs. nájem",
                path: routes.kalkulacky.koupeVsNajem,
              }
            )}
          />
          <h1 className="mt-4 font-heading text-2xl font-bold tracking-tight text-text-dark sm:text-3xl">
            Koupě vs. nájem — vyplatí se hypotéka?
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Porovnejte náklady vlastního bydlení s hypotékou vůči nájmu a
            orientační vliv na čisté jmění. Jde o model pro vlastní bydlení — ne
            o investiční pronájem. Související nástroje:{" "}
            <Link
              href={routes.kalkulacky.hypotecniKalkulacka}
              className="font-medium text-deep-teal underline-offset-2 hover:underline"
            >
              hypoteční kalkulačka
            </Link>
            {" · "}
            <Link
              href={`${routes.temata}/koupe-vs-najem`}
              className="font-medium text-deep-teal underline-offset-2 hover:underline"
            >
              průvodce koupě vs. nájem
            </Link>
            .
          </p>
        </div>
      </div>
      <KalkulackyView />
    </>
  );
}
