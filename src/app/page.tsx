import type { Metadata } from "next";
import { HomeExperience } from "@/components/home/HomeExperience";
import { JsonLdScript } from "@/components/seo/JsonLdScript";
import { HOME_FAQ_ITEMS } from "@/lib/faq/home-items";
import { getCachedHomeOffers } from "@/lib/mortgage-market/home-offers.server";
import { parseMortgageJourneyParams } from "@/lib/mortgage-rates/mortgage-journey-context";
import { faqPageJsonLd } from "@/lib/seo/json-ld";
import { rootMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = rootMetadata;

/** ISR — homepage offers refresh hourly; improves TTFB vs force-dynamic. */
export const revalidate = 3600;

function flattenSearchParams(
  raw: Record<string, string | string[] | undefined>
): Record<string, string> {
  const flat: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (value == null) continue;
    flat[key] = Array.isArray(value) ? (value[0] ?? "") : value;
  }
  return flat;
}

type HomeProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Home({ searchParams }: HomeProps) {
  const raw = await searchParams;
  const serverJourney = parseMortgageJourneyParams(flattenSearchParams(raw));
  const initialOffers = await getCachedHomeOffers();
  return (
    <>
      <JsonLdScript
        data={faqPageJsonLd(
          HOME_FAQ_ITEMS.map((item) => ({
            question: item.q,
            answer: item.a,
          }))
        )}
      />
      <HomeExperience
        initialOffers={initialOffers}
        serverJourney={serverJourney}
      />
    </>
  );
}
