import { routes } from "@/lib/routes";
import type { MagazineArticle } from "@/lib/magazine/types";

export const article: MagazineArticle = {
  slug: "bali-leasehold-vynosy-rizika",
  title: "Bali: leasehold, výnosy a financování z ČR",
  description:
    "Proč cizinci typicky kupují leasehold, co modelovat v horizontu práv a proč lokální hypotéka obvykle není cesta.",
  category: "Zahraniční financování",
  clusters: ["bali", "zahranicni-financovani", "investicni-analyza"],
  authorId: "redakce-hj",
  reviewerId: "reviewer-compliance",
  publishedAt: "2026-07-03",
  updatedAt: "2026-07-03",
  factCheckedAt: "2026-07-03",
  country: "Bali (Indonésie)",
  financialTopics: ["leasehold", "yield", "americká hypotéka"],
  featured: false,
  readingMinutes: 9,
  hero: {
    src: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    alt: "Bali — ilustrace",
  },
  body: [
    {
      type: "p",
      text: "Poptávka po ubytování a remote work zvýšila ceny v oblíbených lokalitách. Modelované hrubé výnosy mohou vypadat atraktivně — ale leasehold má horizont a právní strukturu, kterou freehold v EU nemá.",
    },
    {
      type: "h2",
      id: "leasehold",
      text: "Leasehold není freehold",
    },
    {
      type: "p",
      text: "Cizinci často nabyjí časově omezená práva (typicky desítky let) s možností prolongace. Porovnávat cenu leaseholdu 1:1 s evropským freeholdem je chyba — modelujte zbývající roky a náklady prodloužení.",
    },
    {
      type: "h2",
      id: "financovani",
      text: "Financování",
    },
    {
      type: "p",
      text: "Lokální hypotéka pro cizince je prakticky nedostupná. Časté cesty: hotovost, developer plán, nebo české zajištění odděleně od bali aktiva. Nejde o slib schválení.",
    },
    {
      type: "callout",
      tone: "info",
      text: "Právní due diligence na titul a délku leasehold je nutnost — editorial tip, ne právní rada.",
    },
  ],
  sources: [
    { label: "Dossier Bali", url: `${routes.pruvodceInvestora}/bali` },
    { label: "Akademie: Freehold vs leasehold", url: "/akademie/freehold-vs-leasehold" },
  ],
  relatedTools: [
    { label: "Průvodce — Bali", href: `${routes.pruvodceInvestora}/bali` },
    { label: "Akademie: Americká hypotéka", href: "/akademie/americka-hypoteka" },
  ],
  relatedArticleSlugs: [
    "zahranicni-financovani-ceske-zajisteni",
    "dubaj-flipping-off-plan-realita",
  ],
};
