import { routes } from "@/lib/routes";
import type { MagazineArticle } from "@/lib/magazine/types";

export const article: MagazineArticle = {
  slug: "zahranicni-financovani-ceske-zajisteni",
  title: "Zahraniční nemovitost a české zajištění: co je realistické",
  description:
    "Jak oddělit lokální hypotéku, developer payment plan a americkou hypotéku — bez záměny produktů.",
  category: "Zahraniční financování",
  clusters: ["zahranicni-financovani", "hypoteky", "investicni-hypoteky"],
  authorId: "analytička-hj",
  reviewerId: "reviewer-compliance",
  publishedAt: "2026-07-15",
  updatedAt: "2026-07-15",
  factCheckedAt: "2026-07-15",
  country: null,
  financialTopics: ["americká hypotéka", "payment plan", "LTV", "zajištění"],
  featured: false,
  readingMinutes: 7,
  hero: {
    src: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    alt: "Klíče a smlouva — ilustrace",
  },
  body: [
    {
      type: "p",
      text: "Tři různé věci: (1) lokální hypotéka v cílové zemi, (2) splátkový kalendář developera, (3) úvěr v ČR se zástavou české nemovitosti. Zaměnit je v modelu vede k falešnému LTV.",
    },
    {
      type: "h2",
      id: "tri-cesty",
      text: "Tři cesty financování",
    },
    {
      type: "ul",
      items: [
        "Lokální hypotéka: dostupnost pro nerezidenty se liší (ES/IT často individuálně; Bali prakticky ne).",
        "Developer payment plan: není bankovní úvěr — jde o smluvní fáze.",
        "České zajištění: sazby bereme ze LIVE dat american_*, pokud jsou k dispozici.",
      ],
    },
    {
      type: "h2",
      id: "passport",
      text: "Financial Passport před discovery",
    },
    {
      type: "p",
      text: "Nejdřív kvalifikace (safe budget, purpose), teprve pak Majetio discovery. Handoff nepřenáší PII.",
    },
  ],
  sources: [
    { label: "O Majetio / Financial Passport", url: routes.oMajetio },
    { label: "Akademie: Americká hypotéka", url: "/akademie/americka-hypoteka" },
  ],
  relatedTools: [
    { label: "Hypoteční připravenost", href: routes.navrhNaMiru },
    { label: "Průvodce investora", href: routes.pruvodceInvestora },
  ],
  relatedArticleSlugs: [
    "dubaj-flipping-off-plan-realita",
    "spanelsko-apartmany-rizika-vynosy",
    "bali-leasehold-vynosy-rizika",
  ],
};
