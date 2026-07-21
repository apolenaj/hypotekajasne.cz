import type { CountryId } from "@/lib/calculators";
import type { CountryDossier } from "@/lib/country-dossier/types";
import { baliDossier } from "@/lib/country-dossier/countries/bali";
import { czDossier } from "@/lib/country-dossier/countries/cz";
import { dubaiDossier } from "@/lib/country-dossier/countries/dubai";
import {
  croatiaDossier,
  italyDossier,
  slovakiaDossier,
  spainDossier,
} from "@/lib/country-dossier/countries/eu";
import { saudiDossier } from "@/lib/country-dossier/countries/saudi";

export const COUNTRY_DOSSIERS: Record<CountryId, CountryDossier> = {
  cz: czDossier,
  dubai: dubaiDossier,
  spain: spainDossier,
  italy: italyDossier,
  croatia: croatiaDossier,
  bali: baliDossier,
  saudi: saudiDossier,
  slovakia: slovakiaDossier,
};

export function getCountryDossier(countryId: CountryId): CountryDossier {
  return COUNTRY_DOSSIERS[countryId];
}

export { buildExecutiveSnapshot } from "@/lib/country-dossier/market-snapshot";
export type { ExecutiveSnapshot, SnapshotField } from "@/lib/country-dossier/market-snapshot";

export type {
  CountryDossier,
  DossierSection,
  LegalClaim,
  DossierSectionId,
} from "@/lib/country-dossier/types";

export { DOSSIER_SECTION_IDS, DOSSIER_SECTION_TITLES } from "@/lib/country-dossier/types";
