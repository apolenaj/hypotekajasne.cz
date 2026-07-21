import type { AuthorityKind, SourceTopic } from "@/lib/sources/types";

export const AUTHORITY_KIND_LABELS_CS: Record<AuthorityKind, string> = {
  regulator: "Regulátor",
  ministry: "Ministerstvo",
  central_bank: "Centrální banka",
  land_authority: "Katastr / land authority",
  tax_authority: "Daňová správa",
  official_statistics: "Oficiální statistika",
  court: "Soud / judikatura",
  other_official: "Jiná oficiální autorita",
};

export const SOURCE_TOPIC_LABELS_CS: Record<SourceTopic, string> = {
  rates: "Úrokové sazby",
  macroprudential: "Makroobezřetnost",
  ltv_dti_dsti: "LTV / DTI / DSTI",
  tax: "Daně",
  legal_ownership: "Vlastnictví / právo",
  cadastre: "Katastr",
  statistics: "Statistika",
  consumer_credit: "Spotřebitelský úvěr",
  fx: "Měna / FX",
  general: "Obecné",
};

export const JURISDICTION_LABELS_CS: Record<string, string> = {
  cz: "Česko",
  dubai: "SAE / Dubaj",
  spain: "Španělsko",
  italy: "Itálie",
  croatia: "Chorvatsko",
  bali: "Bali / Indonésie",
  saudi: "Saúdská Arábie",
  slovakia: "Slovensko",
  eu: "EU",
  multi: "Více jurisdikcí",
};
