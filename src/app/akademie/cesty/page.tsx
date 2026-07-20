import type { Metadata } from "next";
import Link from "next/link";
import { AcademyPathsHub } from "@/components/academy/AcademyPathsHub";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { crumbs } from "@/lib/seo/breadcrumbs";
import { routes } from "@/lib/routes";

export const metadata: Metadata = buildPageMetadata({
  title: "Learning paths | Hypoteční akademie",
  description:
    "První bydlení, OSVČ, refinancování, investice, zahraničí — progress 0–100 %, badges bez streaků, education → tool.",
  path: `${routes.akademie}/cesty`,
});

export default function AcademyPathsPage() {
  return (
    <div className="bg-white">
      <div className="border-b border-border bg-[#f7f8f7]">
        <div className="mx-auto max-w-5xl px-4 py-3">
          <Breadcrumbs
            items={crumbs(
              { name: "Akademie", path: routes.akademie },
              { name: "Learning paths", path: `${routes.akademie}/cesty` }
            )}
          />
        </div>
      </div>
      <header className="border-b border-border bg-gradient-to-br from-[#0b3d3a] to-[#1a5c4a] text-white">
        <div className="mx-auto max-w-5xl px-4 py-12">
          <h1 className="font-heading text-3xl font-bold">Learning paths</h1>
          <p className="mt-2 max-w-xl text-sm text-white/85">
            Gamifikace bez infantilizace — smysluplný progress, ne casino streaks.
          </p>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-4 py-10">
        <Link href={routes.akademie} className="text-sm text-deep-teal underline">
          ← Pojmová akademie
        </Link>
        <div className="mt-8">
          <AcademyPathsHub />
        </div>
      </div>
    </div>
  );
}
