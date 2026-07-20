import type { TopicalCluster } from "@/lib/magazine/types";

export const TOPICAL_CLUSTERS: {
  id: TopicalCluster;
  label: string;
  description: string;
}[] = [
  { id: "hypoteky", label: "Hypotéky", description: "Sazby, LTV, produkty, proces." },
  { id: "osvc", label: "OSVČ", description: "Dokládání příjmu a specifika OSVČ." },
  {
    id: "refinancovani",
    label: "Refinancování",
    description: "Konec fixace, převody, konsolidace.",
  },
  {
    id: "investicni-hypoteky",
    label: "Investiční hypotéky",
    description: "Účel investice, limity, cash-flow.",
  },
  {
    id: "zahranicni-financovani",
    label: "Zahraniční financování",
    description: "České zajištění, payment plans, lokální limity.",
  },
  { id: "cr", label: "ČR", description: "Domácí trh a regulace." },
  { id: "dubaj", label: "Dubaj", description: "SAE — off-plan, freehold zóny." },
  { id: "spanelsko", label: "Španělsko", description: "NIE, ITP, nerezidentské hypotéky." },
  { id: "italie", label: "Itálie", description: "Regionální rozdíly a proces koupě." },
  { id: "chorvatsko", label: "Chorvatsko", description: "Sezónnost, EUR, Schengen." },
  { id: "bali", label: "Bali", description: "Leasehold, výnosy, právní struktura." },
  {
    id: "saudska-arabie",
    label: "Saúdská Arábie",
    description: "Vision 2030, ownership pro cizince.",
  },
  { id: "slovensko", label: "Slovensko", description: "EUR, blízký právní rámec." },
  {
    id: "investicni-analyza",
    label: "Investiční analýza",
    description: "Yield, riziko, scénáře, due diligence.",
  },
];

export function getClusterLabel(id: TopicalCluster): string {
  return TOPICAL_CLUSTERS.find((c) => c.id === id)?.label ?? id;
}
