import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InvestorGuidePage } from "@/components/pages/InvestorGuidePage";
import { countryConfigs } from "@/lib/calculators";
import { getCountryIdFromSlug } from "@/lib/routes";

interface PageProps {
  params: Promise<{ stat: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { stat } = await params;
  const countryId = getCountryIdFromSlug(stat);
  if (!countryId) {
    return { title: "Průvodce investora | HypotékaJasně.cz" };
  }
  const label = countryConfigs[countryId].label;
  return {
    title: `Průvodce investora — ${label} | HypotékaJasně.cz`,
    description: `Kalkulačka, tržní analýza, financování a investiční průvodce pro trh: ${label}.`,
  };
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
  return <InvestorGuidePage countryId={countryId} />;
}
