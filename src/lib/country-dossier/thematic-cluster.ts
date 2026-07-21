/**
 * Country SEO cluster: country → financing → taxes → ownership → calculators → academy.
 * Links stay on-page (#anchors) or to real public hubs — no orphan traps.
 */

import type { CountryId } from "@/lib/calculators";
import { getCountryGuidePath, routes } from "@/lib/routes";

export type ThematicClusterLink = {
  label: string;
  href: string;
  topic:
    | "financing"
    | "taxes"
    | "ownership"
    | "calculators"
    | "academy";
};

export function getCountryThematicCluster(
  countryId: CountryId
): ThematicClusterLink[] {
  const countryPath = getCountryGuidePath(countryId);
  return [
    {
      topic: "financing",
      label: "Financování na tomto trhu",
      href: `${countryPath}#financovani`,
    },
    {
      topic: "taxes",
      label: "Daně a daňový režim",
      href: `${countryPath}#dane`,
    },
    {
      topic: "ownership",
      label: "Vlastnictví a právo",
      href: `${countryPath}#vlastnictvi`,
    },
    {
      topic: "calculators",
      label: "Scénáře a kalkulačky",
      href: `${countryPath}#decision-lab`,
    },
    {
      topic: "calculators",
      label: "Hypoteční kalkulačky",
      href: routes.kalkulacky.root,
    },
    {
      topic: "academy",
      label: "Akademie: LTV",
      href: `${routes.akademie}/ltv`,
    },
    {
      topic: "academy",
      label: "Akademie: DSTI",
      href: `${routes.akademie}/dsti`,
    },
    {
      topic: "financing",
      label: "Mapa globálního financování",
      href: routes.globalFinancing,
    },
  ];
}
