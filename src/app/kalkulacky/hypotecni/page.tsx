import type { Metadata } from "next";
import { KalkulackyView } from "@/components/pages/KalkulackyView";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { routes } from "@/lib/routes";

export const metadata: Metadata = buildPageMetadata({
  title: "Hypoteční kalkulačka",
  description:
    "Orientační hypoteční kalkulačka — splátka podle ceny, vlastních prostředků, splatnosti a modelové sazby. Nejde o nabídku banky.",
  path: routes.kalkulacky.hypotecniKalkulacka,
});

export default function HypotecniKalkulackaPage() {
  return <KalkulackyView initialTab="mortgage_calc" />;
}
