import type { Metadata } from "next";
import { KalkulackyView } from "@/components/pages/KalkulackyView";
import { JsonLdScript } from "@/components/seo/JsonLdScript";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { webApplicationJsonLd } from "@/lib/seo/json-ld";
import { routes } from "@/lib/routes";

export const metadata: Metadata = buildPageMetadata({
  title: "Hypoteční a investiční kalkulačky",
  description:
    "Interaktivní kalkulačky hypotéky, koupě vs. nájem a scénářů — modelové nástroje, ne nabídka banky.",
  path: routes.kalkulacky.root,
});

export default function KalkulackyPage() {
  return (
    <>
      <JsonLdScript
        data={webApplicationJsonLd({
          name: "Hypotéka Jasně kalkulačky",
          description:
            "Webové kalkulačky hypotéky a investic — orientační model, ne závazná nabídka.",
          path: routes.kalkulacky.root,
        })}
      />
      <KalkulackyView />
    </>
  );
}
