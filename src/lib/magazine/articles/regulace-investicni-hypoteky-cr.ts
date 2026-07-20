import { routes } from "@/lib/routes";
import type { MagazineArticle } from "@/lib/magazine/types";

export const article: MagazineArticle = {
  slug: "regulace-investicni-hypoteky-cr",
  title: "Regulace a investiční hypotéky v ČR: limity, DSTI a firemní struktura",
  description:
    "Jak LTV/DSTI omezují škálování portfolia FO a kdy má smysl zvažovat s.r.o. — kvalifikovaně, bez fráze „s.r.o. je záchrana“.",
  category: "Investiční hypotéky",
  clusters: ["investicni-hypoteky", "cr", "hypoteky", "osvc"],
  authorId: "redakce-hj",
  reviewerId: "reviewer-compliance",
  publishedAt: "2026-07-01",
  updatedAt: "2026-07-19",
  factCheckedAt: "2026-07-19",
  country: "Česká republika",
  financialTopics: ["LTV", "DSTI", "DTI", "SPV", "s.r.o.", "DSCR"],
  featured: false,
  readingMinutes: 9,
  hero: {
    src: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    alt: "Moderní budovy — ilustrace",
  },
  body: [
    {
      type: "p",
      text: "Éra agresivního LTV u investičního bydlení na rodné číslo je pryč. Banky i makroobezřetnostní rámec ČNB (v čase se mění) omezují, kolik dluhu unese domácnost. To není konec investování — je to konec škálování bez finanční architektury.",
    },
    {
      type: "h2",
      id: "dsti-zed",
      text: "DSTI a kapacita domácnosti",
    },
    {
      type: "p",
      text: "I při dostatku akontace narazíte na podíl splátek k příjmu. Interní limity bank často pracují s pásmem kolem desítek procent — nejde o slib schválení. Zapomeňte-li na kreditky a leasing, model podceníte.",
    },
    {
      type: "h2",
      id: "sro-kvalifikovane",
      text: "Firemní struktura (s.r.o.) — možnost, ne „záchrana“",
    },
    {
      type: "p",
      text: "Převod portfolia do SPV / s.r.o. může otevřít komerční úvěrování posuzované spíš přes DSCR projektu než přes limity FO. Není to automatická záchrana: nesete náklady účetnictví, jiné ručení, delší onboarding a žádnou garanci úvěru. Pro někoho dává smysl; pro jiného je levnější zpomalit nákupy nebo zvýšit equity.",
    },
    {
      type: "callout",
      tone: "warn",
      text: "Nezakládejte s.r.o. jen kvůli marketingovému slibu „obejít ČNB“. Konzultujte daňového poradce a banku — podmínky se liší produkt od produktu.",
    },
    {
      type: "h2",
      id: "zahranici",
      text: "Alternativa: zahraniční alokace",
    },
    {
      type: "p",
      text: "Nákup v zahraničí z vlastních zdrojů se typicky nepropisuje do českých registrů stejně jako další CZ hypotéka. Stále ale nesete FX, právní a likviditní riziko — viz dossier zemí.",
    },
  ],
  sources: [
    { label: "Metodika LTV/DTI/DSTI", url: routes.metodika },
    { label: "Akademie: DSTI", url: "/akademie/dsti" },
    { label: "Akademie: LTV", url: "/akademie/ltv" },
  ],
  relatedTools: [
    { label: "Hypoteční připravenost", href: routes.navrhNaMiru },
    { label: "Akademie: DTI", href: "/akademie/dti" },
    { label: "Osobní investiční průvodce", href: routes.investicniPas },
  ],
  relatedArticleSlugs: [
    "urokove-sazby-hypotek-2026",
    "zahranicni-financovani-ceske-zajisteni",
  ],
};
