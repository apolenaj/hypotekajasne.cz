import { routes } from "@/lib/routes";
import type { MagazineArticle } from "@/lib/magazine/types";

export const article: MagazineArticle = {
  slug: "refinancovani-po-fixaci-checklist",
  title: "Refinancování po konci fixace: checklist bez marketingu",
  description:
    "Co porovnat 3–6 měsíců před koncem fixace, jaké dokumenty připravit a jak neslibovat úsporu.",
  category: "Refinancování",
  clusters: ["refinancovani", "hypoteky", "cr"],
  authorId: "michal-heinzke",
  publishedAt: "2026-07-10",
  updatedAt: "2026-07-10",
  factCheckedAt: "2026-07-10",
  country: "Česká republika",
  financialTopics: ["fixace", "refinancování", "RPSN", "mimořádné splátky"],
  featured: false,
  readingMinutes: 6,
  hero: {
    src: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    alt: "Kalkulačka a dokumenty — ilustrace",
  },
  body: [
    {
      type: "p",
      text: "Konec fixace je přirozený moment porovnat nabídku stávající banky s trhem. Úspora není automatická — záleží na sankcích, poplatcích, RPSN a vaší bonitě.",
    },
    {
      type: "h2",
      id: "timeline",
      text: "Časová osa",
    },
    {
      type: "ul",
      items: [
        "6 měsíců předem: spočítejte zůstatek a aktuální DSTI.",
        "3 měsíce: vyžádejte si indikativní nabídky (bez slibu schválení).",
        "1 měsíc: rozhodněte o setrvání vs. převodu; připravte dokumenty.",
      ],
    },
    {
      type: "h2",
      id: "porovnani",
      text: "Co porovnat",
    },
    {
      type: "p",
      text: "Nejen sazbu: RPSN, pojištění, poplatky za odhad/čerpání, podmínky mimořádných splátek. Viz akademie RPSN a Hypoteční připravenost.",
    },
    {
      type: "callout",
      tone: "info",
      text: "Orientační model úspory ≠ schválený úvěr. Finální posouzení provádí banka.",
    },
  ],
  sources: [
    { label: "Akademie: Fixace", url: "/akademie/fixace" },
    { label: "Akademie: RPSN", url: "/akademie/rpsn" },
    { label: "Metodika", url: routes.metodika },
  ],
  relatedTools: [
    { label: "Hypoteční připravenost", href: routes.navrhNaMiru },
    { label: "Kalkulačky", href: routes.kalkulacky.root },
  ],
  relatedArticleSlugs: [
    "urokove-sazby-hypotek-2026",
    "regulace-investicni-hypoteky-cr",
  ],
};
