import { routes } from "@/lib/routes";
import type { MagazineArticle } from "@/lib/magazine/types";

export const article: MagazineArticle = {
  slug: "dubaj-flipping-off-plan-realita",
  title: "Flipping off-plan v Dubaji: kde končí marketing a začíná model",
  description:
    "Tier developerů, DLD, service charges a proč payment plan není česká hypotéka — bez Instagramových slibů.",
  category: "Investiční analýza",
  clusters: ["dubaj", "zahranicni-financovani", "investicni-analyza"],
  authorId: "redakce-hj",
  publishedAt: "2026-07-05",
  updatedAt: "2026-07-05",
  factCheckedAt: "2026-07-05",
  country: "SAE (Dubaj)",
  financialTopics: ["off-plan", "DLD", "service charges", "payment plan"],
  featured: false,
  readingMinutes: 10,
  hero: {
    src: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    alt: "Dubaj skyline — ilustrace",
  },
  body: [
    {
      type: "p",
      text: "Marketing často slibuje „20 % down a flip se ziskem 50 %“. Takové scénáře mohou nastat u silné poptávky a ověřeného developera — nejsou však pravidlem. Bez plánu B (doplacení a pronájem) jde o spekulaci, ne o model.",
    },
    {
      type: "h2",
      id: "tier-developeri",
      text: "Track record developera",
    },
    {
      type: "p",
      text: "Rozdíl mezi etablovanými developery a méně prověřenými projekty je zásadní pro likviditu sekundárního trhu. Pokud developer stále prodává jednotky se agresivním payment planem, váš soukromý flip často nemůže konkurovat.",
    },
    {
      type: "h2",
      id: "naklady",
      text: "DLD a service charges",
    },
    {
      type: "p",
      text: "Absence daně z příjmu FO v běžném režimu neznamená nulové náklady. DLD poplatek a service charges mohou výrazně snížit čistý výsledek — zahrňte je do modelu před podpisem.",
    },
    {
      type: "h2",
      id: "financovani",
      text: "Financování z pohledu ČR",
    },
    {
      type: "p",
      text: "Developer payment plan ≠ bankovní hypotéka. České banky typicky nezastaví rozestavěný projekt v SAE. Časté cesty: cash, české zajištění (americká hypotéka), nebo kombinace — vždy dle produktu banky.",
    },
    {
      type: "callout",
      tone: "warn",
      text: "Nevstupujte do off-plan bez escrow / regulované ochrany plateb a bez kapitálu na dokončení.",
    },
  ],
  sources: [
    { label: "Dossier SAE (Dubaj)", url: `${routes.pruvodceInvestora}/dubaj` },
    { label: "Akademie: Off-plan", url: "/akademie/off-plan" },
    { label: "Katalog financování (developerské plány)", url: routes.metodika },
  ],
  relatedTools: [
    { label: "Průvodce — Dubaj", href: `${routes.pruvodceInvestora}/dubaj` },
    { label: "Investiční rentgen", href: routes.investicniRentgen },
    { label: "Akademie: Escrow", href: "/akademie/escrow" },
  ],
  relatedArticleSlugs: [
    "zahranicni-financovani-ceske-zajisteni",
    "spanelsko-apartmany-rizika-vynosy",
  ],
};
