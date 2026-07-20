import type { Metadata } from "next";
import { FaqView } from "@/components/sections/FaqView";
import { JsonLdScript } from "@/components/seo/JsonLdScript";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { FAQ_ITEMS } from "@/lib/faq/items";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { crumbs } from "@/lib/seo/breadcrumbs";
import { faqPageJsonLd } from "@/lib/seo/json-ld";
import { routes } from "@/lib/routes";

export const metadata: Metadata = buildPageMetadata({
  title: "FAQ — časté otázky",
  description:
    "Kdo jsme, zda jsou kalkulace závazné, jak funguje odměna a předání dat partnerům.",
  path: routes.faq,
});

export default function FaqPage() {
  return (
    <>
      <div className="border-b border-border bg-[#f7f8f7]">
        <div className="mx-auto max-w-3xl px-4 py-3">
          <Breadcrumbs items={crumbs({ name: "FAQ", path: routes.faq })} />
        </div>
      </div>
      <JsonLdScript
        data={faqPageJsonLd(
          FAQ_ITEMS.map((i) => ({ question: i.q, answer: i.a }))
        )}
      />
      <FaqView />
    </>
  );
}
