import { routes } from "@/lib/routes";
import type { MagazineArticle } from "@/lib/magazine/types";

export const article: MagazineArticle = {
  slug: "urokove-sazby-hypotek-2026",
  title: "Jak globální ekonomika ovlivní úrokové sazby hypoték v roce 2026",
  description:
    "Co znamená normalizace sazeb FEDu a ECB pro ČNB, fixace a investory do nemovitostí v ČR — bez slibu dna.",
  category: "Makroekonomika",
  clusters: ["hypoteky", "cr", "investicni-analyza", "refinancovani"],
  authorId: "josef-apolenar",
  reviewerId: "michal-heinzke",
  publishedAt: "2026-07-12",
  updatedAt: "2026-07-12",
  factCheckedAt: "2026-07-12",
  country: "Česká republika",
  financialTopics: ["sazby", "fixace", "ČNB", "refinancování"],
  featured: true,
  readingMinutes: 8,
  hero: {
    src: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    alt: "Grafy a finanční data — ilustrace",
  },
  body: [
    {
      type: "p",
      text: "Centrální banky po inflační vlně hledají „normální“ úroveň sazeb. Pro hypoteční klienty v ČR to neznamená automatický návrat ke 2 % — spíš otázku, jak nastavit fixaci a cash-flow v prostředí středních jednotek procent.",
    },
    {
      type: "h2",
      id: "mytus-2-procent",
      text: "Mýtus návratu ke 2 %",
    },
    {
      type: "p",
      text: "Období 2015–2020 bylo z historického pohledu anomálií. Orientovat se výhradně na návrat ke 2% hypotékám může vést k odkládání rozhodnutí, zatímco ceny aktiv se hýbou. Smysluplnější je porovnat aktuální nabídky bank se scénáři +1 / +2 p.b. po konci fixace.",
    },
    {
      type: "h2",
      id: "fixace-2026",
      text: "Fixace v roce 2026: krátká, nebo delší?",
    },
    {
      type: "p",
      text: "Volba fixace závisí na účelu a horizontu — nejde o univerzální doporučení:",
    },
    {
      type: "ul",
      items: [
        "Investice s důrazem na flexibilitu: kratší fixace (např. 3 roky) usnadní refinancování, ale zvyšuje riziko repricingu.",
        "Vlastní bydlení s prioritou jistoty: delší fixace snižuje nejistotu splátky; porovnejte cenu delší jistoty (peace-of-mind) vůči kratší sazbě.",
      ],
    },
    {
      type: "callout",
      tone: "info",
      text: "Nejde o investiční doporučení ani slib budoucích sazeb. Aktuální sazby berte ze LIVE dat bank / metodiky.",
    },
    {
      type: "h2",
      id: "zaver",
      text: "Praktický závěr",
    },
    {
      type: "p",
      text: "Čekání na „absolutní dno“ sazeb často znamená vyšší riziko na straně kupní ceny. Rozhodnutí opřete o DSTI kapacitu, LTV a scénáře — nástroje Hypoteční připravenosti a kalkulaček.",
    },
  ],
  sources: [
    { label: "Metodika sazeb Hypotéka Jasně", url: routes.metodika },
    {
      label: "Veřejné sazby sledovaných bank (LIVE / STALE dle katalogu)",
      note: "Konkrétní číslo vždy ověřte u banky.",
    },
  ],
  relatedTools: [
    { label: "Hypoteční kalkulačka", href: routes.kalkulacky.root },
    { label: "Hypoteční připravenost", href: routes.navrhNaMiru },
    { label: "Akademie: Fixace", href: "/akademie/fixace" },
  ],
  relatedArticleSlugs: [
    "regulace-investicni-hypoteky-cr",
    "refinancovani-po-fixaci-checklist",
  ],
};
