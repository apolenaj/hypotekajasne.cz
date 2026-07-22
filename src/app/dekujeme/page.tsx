import { buildPageMetadata } from "@/lib/seo/metadata";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import {
  isLeadSource,
  LEAD_SOURCE_LABELS,
  type LeadSource,
} from "@/lib/leads";
import { getPartnerClaimLabels } from "@/lib/partners/verification";
import { routes } from "@/lib/routes";

export const metadata = buildPageMetadata({
  title: "Děkujeme | Hypotéka Jasně",
  description: "Vaše poptávka byla odeslána. Ozveme se do 24 hodin.",
  path: "/dekujeme",
  noIndex: true,
});

type PageProps = {
  searchParams: Promise<{ source?: string }>;
};

export default async function DekujemePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const source: LeadSource | null =
    params.source && isLeadSource(params.source) ? params.source : null;
  const sourceLabel = source ? LEAD_SOURCE_LABELS[source] : null;
  const thankYouHandoff = getPartnerClaimLabels().thankYouHandoff;

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-gradient-to-b from-slate-50 to-white px-4 py-16">
      <div className="w-full max-w-lg rounded-3xl border border-gray-100 bg-white p-10 text-center shadow-xl">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h1 className="font-heading text-2xl font-bold text-gray-900 md:text-3xl">
          Děkujeme za vaši poptávku
        </h1>
        <p className="mt-4 text-gray-600 leading-relaxed">
          {sourceLabel
            ? `Údaje z nástroje „${sourceLabel}“ jsme bezpečně přijali.`
            : "Vaše kontaktní údaje jsme bezpečně přijali."}{" "}
          {thankYouHandoff}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href={routes.home}
            className="inline-flex items-center justify-center rounded-full bg-emerald-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-800"
          >
            Zpět na úvod
          </Link>
          <Link
            href={routes.kalkulacky.root}
            className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-bold text-gray-800 transition hover:bg-gray-50"
          >
            Otevřít kalkulačku
          </Link>
        </div>
      </div>
    </div>
  );
}
