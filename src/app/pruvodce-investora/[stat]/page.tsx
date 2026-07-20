import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InvestorGuidePage } from "@/components/pages/InvestorGuidePage";
import { countryConfigs } from "@/lib/calculators";
import { getCountryGuidePath, getCountryIdFromSlug } from "@/lib/routes";
import { buildPageMetadata } from "@/lib/seo/metadata";

interface PageProps {
  params: Promise<{ stat: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { stat } = await params;
  const countryId = getCountryIdFromSlug(stat);
  if (!countryId) {
    return buildPageMetadata({
      title: "Průvodce investora",
      description:
        "Investiční huby zahraničních trhů — financování, rizika a procesy.",
      path: "/pruvodce-investora",
      noIndex: true,
    });
  }
  const label = countryConfigs[countryId].label;
  return buildPageMetadata({
    title: `Průvodce investora — ${label}`,
    description: `Kalkulačka, tržní analýza, financování a investiční průvodce pro trh: ${label}. Data a zdroje, ne marketingové absolutní výroky.`,
    path: getCountryGuidePath(countryId),
  });
}

export function generateStaticParams() {
  return [
    { stat: "ceska-republika" },
    { stat: "dubaj" },
    { stat: "spanelsko" },
    { stat: "italie" },
    { stat: "chorvatsko" },
    { stat: "bali" },
    { stat: "saudska-arabie" },
    { stat: "slovensko" },
  ];
}

export default async function PruvodceStatPage({ params }: PageProps) {
  const { stat } = await params;
  const countryId = getCountryIdFromSlug(stat);
  if (!countryId) notFound();
  const { CountryViewTracker } = await import(
    "@/components/analytics/CountryViewTracker"
  );
  return (
    <>
      <CountryViewTracker countryId={countryId} />
      <InvestorGuidePage countryId={countryId} />
    </>
  );
}
