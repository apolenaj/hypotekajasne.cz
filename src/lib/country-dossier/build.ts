import { routes, getCountryGuidePath } from "@/lib/routes";
import type { CountryId } from "@/lib/calculators";
import {
  DOSSIER_SECTION_TITLES,
  type CountryDossier,
  type CtaSection,
  type DossierSection,
  type DossierSectionId,
  type LegalClaim,
  type NarrativeSection,
} from "@/lib/country-dossier/types";
import { LEGAL_REVIEW_AS_OF, NOT_LEGAL_ADVICE } from "@/lib/country-dossier/shared";

export function sectionTitle(id: DossierSectionId): string {
  return DOSSIER_SECTION_TITLES[id];
}

export function narrative(
  id: Extract<
    DossierSectionId,
    | "executive_summary"
    | "suitability"
    | "rental_tax"
    | "exit"
    | "inheritance"
    | "fx_risk"
    | "developer_risk"
    | "short_term_rentals"
  >,
  summary: string,
  bullets: NarrativeSection["bullets"]
): NarrativeSection {
  return {
    id,
    kind: "narrative",
    title: sectionTitle(id),
    summary,
    bullets,
  };
}

export function sourcesSection(
  lastLegalReview: LegalClaim,
  sources: LegalClaim[]
): DossierSection {
  return {
    id: "sources",
    kind: "sources",
    title: sectionTitle("sources"),
    summary:
      "Každé právní tvrzení výše má zdroj, datum a status. Níže souhrn kontroly.",
    lastLegalReview,
    sources: [NOT_LEGAL_ADVICE, ...sources],
  };
}

export function ctaSection(countryId: CountryId): CtaSection {
  return {
    id: "cta",
    kind: "cta",
    title: sectionTitle("cta"),
    summary:
      "Další krok je individuální ověření struktury koupě a financování — ne automatické schválení.",
    majetioHref: routes.oMajetio,
    majetioLabel: "Prohlédnout Majetio",
    financingHref: `${getCountryGuidePath(countryId)}#hypotecni-kalkulacka`,
    financingLabel: "Ověřit financování",
    disclaimer:
      "Kalkulačka a dossier jsou orientační. Schválení úvěru a právní způsobilost koupě vždy závisí na bance, developérovi a lokálním poradci.",
  };
}

export function reviewClaim(
  text: string,
  source: string,
  sourceUrl: string | null = null
): LegalClaim {
  return {
    text,
    source,
    sourceUrl,
    asOf: LEGAL_REVIEW_AS_OF,
    status: "VERIFIED",
    notes: null,
  };
}

export function modelledClaim(
  text: string,
  source: string,
  asOf = LEGAL_REVIEW_AS_OF
): LegalClaim {
  return {
    text,
    source,
    sourceUrl: null,
    asOf,
    status: "MODELLED",
    notes: "Orientační pásmo — ověřte lokálně.",
  };
}

export function assemble(
  countryId: CountryId,
  name: string,
  tagline: string,
  sections: DossierSection[]
): CountryDossier {
  const ids = sections.map((s) => s.id);
  const expected = Object.keys(DOSSIER_SECTION_TITLES);
  for (const id of expected) {
    if (!ids.includes(id as DossierSectionId)) {
      throw new Error(`Dossier ${countryId} missing section ${id}`);
    }
  }
  return { countryId, name, tagline, sections };
}
